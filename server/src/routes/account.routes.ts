import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import AccountController from "../controllers/Account.controller";

export const accountRoutes = Router();

accountRoutes.post("/", asyncHandler(AccountController.create));
accountRoutes.get("/", asyncHandler(AccountController.list));
accountRoutes.get("/:accountId", asyncHandler(AccountController.show));
accountRoutes.delete("/:accountId", asyncHandler(AccountController.delete));
