import { createEquipment } from "../services/equipmentService";
import { Equipment } from "../types/equipment";

const validTypes = [
    "Escritorio",
    "Laptop",
    "Servidor",
    "Perifericos",
    "Telefonos"
];

const validStatus = [
    "Disponible",
    "Asignado",
    "En mantenimiento",
    "Dañado"
];

export const registerEquipment = async (data: any) => {
    // Validaciones básicas
    if (!data.serialNumber) throw new Error("Número de serie requerido");
    if (!data.provider) throw new Error("Proveedor requerido");

    if (!validTypes.includes(data.type)) {
        throw new Error("Tipo inválido");
    }

    if (!validStatus.includes(data.status)) {
        throw new Error("Estado inválido");
    }

    // Lógica de negocio
    if (data.status === "Asignado") {
        if (!data.idEmployee || !data.nameEmployee) {
            throw new Error("Equipo asignado requiere empleado");
        }
    }

    if (data.status === "Disponible") {
        data.idEmployee = null;
        data.nameEmployee = null;
        data.area = null;
    }

    const newEquipment: Equipment = {
        serialNumber: data.serialNumber,
        type: data.type,
        status: data.status,
        purchaseDate: new Date(data.purchaseDate),
        provider: data.provider,
        idEmployee: data.idEmployee ?? null,
        nameEmployee: data.nameEmployee ?? null,
        area: data.area ?? null,
        lastMaintenance: data.lastMaintenance
            ? new Date(data.lastMaintenance)
            : null,
        createdAt: new Date()
    };

    return await createEquipment(newEquipment);
};