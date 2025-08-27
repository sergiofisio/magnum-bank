import { NextFunction, Request, Response } from "express";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { ApiError } from "../errors/ApiError";
import { prisma } from "../lib/prisma";

class AuthMiddleware {
  async verify(req: Request, _: Response, next: NextFunction) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET não foi definido nas variáveis de ambiente.");
      return next(new ApiError("error.secret", 500));
    }

    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError("Token não fornecido ou mal formatado.", 401);
      }

      const token = authHeader.substring(7);

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        include: {
          documents: true,
          phones: true,
          addresses: true,
          accounts: {
            include: {
              pixKeys: true,
            },
          },
        },
      });

      if (!user)
        throw new ApiError("Acesso Negado: Usuário não encontrado.", 401);

      const { passwordHash: _, ...userWithoutPassword } = user;

      req.user = userWithoutPassword;

      return next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(new ApiError("error.token.exp", 401));
      }
      if (error instanceof JsonWebTokenError) {
        return next(new ApiError("error.token.inv", 401));
      }

      return next(error);
    }
  }

  isAdmin(req: Request, _: Response, next: NextFunction) {
    const { role } = req.user;

    if (role !== "ADMIN") {
      throw new ApiError("error.admin", 403);
    }

    return next();
  }
}

export default new AuthMiddleware();
