import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";

class PixKeyController {
  async create(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { accountId, type, value } = req.body;

    if (!accountId || !type || !value) {
      throw new ApiError("error.pixKey.requiredFields", 400);
    }

    const account = await prisma.account.findFirstOrThrow({
      where: { id: accountId, userId },
    });

    const newPixKey = await prisma.pixKey.create({
      data: {
        accountId: account.id,
        type,
        value,
      },
    });

    return res.status(201).json(newPixKey);
  }

  async listByAccount(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { accountId } = req.params;

    await prisma.account.findFirstOrThrow({
      where: { id: accountId, userId },
    });

    const pixKeys = await prisma.pixKey.findMany({
      where: { accountId },
    });

    return res.status(200).json(pixKeys);
  }

  async delete(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { keyId } = req.params;

    const keyToDelete = await prisma.pixKey.findFirstOrThrow({
      where: {
        id: keyId,
        account: {
          userId: userId,
        },
      },
    });

    await prisma.pixKey.delete({
      where: { id: keyToDelete.id },
    });

    return res.status(204).send();
  }
}

export default new PixKeyController();
