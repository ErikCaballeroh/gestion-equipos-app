import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from "firebase/firestore";

import { db } from "./config";

// Crear documento
export const addDocument = async (collectionName: string, data: any) => {
    return await addDoc(collection(db, collectionName), data);
};

// Obtener todos los documentos
export const getCollection = async (collectionName: string) => {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Obtener por campo
export const getByField = async (
    collectionName: string,
    field: string,
    value: any
) => {
    const q = query(collection(db, collectionName), where(field, "==", value));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Obtener por ID
export const getById = async (collectionName: string, id: string) => {
    const ref = doc(db, collectionName, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
        id: snap.id,
        ...snap.data()
    };
};