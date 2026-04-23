import { createContext, useContext, useMemo, useReducer } from 'react';

export type UserRole = 'Administrador' | 'Técnico';

export type EquipmentType = 'Escritorio' | 'Laptop' | 'Servidor' | 'Periféricos' | 'Teléfonos';
export type EquipmentStatus = 'disponible' | 'asignado' | 'mantenimiento' | 'dañado';

export type MaintenanceType = 'Preventivo' | 'Correctivo' | 'Limpieza' | 'Actualización';

export type HistoryKind = 'mantenimiento' | 'incidente';
export type HistoryStatus = 'resuelto' | 'en_proceso' | 'pendiente';

export type Account = {
  id: string;
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
  lastMaintenance?: string | null; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
};

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  status: HistoryStatus;
  createdAt: string; // YYYY-MM-DD
  closedAt?: string; // YYYY-MM-DD
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

type Action =
  | {
      type: 'ADD_EQUIPMENT';
      payload: {
        serialNumber: string;
        type: EquipmentType;
        brand: string;
        model: string;
        createdAt: string;
      };
    }
  | {
      type: 'ADD_ACCOUNT';
      payload: { name: string; email: string; role: UserRole };
    }
  | {
      type: 'DELETE_ACCOUNT';
      payload: { id: string };
    }
  | {
      type: 'ASSIGN_EQUIPMENT';
      payload: { equipmentId: string; userId: string; userName: string; area: string };
    }
  | {
      type: 'UNASSIGN_EQUIPMENT';
      payload: { equipmentId: string };
    }
  | {
      type: 'SET_EQUIPMENT_STATUS';
      payload: { equipmentId: string; status: EquipmentStatus };
    }
  | {
      type: 'REPORT_DAMAGE';
      payload: {
        equipmentId: string;
        date: string;
        description: string;
        technician?: string;
      };
    }
  | {
      type: 'REGISTER_MAINTENANCE';
      payload: {
        equipmentId: string;
        date: string;
        maintenanceType: MaintenanceType;
        description: string;
        technician?: string;
        close: boolean;
      };
    };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix: string): string {
  // Sufficient for an in-memory demo store.
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_EQUIPMENT': {
      const exists = state.equipments.some(
        (e) => e.serialNumber.trim().toLowerCase() === action.payload.serialNumber.trim().toLowerCase(),
      );
      if (exists) return state;

      const newEq: Equipment = {
        id: makeId('eq'),
        serialNumber: action.payload.serialNumber.trim(),
        type: action.payload.type,
        brand: action.payload.brand.trim(),
        model: action.payload.model.trim(),
        status: 'disponible',
        assignedTo: null,
        lastMaintenance: null,
        createdAt: action.payload.createdAt,
      };
      return { ...state, equipments: [newEq, ...state.equipments] };
    }
    case 'ADD_ACCOUNT': {
      const newAcc: Account = {
        id: makeId('acc'),
        name: action.payload.name.trim(),
        email: action.payload.email.trim(),
        role: action.payload.role,
      };
      return { ...state, accounts: [newAcc, ...state.accounts] };
    }
    case 'DELETE_ACCOUNT': {
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.payload.id) };
    }
    case 'ASSIGN_EQUIPMENT': {
      return {
        ...state,
        equipments: state.equipments.map((e) => {
          if (e.id !== action.payload.equipmentId) return e;
          return {
            ...e,
            status: 'asignado',
            assignedTo: {
              userId: action.payload.userId,
              name: action.payload.userName,
              area: action.payload.area,
            },
          };
        }),
      };
    }
    case 'UNASSIGN_EQUIPMENT': {
      return {
        ...state,
        equipments: state.equipments.map((e) => {
          if (e.id !== action.payload.equipmentId) return e;
          return { ...e, status: 'disponible', assignedTo: null };
        }),
      };
    }
    case 'SET_EQUIPMENT_STATUS': {
      return {
        ...state,
        equipments: state.equipments.map((e) => {
          if (e.id !== action.payload.equipmentId) return e;
          const next: Equipment = { ...e, status: action.payload.status };
          // Keep assignment only when explicitly assigned.
          if (action.payload.status !== 'asignado') next.assignedTo = null;
          return next;
        }),
      };
    }
    case 'REPORT_DAMAGE': {
      const eq = state.equipments.find((e) => e.id === action.payload.equipmentId);
      if (!eq) return state;

      const entry: HistoryEntry = {
        id: makeId('hist'),
        kind: 'incidente',
        status: 'pendiente',
        createdAt: action.payload.date,
        equipmentId: eq.id,
        equipmentSerialNumber: eq.serialNumber,
        title: `Equipo dañado (${eq.serialNumber})`,
        description: action.payload.description.trim(),
        technician: action.payload.technician,
      };

      return {
        ...state,
        equipments: state.equipments.map((e) =>
          e.id === eq.id ? { ...e, status: 'dañado', assignedTo: e.assignedTo ?? null } : e,
        ),
        history: [entry, ...state.history],
      };
    }
    case 'REGISTER_MAINTENANCE': {
      const eq = state.equipments.find((e) => e.id === action.payload.equipmentId);
      if (!eq) return state;

      const isClosed = action.payload.close;
      const entry: HistoryEntry = {
        id: makeId('hist'),
        kind: 'mantenimiento',
        status: isClosed ? 'resuelto' : 'en_proceso',
        createdAt: action.payload.date,
        closedAt: isClosed ? action.payload.date : undefined,
        equipmentId: eq.id,
        equipmentSerialNumber: eq.serialNumber,
        title: `${action.payload.maintenanceType} - ${eq.serialNumber}`,
        description: action.payload.description.trim(),
        maintenanceType: action.payload.maintenanceType,
        technician: action.payload.technician,
        resolution: isClosed ? action.payload.description.trim() : undefined,
      };

      return {
        ...state,
        equipments: state.equipments.map((e) => {
          if (e.id !== eq.id) return e;
          return {
            ...e,
            status: isClosed ? 'disponible' : 'mantenimiento',
            assignedTo: isClosed ? null : e.assignedTo ?? null,
            lastMaintenance: isClosed ? action.payload.date : e.lastMaintenance ?? null,
          };
        }),
        history: [entry, ...state.history],
      };
    }
    default:
      return state;
  }
}

