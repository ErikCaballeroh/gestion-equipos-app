import { createAccount } from "../services/accountService";
import { Account } from "../types/account";

export const registerAccount = async (data: any) => {
    // Validaciones
    if (!data.name) throw new Error("Nombre requerido");
    if (!data.email) throw new Error("Email requerido");

    if (!["Administrador", "Tecnico"].includes(data.rol)) {
        throw new Error("Rol inválido");
    }

    const newAccount: Account = {
        name: data.name,
        email: data.email,
        rol: data.rol,
        createdAt: new Date()
    };

    return await createAccount(newAccount);
};