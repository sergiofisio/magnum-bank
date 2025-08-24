import { User, Document, Role } from "@prisma/client";

type UserPayload = Omit<User, "passwordHash" | "transactionPasswordHash"> & {
  documents: Document[];
};

declare global {
  namespace Express {
    export interface Request {
      user: UserPayload;
    }
  }
}
