import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../errors/ApiError";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";
import { generateUniqueAccount } from "../utils/account.utils";

async function logAudit(action: string, req: Request, targetUserId: string) {
  const actor = req.user;
  await prisma.auditLog.create({
    data: {
      action,
      targetUserId: targetUserId,
      actorUserId: actor.id,
      actorName: actor.name,
      ipAddress: req.ip ?? "Unknown IP",
      userAgent: req.headers["user-agent"] || "Unknown User Agent",
    },
  });
}

class UserController {
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      password,
      transactionPassword,
      documents,
      phones,
      addresses,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !transactionPassword ||
      !documents ||
      !documents[0].value
    ) {
      throw new ApiError("error.user.requiredFields", 400);
    }

    const userEmailExists = await prisma.user.findFirst({
      where: { email, isActive: true },
    });
    if (userEmailExists) {
      throw new ApiError("error.user.emailExists", 409);
    }

    const userDocumentExists = await prisma.user.findFirst({
      where: {
        documents: { some: { value: documents[0].value } },
        isActive: true,
      },
    });
    if (userDocumentExists) {
      throw new ApiError("error.user.documentExists", 409);
    }

    const newAccountData = await generateUniqueAccount();
    const passwordHash = await bcrypt.hash(password, 8);
    const transactionPasswordHash = await bcrypt.hash(transactionPassword, 8);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        transactionPasswordHash,
        documents: {
          create: documents.map((doc: any) => ({
            type: doc.type,
            value: doc.value,
          })),
        },
        phones: {
          create: phones?.map((phone: any) => ({
            type: phone.type,
            countryCode: phone.countryCode,
            areaCode: phone.areaCode,
            number: phone.number,
          })),
        },
        addresses: {
          create: addresses?.map((address: any) => ({
            type: address.type,
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
          })),
        },
        accounts: {
          create: [
            {
              agency: newAccountData.agency,
              number: newAccountData.number,
              digit: newAccountData.digit,
              balance: 0,
            },
          ],
        },
      },
      include: {
        documents: true,
        phones: true,
        addresses: true,
        accounts: true,
      },
    });

    const {
      passwordHash: _,
      transactionPasswordHash: __,
      ...userResponse
    } = newUser;
    return res.status(201).json(userResponse);
  }

  async listAll(_: Request, res: Response) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await prisma.user.findUniqueOrThrow({
      where: { id, isActive: true },
      include: {
        documents: true,
        phones: true,
        addresses: true,
        accounts: {
          select: {
            id: true,
            balance: true,
            agency: true,
            number: true,
            digit: true,
          },
        },
      },
    });
    const {
      passwordHash: _,
      transactionPasswordHash: __,
      ...userResponse
    } = user;
    return res.status(200).json(userResponse);
  }

  async getProfile(req: Request, res: Response) {
    const { id } = req.user;
    const user = await prisma.user.findUniqueOrThrow({
      where: { id, isActive: true },
      include: {
        documents: true,
        phones: true,
        addresses: true,
        accounts: {
          select: {
            id: true,
            balance: true,
            agency: true,
            number: true,
            digit: true,
          },
        },
      },
    });
    const {
      passwordHash: _,
      transactionPasswordHash: __,
      ...userResponse
    } = user;
    return res.status(200).json(userResponse);
  }

  async updateProfile(req: Request, res: Response) {
    const { id } = req.user;
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id, isActive: true },
      data: { name, email },
      select: { id: true, name: true, email: true },
    });
    await logAudit("UPDATE_PROFILE", req, id);
    return res.status(200).json(user);
  }

  async updateMyPassword(req: Request, res: Response) {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError("error.password.requiredFields", 400);
    }
    const user = await prisma.user.findUniqueOrThrow({
      where: { id, isActive: true },
    });
    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );
    if (!isPasswordCorrect) {
      throw new ApiError("error.password.incorrectOld", 401);
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 8);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });
    await logAudit("UPDATE_MY_PASSWORD", req, id);
    return res.status(204).send();
  }

  async updateMyTransactionPassword(req: Request, res: Response) {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError("error.password.requiredFields", 400);
    }
    const user = await prisma.user.findUniqueOrThrow({
      where: { id, isActive: true },
    });
    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.transactionPasswordHash
    );
    if (!isPasswordCorrect) {
      throw new ApiError("error.transactionPassword.incorrectOld", 401);
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 8);
    await prisma.user.update({
      where: { id },
      data: { transactionPasswordHash: newPasswordHash },
    });
    await logAudit("UPDATE_MY_TRANSACTION_PASSWORD", req, id);
    return res.status(204).send();
  }

  async deleteProfile(req: Request, res: Response) {
    const { id } = req.user;
    await prisma.user.update({
      where: { id, isActive: true },
      data: { isActive: false, deleteDate: new Date() },
    });
    await logAudit("DEACTIVATE_OWN_ACCOUNT", req, id);
    return res.status(204).send();
  }

  async adminUpdateUser(req: Request, res: Response) {
    const { id: targetUserId } = req.params;
    const { name, email, role } = req.body as {
      name?: string;
      email?: string;
      role?: Role;
    };
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId, isActive: true },
      data: { name, email, role },
      select: { id: true, name: true, email: true, role: true },
    });
    await logAudit("ADMIN_UPDATE_USER", req, targetUserId);
    return res.status(200).json(updatedUser);
  }

  async adminResetPassword(req: Request, res: Response) {
    const { id: targetUserId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      throw new ApiError("error.password.newRequired", 400);
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 8);
    await prisma.user.update({
      where: { id: targetUserId, isActive: true },
      data: { passwordHash: newPasswordHash },
    });
    await logAudit("ADMIN_RESET_PASSWORD", req, targetUserId);
    return res.status(204).send();
  }

  async adminResetTransactionPassword(req: Request, res: Response) {
    const { id: targetUserId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      throw new ApiError("error.transactionPassword.newRequired", 400);
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 8);
    await prisma.user.update({
      where: { id: targetUserId, isActive: true },
      data: { transactionPasswordHash: newPasswordHash },
    });
    await logAudit("ADMIN_RESET_TRANSACTION_PASSWORD", req, targetUserId);
    return res.status(204).send();
  }
}

export default new UserController();
