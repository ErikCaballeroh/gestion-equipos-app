import { getCurrentUser, registerWithSecondaryAuth, subscribeAuthState } from '@/firebase/auth';
import { addDocument, deleteDocument, subscribeCollection, updateDocument } from '@/firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'Administrador' | 'Técnico';

export type EquipmentType = 'Escritorio' | 'Laptop' | 'Servidor' | 'Periféricos' | 'Teléfonos';
export type EquipmentStatus = 'disponible' | 'asignado' | 'mantenimiento' | 'dañado';

export type MaintenanceType = 'Preventivo' | 'Correctivo' | 'Limpieza' | 'Actualización';

export type HistoryKind = 'mantenimiento' | 'incidente';
export type HistoryStatus = 'resuelto' | 'en_proceso' | 'pendiente';

export type Account = {
    id: string;
    uid?: string;
    name: string;
    email: string;
    role: UserRole;
};

export type Equipment = {
    id: string;
    serialNumber: string;
    type: EquipmentType;
    brand: string;
    model: string;
    status: EquipmentStatus;
    assignedTo?: {
        userId: string;
        name: string;
        area: string;
    } | null;
    lastMaintenance?: string | null;
    createdAt: string;
};

export type HistoryEntry = {
    id: string;
    kind: HistoryKind;
    status: HistoryStatus;
    createdAt: string;
    closedAt?: string;
    equipmentId: string;
    equipmentSerialNumber: string;
    title: string;
    description: string;
    technician?: string;
    maintenanceType?: MaintenanceType;
    resolution?: string;
};

type State = {
    equipments: Equipment[];
    accounts: Account[];
    history: HistoryEntry[];
};

function emptyState(): State {
    return { equipments: [], accounts: [], history: [] };
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function normalizeText(value: unknown): string {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function toISODate(value: unknown, fallback: string = todayISO()): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
        const maybeDate = value.toDate();
        if (maybeDate instanceof Date) {
            return maybeDate.toISOString().slice(0, 10);
        }
    }

    return fallback;
}

function normalizeRole(value: unknown): UserRole {
    const normalized = normalizeText(value);
    return normalized.includes('admin') ? 'Administrador' : 'Técnico';
}

function normalizeEquipmentType(value: unknown): EquipmentType {
    const normalized = normalizeText(value);

    if (normalized === 'escritorio') return 'Escritorio';
    if (normalized === 'laptop') return 'Laptop';
    if (normalized === 'servidor') return 'Servidor';
    if (normalized === 'perifericos' || normalized === 'periferico') return 'Periféricos';
    if (normalized === 'telefonos' || normalized === 'telefono') return 'Teléfonos';

    return 'Laptop';
}

function normalizeEquipmentStatus(value: unknown): EquipmentStatus {
    const normalized = normalizeText(value);

    if (normalized.includes('asign')) return 'asignado';
    if (normalized.includes('mantenimiento')) return 'mantenimiento';
    if (normalized.includes('dan') || normalized.includes('da')) return 'dañado';

    return 'disponible';
}

function normalizeHistoryKind(value: unknown): HistoryKind {
    const normalized = normalizeText(value);
    return normalized.includes('incid') ? 'incidente' : 'mantenimiento';
}

function normalizeHistoryStatus(value: unknown): HistoryStatus {
    const normalized = normalizeText(value);

    if (normalized.includes('resuelto')) return 'resuelto';
    if (normalized.includes('proceso')) return 'en_proceso';

    return 'pendiente';
}

function normalizeMaintenanceType(value: unknown): MaintenanceType | undefined {
    const normalized = normalizeText(value);

    if (normalized === 'preventivo') return 'Preventivo';
    if (normalized === 'correctivo') return 'Correctivo';
    if (normalized === 'limpieza') return 'Limpieza';
    if (normalized === 'actualizacion') return 'Actualización';

    return undefined;
}

function mapAccount(id: string, data: Record<string, unknown>): Account {
    return {
        id,
        uid: typeof data.uid === 'string' ? data.uid : undefined,
        name: String(data.name ?? '').trim(),
        email: String(data.email ?? '').trim().toLowerCase(),
        role: normalizeRole(data.role ?? data.rol),
    };
}

