import {
  PrismaClient,
  Role,
  DocumentType,
  PhoneType,
  AddressType,
  PixKeyType,
  TransactionType,
  User,
  Account,
  PixKey,
  Document,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function calculateCheckDigit(accountNumber: string): string {
  const weights = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < accountNumber.length; i++) {
    sum += parseInt(accountNumber[i]) * weights[i % weights.length];
  }
  const remainder = sum % 11;
  const digit = 11 - remainder;

  if (digit === 10) return "X";
  if (digit === 11) return "0";
  return digit.toString();
}

async function generateUniqueAccount() {
  let isUnique = false;
  let agency = "";
  let number = "";

  while (!isUnique) {
    agency = Math.floor(1000 + Math.random() * 9000).toString();
    number = Math.floor(100000 + Math.random() * 900000).toString();

    const existingAccount = await prisma.account.findUnique({
      where: { agency_number: { agency, number } },
    });

    if (!existingAccount) {
      isUnique = true;
    }
  }
  const digit = calculateCheckDigit(number);
  return { agency, number, digit };
}

function generateRandomPhone() {
  const phoneTypes = [PhoneType.MOBILE, PhoneType.HOME, PhoneType.WORK];
  const areaCodes = [11, 21, 31, 41, 51];

  return {
    type: phoneTypes[Math.floor(Math.random() * phoneTypes.length)],
    countryCode: 55,
    areaCode: areaCodes[Math.floor(Math.random() * areaCodes.length)],
    number: Math.floor(900000000 + Math.random() * 100000000).toString(),
  };
}

function generateRandomAddress() {
  const addressTypes = [AddressType.RESIDENTIAL, AddressType.COMMERCIAL];
  const streets = [
    "Rua das Flores",
    "Avenida Principal",
    "Praça da Liberdade",
    "Alameda dos Anjos",
  ];
  const neighborhoods = ["Centro", "Bela Vista", "Pinheiros", "Vila Madalena"];

  return {
    type: addressTypes[Math.floor(Math.random() * addressTypes.length)],
    street: streets[Math.floor(Math.random() * streets.length)],
    number: Math.floor(100 + Math.random() * 1900).toString(),
    neighborhood:
      neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
    city: "São Paulo",
    state: "SP",
    country: "BR",
    zipcode: `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(
      100 + Math.random() * 900
    )}`,
  };
}

