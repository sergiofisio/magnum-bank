// server/src/controllers/AuthController.ts
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError("error.auth.requiredFields", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: {
        documents: true,
        phones: true,
        addresses: true,
        accounts: {
          include: {
            pixKey: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError("error.auth.invalidCredentials", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      throw new ApiError("error.auth.invalidCredentials", 401);
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: "1d",
      }
    );

    const {
      passwordHash: _,
      transactionPasswordHash: __,
      ...userResponse
    } = user;

    return res.status(200).json({
      user: userResponse,
      token,
    });
  }
}

export default new AuthController();
