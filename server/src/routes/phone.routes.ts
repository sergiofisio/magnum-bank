import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import PhoneController from "../controllers/Phone.controller";

export const phoneRoutes = Router();

phoneRoutes.post("/", asyncHandler(PhoneController.create));
phoneRoutes.get("/", asyncHandler(PhoneController.list));
phoneRoutes.put("/:phoneId", asyncHandler(PhoneController.update));
phoneRoutes.delete("/:phoneId", asyncHandler(PhoneController.delete));
