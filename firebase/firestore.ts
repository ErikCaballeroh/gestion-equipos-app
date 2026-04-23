import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    updateDoc,
    where
} from "firebase/firestore";

import { db } from "./config";

// Crear documento
export const addDocument = async (collectionName: string, data: any) => {
    return await addDoc(collection(db, collectionName), data);
};

// Suscribirse en tiempo real a una colección.
export const subscribeCollection = (
    collectionName: string,
    onData: (documents: Array<{ id: string;[key: string]: any }>) => void,
    onError?: (error: Error) => void
) => {
    return onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
            onData(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
            );
        },
        (error) => {
            if (onError) onError(error as Error);
        }
    );
};

// Actualizar un documento por ID.
export const updateDocument = async (collectionName: string, id: string, data: any) => {
    return await updateDoc(doc(db, collectionName, id), data);
};

// Eliminar un documento por ID.
export const deleteDocument = async (collectionName: string, id: string) => {
    return await deleteDoc(doc(db, collectionName, id));
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