async function main() {
  console.log("🌱 Iniciando o processo de seed...");

  console.log("🧹 Limpando o banco de dados...");
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.pixKey.deleteMany();
  await prisma.account.deleteMany();
  await prisma.address.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Banco de dados limpo.");

  console.log("🙋‍♂️ Criando usuários e contas...");
  const usersData = [
    { name: "Alice Silva", email: "alice@email.com", cpf: "111.111.111-11" },
    { name: "Beto Rocha", email: "beto@email.com", cpf: "222.222.222-22" },
    {
      name: "Carla Dias",
      email: "carla@email.com",
      cpf: "333.333.333-33",
      role: Role.ADMIN,
    },
  ];

  const passwordHash = await bcrypt.hash("password123", 8);
  const transactionPasswordHash = await bcrypt.hash("1234", 8);

  type UserWithAccounts = User & {
    accounts: (Account & { pixKeys: PixKey[] })[];
    documents: Document[];
  };
  const createdUsersWithAccounts: UserWithAccounts[] = [];

  for (const userData of usersData) {
    const accountsData: { agency: string; number: string; digit: string }[] =
      [];
    for (let i = 0; i < 4; i++) {
      accountsData.push(await generateUniqueAccount());
    }

    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: userData.role || Role.USER,
        passwordHash,
        transactionPasswordHash,
        documents: {
          create: [{ type: DocumentType.CPF, value: userData.cpf }],
        },
        phones: { create: [generateRandomPhone(), generateRandomPhone()] },
        addresses: {
          create: [generateRandomAddress(), generateRandomAddress()],
        },
        accounts: {
          create: accountsData.map((acc, index) => {
            const pixKeysToCreate: { type: PixKeyType; value: string }[] = [];
            if (index === 0) {
              pixKeysToCreate.push({
                type: PixKeyType.email,
                value: userData.email,
              });
            }
            pixKeysToCreate.push({
              type: PixKeyType.random,
              value: crypto.randomUUID(),
            });

            return {
              ...acc,
              balance: new Decimal(Math.floor(20000 + Math.random() * 10000)),
              pixKeys: {
                create: pixKeysToCreate,
              },
            };
          }),
        },
      },
      include: {
        documents: true,
        accounts: { include: { pixKeys: true } },
      },
    });
    createdUsersWithAccounts.push(newUser);
  }
  console.log(
    `✅ ${createdUsersWithAccounts.length} usuários e suas contas foram criados.`
  );

  console.log("💸 Criando histórico de transações...");
  const transactionTypes = [
    TransactionType.PIX,
    TransactionType.TED,
    TransactionType.DEPOSIT,
  ];

  for (let day = 0; day < 10; day++) {
    for (let i = 0; i < 10; i++) {
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - day);
      transactionDate.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      const transactionType =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const transferValue = new Decimal(Math.floor(10 + Math.random() * 200));

      const senderUser =
        createdUsersWithAccounts[
          Math.floor(Math.random() * createdUsersWithAccounts.length)
        ];
      const senderAccount =
        senderUser.accounts[
          Math.floor(Math.random() * senderUser.accounts.length)
        ];

      await prisma.$transaction(async (tx) => {
        const currentSenderAccount = await tx.account.findUniqueOrThrow({
          where: { id: senderAccount.id },
        });

        if (transactionType === TransactionType.DEPOSIT) {
          const updatedAccount = await tx.account.update({
            where: { id: currentSenderAccount.id },
            data: { balance: { increment: transferValue } },
          });
          await tx.transaction.create({
            data: {
              originAccountId: currentSenderAccount.id,
              type: TransactionType.DEPOSIT,
              value: transferValue,
              date: transactionDate,
              recipientName: "Depósito em Conta",
              recipientDocument: senderUser.documents[0].value,
              balanceAfterTransaction: updatedAccount.balance,
            },
          });
        } else {
          if (currentSenderAccount.balance.lessThan(transferValue)) return;

          const otherUsers = createdUsersWithAccounts.filter(
            (u) => u.id !== senderUser.id
          );
          const recipientUser =
            otherUsers[Math.floor(Math.random() * otherUsers.length)];
          const recipientAccount =
            recipientUser.accounts[
              Math.floor(Math.random() * recipientUser.accounts.length)
            ];

          const updatedSender = await tx.account.update({
            where: { id: currentSenderAccount.id },
            data: { balance: { decrement: transferValue } },
          });

          let destinationAccountId: string | undefined = undefined;

          if (transactionType === TransactionType.PIX) {
            await tx.account.update({
              where: { id: recipientAccount.id },
              data: { balance: { increment: transferValue } },
            });
            destinationAccountId = recipientAccount.id;
          }

          await tx.transaction.create({
            data: {
              originAccountId: currentSenderAccount.id,
              destinationAccountId: destinationAccountId,
              type: transactionType,
              value: transferValue,
              date: transactionDate,
              recipientName: recipientUser.name,
              recipientDocument: recipientUser.documents[0].value,
              recipientBank: transactionType === "TED" ? "123" : undefined,
              recipientAgency: transactionType === "TED" ? "4567" : undefined,
              recipientAccount:
                transactionType === "TED" ? "89012-3" : undefined,
              balanceAfterTransaction: updatedSender.balance,
            },
          });
        }
      });
    }
  }
  console.log("✅ Histórico de transações criado com sucesso.");
  console.log("🎉 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
