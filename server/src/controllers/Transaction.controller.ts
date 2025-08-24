import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";
import { TransactionType } from "@prisma/client";

class TransactionController {
  async create(req: Request, res: Response) {
    const { id: userId } = req.user;
    const {
      accountId,
      type,
      value,
      transactionPassword,
      pixKey,
      recipientName: tedRecipientName,
      recipientDocument: tedRecipientDocument,
      recipientBank,
      recipientAgency,
      recipientAccount,
    } = req.body;

    if (!accountId || !type || !value || !transactionPassword) {
      throw new ApiError("error.transaction.requiredFields", 400);
    }

    const transferValue = new Decimal(value);
    if (transferValue.isNegative() || transferValue.isZero()) {
      throw new ApiError("error.transaction.positiveValue", 400);
    }

    const newTransaction = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const senderAccount = await tx.account.findUniqueOrThrow({
        where: { id: accountId, userId: userId },
      });

      const isPasswordCorrect = await bcrypt.compare(
        transactionPassword,
        sender.transactionPasswordHash
      );
      console.log({ isPasswordCorrect, transactionPassword, sender });

      if (!isPasswordCorrect) {
        throw new ApiError("error.transaction.invalidPassword", 403);
      }

      if (senderAccount.balance.lessThan(transferValue)) {
        throw new ApiError("error.transaction.insufficientFunds", 400);
      }

      const newSenderBalance = senderAccount.balance.minus(transferValue);
      await tx.account.update({
        where: { id: senderAccount.id },
        data: { balance: newSenderBalance },
      });

      let recipientName: string;
      let recipientDocument: string;

      if (type === "PIX") {
        if (!pixKey)
          throw new ApiError("error.transaction.pixKeyRequired", 400);

        const recipientPixKey = await tx.pixKey.findUnique({
          where: { value: pixKey },
          include: { account: { include: { user: true } } },
        });

        if (!recipientPixKey) {
          throw new ApiError("error.transaction.pixKeyNotFound", 404);
        }
        const recipientAccount = recipientPixKey.account;

        if (recipientAccount.id === senderAccount.id) {
          throw new ApiError("error.transaction.selfTransferNotAllowed", 400);
        }

        await tx.account.update({
          where: { id: recipientAccount.id },
          data: { balance: { increment: transferValue } },
        });

        recipientName = recipientAccount.user.name;
        const recipientDoc = await tx.document.findFirstOrThrow({
          where: { userId: recipientAccount.user.id },
        });
        recipientDocument = recipientDoc.value;
      } else if (type === "TED") {
        if (
          !tedRecipientName ||
          !tedRecipientDocument ||
          !recipientBank ||
          !recipientAgency ||
          !recipientAccount
        ) {
          throw new ApiError("error.transaction.tedDataRequired", 400);
        }
        recipientName = tedRecipientName;
        recipientDocument = tedRecipientDocument;
      } else {
        throw new ApiError("error.transaction.invalidType", 400);
      }

      const transaction = await tx.transaction.create({
        data: {
          accountId: senderAccount.id,
          type,
          value: transferValue,
          recipientName,
          recipientDocument,
          recipientBank,
          recipientAgency,
          recipientAccount,
          balanceAfterTransaction: newSenderBalance,
        },
      });

      return transaction;
    });

    return res.status(201).json(newTransaction);
  }

  async list(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { type, period, startDate, endDate, minValue, maxValue } =
      req.query as {
        type?: TransactionType;
        period?: string;
        startDate?: string;
        endDate?: string;
        minValue?: string;
        maxValue?: string;
      };
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    if (userAccounts.length === 0) {
      return res.status(200).json([]);
    }
    const accountIds = userAccounts.map((account) => account.id);
    const where: any = {
      accountId: { in: accountIds },
    };
    if (type) {
      where.type = type;
    }
    if (period) {
      const days = parseInt(period.replace("d", ""));
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      where.createdAt = { gte: dateFrom };
    } else if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (minValue || maxValue) {
      where.value = {};
      if (minValue) where.value.gte = new Decimal(minValue);
      if (maxValue) where.value.lte = new Decimal(maxValue);
    }
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json(transactions);
  }
}

export default new TransactionController();