function mapEquipment(id: string, data: Record<string, unknown>): Equipment {
    const assignedToRaw = data.assignedTo;
    const assignedTo =
        assignedToRaw && typeof assignedToRaw === 'object'
            ? {
                userId: String((assignedToRaw as { userId?: unknown }).userId ?? ''),
                name: String((assignedToRaw as { name?: unknown }).name ?? ''),
                area: String((assignedToRaw as { area?: unknown }).area ?? ''),
            }
            : null;

    const status = normalizeEquipmentStatus(data.status);

    return {
        id,
        serialNumber: String(data.serialNumber ?? '').trim(),
        type: normalizeEquipmentType(data.type),
        brand: String(data.brand ?? data.provider ?? '').trim(),
        model: String(data.model ?? '').trim(),
        status,
        assignedTo: status === 'asignado' ? assignedTo : null,
        lastMaintenance: data.lastMaintenance ? toISODate(data.lastMaintenance) : null,
        createdAt: toISODate(data.createdAt),
    };
}

function mapHistory(id: string, data: Record<string, unknown>): HistoryEntry {
    const equipmentSerialNumber =
        typeof data.equipmentSerialNumber === 'string' && data.equipmentSerialNumber.trim().length > 0
            ? data.equipmentSerialNumber
            : String(data.equipmentId ?? 'Equipo');

    return {
        id,
        kind: normalizeHistoryKind(data.kind),
        status: normalizeHistoryStatus(data.status),
        createdAt: toISODate(data.createdAt),
        closedAt: data.closedAt ? toISODate(data.closedAt) : undefined,
        equipmentId: String(data.equipmentId ?? ''),
        equipmentSerialNumber,
        title: String(data.title ?? 'Registro de historial'),
        description: String(data.description ?? ''),
        technician: typeof data.technician === 'string' ? data.technician : undefined,
        maintenanceType: normalizeMaintenanceType(data.maintenanceType),
        resolution: typeof data.resolution === 'string' ? data.resolution : undefined,
    };
}

type Store = {
    state: State;
    isAuthReady: boolean;
    currentAccount: Account | null;
    addEquipment: (payload: {
        serialNumber: string;
        type: EquipmentType;
        brand: string;
        model: string;
        createdAt: string;
    }) => Promise<void>;
    updateEquipment: (payload: {
        equipmentId: string;
        serialNumber: string;
        type: EquipmentType;
        brand: string;
        model: string;
    }) => Promise<void>;
    deleteEquipment: (equipmentId: string) => Promise<void>;
    addAccount: (payload: { name: string; email: string; role: UserRole; password: string }) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    assignEquipment: (payload: { equipmentId: string; userId: string; userName: string; area: string }) => Promise<void>;
    unassignEquipment: (equipmentId: string) => Promise<void>;
    setEquipmentStatus: (payload: { equipmentId: string; status: EquipmentStatus }) => Promise<void>;
    reportDamage: (payload: { equipmentId: string; date: string; description: string; technician?: string }) => Promise<void>;
    registerMaintenance: (payload: {
        equipmentId: string;
        date: string;
        maintenanceType: MaintenanceType;
        description: string;
        technician?: string;
        close: boolean;
    }) => Promise<void>;
};

const AppStoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<State>(emptyState);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [currentUid, setCurrentUid] = useState<string | null>(getCurrentUser()?.uid ?? null);

    useEffect(() => {
        const unsubscribe = subscribeAuthState((user) => {
            setCurrentUid(user?.uid ?? null);
            setIsAuthReady(true);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribers: (() => void)[] = [];

        if (!currentUid) {
            setState(emptyState());
            return () => {
                for (const unsubscribe of unsubscribers) unsubscribe();
            };
        }

        unsubscribers.push(
            subscribeCollection(
                'equipments',
                (documents) => {
                    const equipments = documents
                        .map((item) => mapEquipment(item.id, item as Record<string, unknown>))
                        .filter((item) => item.serialNumber.length > 0)
                        .sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));

                    setState((prev) => ({ ...prev, equipments }));
                },
                (error) => {
                    console.error('Error al leer equipos:', error);
                },
            ),
        );

        unsubscribers.push(
            subscribeCollection(
                'accounts',
                (documents) => {
                    const accounts = documents
                        .map((item) => mapAccount(item.id, item as Record<string, unknown>))
                        .filter((item) => item.email.length > 0)
                        .sort((a, b) => a.name.localeCompare(b.name));

                    setState((prev) => ({ ...prev, accounts }));
                },
                (error) => {
                    console.error('Error al leer cuentas:', error);
                },
            ),
        );

        unsubscribers.push(
            subscribeCollection(
                'history',
                (documents) => {
                    const history = documents
                        .map((item) => mapHistory(item.id, item as Record<string, unknown>))
                        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

                    setState((prev) => ({ ...prev, history }));
                },
                (error) => {
                    console.error('Error al leer historial:', error);
                },
            ),
        );

        return () => {
            for (const unsubscribe of unsubscribers) unsubscribe();
        };
    }, [currentUid]);

    const currentAccount = useMemo(() => {
        if (!currentUid) return null;

        const byUid = state.accounts.find((account) => account.uid === currentUid);
        if (byUid) return byUid;

        const email = getCurrentUser()?.email?.toLowerCase() ?? '';
        if (!email) return null;

        return state.accounts.find((account) => account.email.toLowerCase() === email) ?? null;
    }, [currentUid, state.accounts]);

    const store = useMemo<Store>(() => {
        return {
            state,
            isAuthReady,
            currentAccount,
            addEquipment: async (payload) => {
                const serialNumber = payload.serialNumber.trim();
                const brand = payload.brand.trim();
                const model = payload.model.trim();

                if (!serialNumber) throw new Error('Número de serie requerido');
                if (!brand || !model) throw new Error('Marca y modelo son requeridos');

                const exists = state.equipments.some(
                    (equipment) => equipment.serialNumber.toLowerCase() === serialNumber.toLowerCase(),
                );

                if (exists) {
                    throw new Error('Ya existe un equipo con ese número de serie');
                }

                const createdAt = payload.createdAt || todayISO();
                const reference = await addDocument('equipments', {
                    serialNumber,
                    type: payload.type,
                    brand,
                    model,
                    status: 'disponible',
                    assignedTo: null,
                    lastMaintenance: null,
                    createdAt,
                });

                setState((prev) => ({
                    ...prev,
                    equipments: [
                        {
                            id: reference.id,
                            serialNumber,
                            type: payload.type,
                            brand,
                            model,
                            status: 'disponible',
                            assignedTo: null,
                            lastMaintenance: null,
                            createdAt,
                        },
                        ...prev.equipments.filter((item) => item.id !== reference.id),
                    ],
                }));
            },
            updateEquipment: async (payload) => {
                const serialNumber = payload.serialNumber.trim();
                const brand = payload.brand.trim();
                const model = payload.model.trim();

                if (!serialNumber) throw new Error('Número de serie requerido');
                if (!brand || !model) throw new Error('Marca y modelo son requeridos');

                const existing = state.equipments.find((equipment) => equipment.id === payload.equipmentId);
                if (!existing) throw new Error('Equipo no encontrado');

                const duplicatedSerial = state.equipments.some(
                    (equipment) =>
                        equipment.id !== payload.equipmentId &&
                        equipment.serialNumber.toLowerCase() === serialNumber.toLowerCase(),
                );
                if (duplicatedSerial) throw new Error('Ya existe otro equipo con ese número de serie');

                await updateDocument('equipments', payload.equipmentId, {
                    serialNumber,
                    type: payload.type,
                    brand,
                    model,
                });

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.map((equipment) =>
                        equipment.id === payload.equipmentId
                            ? {
                                ...equipment,
                                serialNumber,
                                type: payload.type,
                                brand,
                                model,
                            }
                            : equipment,
                    ),
                }));
            },
            deleteEquipment: async (equipmentId) => {
                const existing = state.equipments.find((equipment) => equipment.id === equipmentId);
                if (!existing) throw new Error('Equipo no encontrado');
                if (existing.status === 'asignado') {
                    throw new Error('No se puede eliminar un equipo asignado. Desasígnalo primero');
                }

                await deleteDocument('equipments', equipmentId);

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.filter((equipment) => equipment.id !== equipmentId),
                }));
            },
            addAccount: async (payload) => {
                const name = payload.name.trim();
                const email = payload.email.trim().toLowerCase();
                const password = payload.password.trim();

                if (!name) throw new Error('Nombre requerido');
                if (!email) throw new Error('Email requerido');
                if (!password) throw new Error('Contraseña requerida');
                if (password.length < 6) throw new Error('La contraseña debe tener mínimo 6 caracteres');

                const exists = state.accounts.some((account) => account.email.toLowerCase() === email);
                if (exists) throw new Error('Ya existe una cuenta con ese correo');

                const credential = await registerWithSecondaryAuth(email, password);

                const reference = await addDocument('accounts', {
                    uid: credential.user.uid,
                    name,
                    email,
                    role: payload.role,
                    createdAt: todayISO(),
                });

                setState((prev) => ({
                    ...prev,
                    accounts: [
                        {
                            id: reference.id,
                            uid: credential.user.uid,
                            name,
                            email,
                            role: payload.role,
                        },
                        ...prev.accounts.filter((item) => item.id !== reference.id),
                    ],
                }));
            },
            deleteAccount: async (id) => {
                const isAssigned = state.equipments.some((equipment) => equipment.assignedTo?.userId === id);
                if (isAssigned) {
                    throw new Error('No se puede eliminar una cuenta con equipos asignados');
                }

                await deleteDocument('accounts', id);

                setState((prev) => ({
                    ...prev,
                    accounts: prev.accounts.filter((item) => item.id !== id),
                }));
            },
            assignEquipment: async (payload) => {
                await updateDocument('equipments', payload.equipmentId, {
                    status: 'asignado',
                    assignedTo: {
                        userId: payload.userId,
                        name: payload.userName,
                        area: payload.area,
                    },
                });

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.map((item) =>
                        item.id === payload.equipmentId
                            ? {
                                ...item,
                                status: 'asignado',
                                assignedTo: {
                                    userId: payload.userId,
                                    name: payload.userName,
                                    area: payload.area,
                                },
                            }
                            : item,
                    ),
                }));
            },
            unassignEquipment: async (equipmentId) => {
                await updateDocument('equipments', equipmentId, {
                    status: 'disponible',
                    assignedTo: null,
                });

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.map((item) =>
                        item.id === equipmentId
                            ? {
                                ...item,
                                status: 'disponible',
                                assignedTo: null,
                            }
                            : item,
                    ),
                }));
            },
            setEquipmentStatus: async (payload) => {
                const existing = state.equipments.find((equipment) => equipment.id === payload.equipmentId);
                if (!existing) throw new Error('Equipo no encontrado');

                await updateDocument('equipments', payload.equipmentId, {
                    status: payload.status,
                    assignedTo: payload.status === 'asignado' ? existing.assignedTo ?? null : null,
                });

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.map((item) =>
                        item.id === payload.equipmentId
                            ? {
                                ...item,
                                status: payload.status,
                                assignedTo: payload.status === 'asignado' ? item.assignedTo ?? null : null,
                            }
                            : item,
                    ),
                }));
            },
            reportDamage: async (payload) => {
                const equipment = state.equipments.find((item) => item.id === payload.equipmentId);
                if (!equipment) throw new Error('Equipo no encontrado');

                await updateDocument('equipments', equipment.id, {
                    status: 'dañado',
                });

                const technician = payload.technician ?? currentAccount?.name ?? getCurrentUser()?.email ?? 'Sin técnico';
                const historyRef = await addDocument('history', {
                    kind: 'incidente',
                    status: 'pendiente',
                    createdAt: payload.date,
                    equipmentId: equipment.id,
                    equipmentSerialNumber: equipment.serialNumber,
                    title: `Equipo dañado (${equipment.serialNumber})`,
                    description: payload.description.trim(),
                    technician,
                });

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.map((item) =>
                        item.id === equipment.id
                            ? {
                                ...item,
                                status: 'dañado',
                            }
                            : item,
                    ),
                    history: [
                        {
                            id: historyRef.id,
                            kind: 'incidente',
                            status: 'pendiente',
                            createdAt: payload.date,
                            equipmentId: equipment.id,
                            equipmentSerialNumber: equipment.serialNumber,
                            title: `Equipo dañado (${equipment.serialNumber})`,
                            description: payload.description.trim(),
                            technician,
                        },
                        ...prev.history.filter((item) => item.id !== historyRef.id),
                    ],
                }));
            },
            registerMaintenance: async (payload) => {
                const equipment = state.equipments.find((item) => item.id === payload.equipmentId);
                if (!equipment) throw new Error('Equipo no encontrado');

                const isClosed = payload.close;

                await updateDocument('equipments', equipment.id, {
                    status: isClosed ? 'disponible' : 'mantenimiento',
                    assignedTo: isClosed ? null : equipment.assignedTo ?? null,
                    lastMaintenance: isClosed ? payload.date : equipment.lastMaintenance ?? null,
                });

                const technician = payload.technician ?? currentAccount?.name ?? getCurrentUser()?.email ?? 'Sin técnico';
                const historyRef = await addDocument('history', {
                    kind: 'mantenimiento',
                    status: isClosed ? 'resuelto' : 'en_proceso',
                    createdAt: payload.date,
                    closedAt: isClosed ? payload.date : null,
                    equipmentId: equipment.id,
                    equipmentSerialNumber: equipment.serialNumber,
                    title: `${payload.maintenanceType} - ${equipment.serialNumber}`,
                    description: payload.description.trim(),
                    maintenanceType: payload.maintenanceType,
                    technician,
                    resolution: isClosed ? payload.description.trim() : null,
                });

                setState((prev) => ({
                    ...prev,
                    equipments: prev.equipments.map((item) =>
                        item.id === equipment.id
                            ? {
                                ...item,
                                status: isClosed ? 'disponible' : 'mantenimiento',
                                assignedTo: isClosed ? null : item.assignedTo ?? null,
                                lastMaintenance: isClosed ? payload.date : item.lastMaintenance ?? null,
                            }
                            : item,
                    ),
                    history: [
                        {
                            id: historyRef.id,
                            kind: 'mantenimiento',
                            status: isClosed ? 'resuelto' : 'en_proceso',
                            createdAt: payload.date,
                            closedAt: isClosed ? payload.date : undefined,
                            equipmentId: equipment.id,
                            equipmentSerialNumber: equipment.serialNumber,
                            title: `${payload.maintenanceType} - ${equipment.serialNumber}`,
                            description: payload.description.trim(),
                            maintenanceType: payload.maintenanceType,
                            technician,
                            resolution: isClosed ? payload.description.trim() : undefined,
                        },
                        ...prev.history.filter((item) => item.id !== historyRef.id),
                    ],
                }));
            },
        };
    }, [state, isAuthReady, currentAccount]);

    return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): Store {
    const context = useContext(AppStoreContext);
    if (!context) throw new Error('useAppStore must be used within AppStoreProvider');
    return context;
}

export const MAINTENANCE_TYPES: MaintenanceType[] = ['Preventivo', 'Correctivo', 'Limpieza', 'Actualización'];

export function monthsSince(dateISO: string, nowISO: string): number {
    const d1 = new Date(dateISO);
    const d2 = new Date(nowISO);
    const years = d2.getFullYear() - d1.getFullYear();
    const months = d2.getMonth() - d1.getMonth();
    const total = years * 12 + months;

    if (d2.getDate() < d1.getDate()) return total - 1;
    return total;
}

export function isPreventiveDue(lastMaintenanceISO: string | null | undefined, nowISO: string): boolean {
    if (!lastMaintenanceISO) return true;
    return monthsSince(lastMaintenanceISO, nowISO) >= 6;
}
