import { addDocument, getCollection } from "@/firebase/firestore";
import { Equipment } from "../types/equipment";

const COLLECTION = "equipments";

export const createEquipment = async (data: Equipment) => {
    return await addDocument(COLLECTION, data);
};

export const getEquipments = async () => {
    return await getCollection(COLLECTION);
};