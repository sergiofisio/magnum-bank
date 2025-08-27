import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";
import { generateUniqueAccount } from "../utils/account.utils";
import { TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

class AccountController {
  async create(req: Request, res: Response) {
    const { id: userId } = req.user;
    const newAccountData = await generateUniqueAccount();

    const newAccount = await prisma.account.create({
      data: {
        userId,
        agency: newAccountData.agency,
        number: newAccountData.number,
        digit: newAccountData.digit,
        balance: 0,
      },
    });

    return res.status(201).json(newAccount);
  }

  async list(req: Request, res: Response) {
    const { id: userId } = req.user;
    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        pixKeys: {
          select: { id: true, type: true, value: true },
        },
      },
    });
    return res.status(200).json(accounts);
  }

  async show(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { accountId } = req.params;

    const account = await prisma.account.findFirstOrThrow({
      where: { id: accountId, userId },
      include: {
        pixKeys: true,
        OriginTransactions: {
          orderBy: { date: "desc" },
          take: 5,
        },
        DestinationTransactions: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });

    return res.status(200).json(account);
  }

  async delete(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { accountId } = req.params;

    const account = await prisma.account.findFirstOrThrow({
      where: { id: accountId, userId },
    });

    if (!new Decimal(account.balance).isZero()) {
      throw new ApiError("error.account.cannotDeleteWithBalance", 400);
    }

    await prisma.account.delete({
      where: { id: accountId, userId },
    });

    return res.status(204).send();
  }

  async deposit(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { accountId } = req.params;
    const { value } = req.body;

    if (!value) {
      throw new ApiError("error.deposit.valueRequired", 400);
    }

    const depositValue = new Decimal(value);
    if (depositValue.isNegative() || depositValue.isZero()) {
      throw new ApiError("error.deposit.positiveValue", 400);
    }

    const depositTransaction = await prisma.$transaction(async (tx) => {
      await tx.account.findFirstOrThrow({
        where: { id: accountId, userId },
      });

      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: depositValue,
          },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          originAccountId: accountId,
          type: TransactionType.DEPOSIT,
          value: depositValue,
          date: new Date(),
          recipientName: req.user.name,
          recipientDocument: req.user.documents[0]?.value || "",
          balanceAfterTransaction: updatedAccount.balance,
        },
      });

      return transaction;
    });

    return res.status(200).json(depositTransaction);
  }
}

export default new AccountController();
