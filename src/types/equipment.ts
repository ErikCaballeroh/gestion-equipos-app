export type EquipmentType =
    | "Escritorio"
    | "Laptop"
    | "Servidor"
    | "Perifericos"
    | "Telefonos";

export type EquipmentStatus =
    | "Disponible"
    | "Asignado"
    | "En mantenimiento"
    | "Dañado";

export type Area =
    | "Desarrollo inmoviliario"
    | "Proyectos de Construccion"
    | "Area de operaciones y administracion de propiedades"
    | "Logistica y almacenamiento"
    | "Comercial y ventas"
    | "Atencion al cliente"
    | "Tecnica"
    | "Administracion y finanzas";

export interface Equipment {
    id?: string;
    serialNumber: string;
    type: EquipmentType;
    status: EquipmentStatus;
    purchaseDate: Date;
    provider: string;

    idEmployee?: string | null;
    nameEmployee?: string | null;
    area?: Area | null;

    lastMaintenance?: Date | null;
    createdAt?: Date;
}