function seedState(): State {
  const now = todayISO();
  const equipments: Equipment[] = [
    {
      id: 'eq-1',
      serialNumber: 'LAP-001',
      type: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5420',
      status: 'asignado',
      assignedTo: { userId: 'acc-2', name: 'Juan Pérez', area: 'Soporte' },
      lastMaintenance: '2025-12-01',
      createdAt: '2025-06-10',
    },
    {
      id: 'eq-2',
      serialNumber: 'DSK-002',
      type: 'Escritorio',
      brand: 'HP',
      model: 'EliteDesk 800',
      status: 'disponible',
      assignedTo: null,
      lastMaintenance: '2025-08-15',
      createdAt: '2025-05-12',
    },
    {
      id: 'eq-3',
      serialNumber: 'SRV-003',
      type: 'Servidor',
      brand: 'Dell',
      model: 'PowerEdge R740',
      status: 'mantenimiento',
      assignedTo: null,
      lastMaintenance: '2026-01-15',
      createdAt: '2024-11-22',
    },
    {
      id: 'eq-4',
      serialNumber: 'LAP-004',
      type: 'Laptop',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      status: 'dañado',
      assignedTo: null,
      lastMaintenance: null,
      createdAt: '2025-10-02',
    },
    {
      id: 'eq-8',
      serialNumber: 'LAP-008',
      type: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Pro 14',
      status: 'mantenimiento',
      assignedTo: null,
      lastMaintenance: '2026-02-10',
      createdAt: '2025-09-10',
    },
    {
      id: 'eq-9',
      serialNumber: 'TEL-009',
      type: 'Teléfonos',
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      status: 'disponible',
      assignedTo: null,
      lastMaintenance: '2025-07-01',
      createdAt: '2025-07-01',
    },
  ];

  const accounts: Account[] = [
    { id: 'acc-1', name: 'Carlos Mendoza', email: 'admin@empresa.com', role: 'Administrador' },
    { id: 'acc-2', name: 'Juan Pérez', email: 'juan.perez@empresa.com', role: 'Técnico' },
    { id: 'acc-3', name: 'Ana López', email: 'ana.lopez@empresa.com', role: 'Técnico' },
  ];

  const history: HistoryEntry[] = [
    {
      id: 'hist-1',
      kind: 'mantenimiento',
      status: 'resuelto',
      createdAt: '2026-02-10',
      closedAt: '2026-02-10',
      equipmentId: 'eq-8',
      equipmentSerialNumber: 'LAP-008',
      title: 'Actualización - LAP-008',
      description: 'Se aplicaron parches de seguridad y se actualizó el SO.',
      maintenanceType: 'Actualización',
      technician: 'Luis Rojas',
      resolution: 'Equipo verificado, sin alertas posteriores.',
    },
    {
      id: 'hist-2',
      kind: 'incidente',
      status: 'pendiente',
      createdAt: now,
      equipmentId: 'eq-4',
      equipmentSerialNumber: 'LAP-004',
      title: 'Equipo dañado (LAP-004)',
      description: 'Pantalla con parpadeo intermitente, requiere diagnóstico.',
    },
  ];

  return { equipments, accounts, history };
}

