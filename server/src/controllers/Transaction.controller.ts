import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

class TransactionController {
  async create(req: Request, res: Response) {
    const { id: userId } = req.user;
    const {
      accountId: originAccountId, // Renomeamos para clareza
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

    if (!originAccountId || !type || !value || !transactionPassword) {
      throw new ApiError("error.transaction.requiredFields", 400);
    }

    const transferValue = new Decimal(value);
    if (transferValue.isNegative() || transferValue.isZero()) {
      throw new ApiError("error.transaction.positiveValue", 400);
    }

    const newTransaction = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const senderAccount = await tx.account.findUniqueOrThrow({
        where: { id: originAccountId, userId: userId },
      });

      const isPasswordCorrect = await bcrypt.compare(
        transactionPassword,
        sender.transactionPasswordHash
      );

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

      let finalRecipientName: string;
      let finalRecipientDocument: string;
      let finalRecipientBank: string | undefined;
      let finalRecipientAgency: string | undefined;
      let finalRecipientAccount: string | undefined;
      let destinationAccountId: string | undefined = undefined;

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
        const recipientAccountData = recipientPixKey.account;

        if (recipientAccountData.id === senderAccount.id) {
          throw new ApiError("error.transaction.selfTransferNotAllowed", 400);
        }

        await tx.account.update({
          where: { id: recipientAccountData.id },
          data: { balance: { increment: transferValue } },
        });

        const recipientDoc = await tx.document.findFirstOrThrow({
          where: { userId: recipientAccountData.user.id },
        });

        destinationAccountId = recipientAccountData.id;
        finalRecipientName = recipientAccountData.user.name;
        finalRecipientDocument = recipientDoc.value;
        finalRecipientBank = "341";
        finalRecipientAgency = recipientAccountData.agency;
        finalRecipientAccount = `${recipientAccountData.number}-${recipientAccountData.digit}`;
      } else if (type === "TED" || type === "DEPOSIT") {
        if (
          type === "TED" &&
          (!tedRecipientName ||
            !tedRecipientDocument ||
            !recipientBank ||
            !recipientAgency ||
            !recipientAccount)
        ) {
          throw new ApiError("error.transaction.tedDataRequired", 400);
        }
        finalRecipientName =
          type === "DEPOSIT" ? "Depósito em Conta" : tedRecipientName;
        finalRecipientDocument =
          type === "DEPOSIT"
            ? (await tx.document.findFirstOrThrow({ where: { userId } })).value
            : tedRecipientDocument;
        finalRecipientBank = recipientBank;
        finalRecipientAgency = recipientAgency;
        finalRecipientAccount = recipientAccount;
      } else {
        throw new ApiError("error.transaction.invalidType", 400);
      }

      const transaction = await tx.transaction.create({
        data: {
          originAccountId: senderAccount.id,
          destinationAccountId,
          type,
          value: transferValue,
          date: new Date(),
          recipientName: finalRecipientName,
          recipientDocument: finalRecipientDocument,
          recipientBank: finalRecipientBank,
          recipientAgency: finalRecipientAgency,
          recipientAccount: finalRecipientAccount,
          balanceAfterTransaction: newSenderBalance,
        },
      });

      return transaction;
    });

    return res.status(201).json(newTransaction);
  }

  async list(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { accountId, period } = req.query as {
      accountId?: string;
      period?: string;
    };

    if (!accountId) {
      throw new ApiError("error.transaction.accountIdRequired", 400);
    }

    await prisma.account.findFirstOrThrow({ where: { id: accountId, userId } });

    const whereClause: any = {
      OR: [{ originAccountId: accountId }, { destinationAccountId: accountId }],
    };

    if (period) {
      const days = parseInt(period.replace("d", ""));
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      whereClause.date = { gte: dateFrom };
    }

    // 👇 A CORREÇÃO PRINCIPAL ESTÁ AQUI
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      // Incluímos os dados das contas de origem e destino
      include: {
        originAccount: {
          include: {
            user: {
              select: { name: true }, // Selecionamos apenas o nome do utilizador
            },
          },
        },
        destinationAccount: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.status(200).json(transactions);
  }
}

export default new TransactionController();
