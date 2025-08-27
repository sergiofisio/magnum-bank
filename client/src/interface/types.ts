export type Role = "USER" | "ADMIN";
export type TransactionType = "PIX" | "TED" | "DEPOSIT";
export type PixKeyType = "CPF" | "email" | "phone" | "random";

export interface Document {
  id: string;
  type: string;
  value: string;
}

export interface Phone {
  id: string;
  type: string;
  countryCode: number;
  areaCode: number;
  number: string;
}

export interface Address {
  id: string;
  type: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface PixKey {
  id: string;
  type: PixKeyType;
  value: string;
}

export interface Account {
  id: string;
  agency: string;
  number: string;
  digit: string;
  balance: string;
  pixKeys?: PixKey[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  accounts: Account[];
  documents: Document[];
  phones: Phone[];
  addresses: Address[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  value: string;
  recipientName: string;
  date: string;
  balanceAfterTransaction: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface TransactionAccountInfo {
  id: string;
  user: {
    name: string;
  };
}

export interface Transaction {
  id: string;
  type: TransactionType;
  value: string;
  date: string;
  balanceAfterTransaction: string;

  originAccountId: string;
  originAccount: TransactionAccountInfo;
  destinationAccountId?: string | null;
  destinationAccount?: TransactionAccountInfo | null;

  recipientName: string;
  recipientDocument: string;
}
