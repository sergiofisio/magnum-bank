import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import PixKeyController from "../controllers/PixKey.controller";

export const pixKeyRoutes = Router();

pixKeyRoutes.post("/", asyncHandler(PixKeyController.create));

pixKeyRoutes.get(
  "/account/:accountId",
  asyncHandler(PixKeyController.listByAccount)
);

pixKeyRoutes.delete("/:keyId", asyncHandler(PixKeyController.delete));
