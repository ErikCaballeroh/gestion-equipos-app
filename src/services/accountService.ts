import { addDocument, getCollection } from "@/firebase/firestore";
import { Account } from "../types/account";

const COLLECTION = "accounts";

export const createAccount = async (data: Account) => {
    return await addDocument(COLLECTION, data);
};

export const getAccounts = async () => {
    return await getCollection(COLLECTION);
};