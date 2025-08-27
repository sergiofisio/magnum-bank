// server/src/controllers/AuthController.ts
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { DocumentType } from "@prisma/client";

class AuthController {
  async login(req: Request, res: Response) {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
      throw new ApiError("error.auth.requiredFields", 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        isActive: true,
        documents: {
          some: {
            type: DocumentType.CPF,
            value: cpf,
          },
        },
      },
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
