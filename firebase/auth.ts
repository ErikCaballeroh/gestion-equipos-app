import { deleteApp, initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User
} from "firebase/auth";

import { auth } from "./config";

// Registrar usuario
export const register = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

// Registrar usuario con una app secundaria para no cambiar la sesión actual.
export const registerWithSecondaryAuth = async (email: string, password: string) => {
    const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
        throw new Error("Configuración de Firebase incompleta");
    }

    const appName = `secondary-auth-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, appName);

    try {
        const secondaryAuth = getAuth(secondaryApp);
        const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        await signOut(secondaryAuth);
        return credential;
    } finally {
        await deleteApp(secondaryApp);
    }
};

// Login
export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = async () => {
    return await signOut(auth);
};

// Escuchar cambios de autenticación.
export const subscribeAuthState = (listener: (user: User | null) => void) => {
    return onAuthStateChanged(auth, listener);
};

// Obtener el usuario actual autenticado.
export const getCurrentUser = () => auth.currentUser;