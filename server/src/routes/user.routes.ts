import { Router } from "express";
import UserController from "../controllers/User.controller";
import AuthController from "../controllers/Auth.controller";
import { asyncHandler } from "../utils/asyncHandler.utils";
import AuthMiddleware from "../middlewares/auth.middleware";

export const userRoutes = Router();

userRoutes.post("/register", asyncHandler(UserController.create));
userRoutes.post("/login", asyncHandler(AuthController.login));

userRoutes.use(asyncHandler(AuthMiddleware.verify));
userRoutes.get("/profile", asyncHandler(UserController.getProfile));
userRoutes.put("/profile", asyncHandler(UserController.updateProfile));
userRoutes.delete("/profile", asyncHandler(UserController.deleteProfile));
userRoutes.patch(
  "/profile/password",
  asyncHandler(UserController.updateMyPassword)
);
userRoutes.patch(
  "/profile/transaction-password",
  asyncHandler(UserController.updateMyTransactionPassword)
);

userRoutes.use(asyncHandler(AuthMiddleware.isAdmin));
userRoutes.get("/users", asyncHandler(UserController.listAll));
userRoutes.get("/users/:id", asyncHandler(UserController.getById));
userRoutes.put("/users/:id", asyncHandler(UserController.adminUpdateUser));
userRoutes.patch(
  "/users/:id/password",
  asyncHandler(UserController.adminResetPassword)
);
userRoutes.patch(
  "/users/:id/transaction-password",
  asyncHandler(UserController.adminResetTransactionPassword)
);
