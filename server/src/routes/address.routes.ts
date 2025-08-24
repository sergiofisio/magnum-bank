import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import AddressController from "../controllers/Address.controller";

export const addressRoutes = Router();

addressRoutes.post("/", asyncHandler(AddressController.create));
addressRoutes.get("/", asyncHandler(AddressController.list));
addressRoutes.put("/:addressId", asyncHandler(AddressController.update));
addressRoutes.delete("/:addressId", asyncHandler(AddressController.delete));
