import { Router } from "express";
import { userRoutes } from "./routes/user.routes";
import { transactionRoutes } from "./routes/transaction.routes";
import { asyncHandler } from "./utils/asyncHandler.utils";
import AuthMiddleware from "./middlewares/auth.middleware";
import { pixKeyRoutes } from "./routes/pixKey.routes";
import { addressRoutes } from "./routes/address.routes";
import { phoneRoutes } from "./routes/phone.routes";
import { accountRoutes } from "./routes/account.routes";

const mainRoutes = Router();

mainRoutes.use("/user", userRoutes);

mainRoutes.use(asyncHandler(AuthMiddleware.verify));

mainRoutes.use("/transactions", transactionRoutes);
mainRoutes.use("/pix-keys", pixKeyRoutes);
mainRoutes.use("/addresses", addressRoutes);
mainRoutes.use("/phones", phoneRoutes);
mainRoutes.use("/accounts", accountRoutes);

export { mainRoutes };