type Store = {
  state: State;
  addEquipment: (payload: {
    serialNumber: string;
    type: EquipmentType;
    brand: string;
    model: string;
    createdAt: string;
  }) => void;
  addAccount: (payload: { name: string; email: string; role: UserRole }) => void;
  deleteAccount: (id: string) => void;
  assignEquipment: (payload: { equipmentId: string; userId: string; userName: string; area: string }) => void;
  unassignEquipment: (equipmentId: string) => void;
  setEquipmentStatus: (payload: { equipmentId: string; status: EquipmentStatus }) => void;
  reportDamage: (payload: { equipmentId: string; date: string; description: string; technician?: string }) => void;
  registerMaintenance: (payload: {
    equipmentId: string;
    date: string;
    maintenanceType: MaintenanceType;
    description: string;
    technician?: string;
    close: boolean;
  }) => void;
};

const AppStoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, seedState);

  const store = useMemo<Store>(() => {
    return {
      state,
      addEquipment: (payload) => dispatch({ type: 'ADD_EQUIPMENT', payload }),
      addAccount: (payload) => dispatch({ type: 'ADD_ACCOUNT', payload }),
      deleteAccount: (id) => dispatch({ type: 'DELETE_ACCOUNT', payload: { id } }),
      assignEquipment: (payload) => dispatch({ type: 'ASSIGN_EQUIPMENT', payload }),
      unassignEquipment: (equipmentId) => dispatch({ type: 'UNASSIGN_EQUIPMENT', payload: { equipmentId } }),
      setEquipmentStatus: (payload) => dispatch({ type: 'SET_EQUIPMENT_STATUS', payload }),
      reportDamage: (payload) => dispatch({ type: 'REPORT_DAMAGE', payload }),
      registerMaintenance: (payload) => dispatch({ type: 'REGISTER_MAINTENANCE', payload }),
    };
  }, [state]);

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): Store {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

export const MAINTENANCE_TYPES: MaintenanceType[] = ['Preventivo', 'Correctivo', 'Limpieza', 'Actualización'];

export function monthsSince(dateISO: string, nowISO: string): number {
  // Approx-month diff without external deps.
  const d1 = new Date(dateISO);
  const d2 = new Date(nowISO);
  const years = d2.getFullYear() - d1.getFullYear();
  const months = d2.getMonth() - d1.getMonth();
  const total = years * 12 + months;
  // If the current day is earlier in the month, count as not fully elapsed.
  if (d2.getDate() < d1.getDate()) return total - 1;
  return total;
}

export function isPreventiveDue(lastMaintenanceISO: string | null | undefined, nowISO: string): boolean {
  if (!lastMaintenanceISO) return true;
  return monthsSince(lastMaintenanceISO, nowISO) >= 6;
}
