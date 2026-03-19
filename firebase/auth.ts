import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

import { auth } from "./config";

// Registrar usuario
export const register = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

// Login
export const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = async () => {
    return await signOut(auth);
};