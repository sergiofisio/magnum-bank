import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import TransactionController from "../controllers/Transaction.controller";

export const transactionRoutes = Router();

transactionRoutes.post("/", asyncHandler(TransactionController.create));
transactionRoutes.get("/", asyncHandler(TransactionController.list));
