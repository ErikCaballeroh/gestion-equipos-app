export type UserRole = "Administrador" | "Tecnico";

export interface Account {
    id?: string;
    name: string;
    email: string;
    rol: UserRole;
    createdAt?: Date;
}