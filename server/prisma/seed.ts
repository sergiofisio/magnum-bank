// prisma/seed.ts
import {
  PrismaClient,
  Role,
  DocumentType,
  PhoneType,
  AddressType,
  PixKeyType,
  TransactionType,
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

  console.log("🙋‍♂️ Criando usuários...");
  const usersData = [
    { name: "Alice Silva", email: "alice@email.com" },
    { name: "Beto Rocha", email: "beto@email.com" },
    { name: "Carla Dias", email: "carla@email.com", role: Role.ADMIN },
  ];

  const passwordHash = await bcrypt.hash("password123", 8);
  const transactionPasswordHash = await bcrypt.hash("1234", 8);

  for (const userData of usersData) {
    const accountsData: { agency: string; number: string; digit: string }[] =
      [];
    for (let i = 0; i < 3; i++) {
      accountsData.push(await generateUniqueAccount());
    }

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: userData.role || Role.USER,
        passwordHash,
        transactionPasswordHash,
        documents: {
          create: [
            {
              type: DocumentType.CPF,
              value: `111.111.111-${Math.floor(10 + Math.random() * 90)}`,
            },
            {
              type: DocumentType.RG,
              value: `22.222.222-${Math.floor(1 + Math.random() * 9)}`,
            },
          ],
        },
        phones: {
          create: [
            {
              type: PhoneType.MOBILE,
              countryCode: 55,
              areaCode: 11,
              number: `98765-43${Math.floor(10 + Math.random() * 90)}`,
            },
            {
              type: PhoneType.HOME,
              countryCode: 55,
              areaCode: 11,
              number: `2345-67${Math.floor(10 + Math.random() * 90)}`,
            },
          ],
        },
        addresses: {
          create: [
            {
              type: AddressType.RESIDENTIAL,
              street: "Rua das Flores",
              number: "123",
              neighborhood: "Centro",
              city: "São Paulo",
              state: "SP",
              zipcode: "01001-000",
            },
            {
              type: AddressType.COMMERCIAL,
              street: "Av. Paulista",
              number: "1500",
              neighborhood: "Bela Vista",
              city: "São Paulo",
              state: "SP",
              zipcode: "01310-200",
            },
          ],
        },
        accounts: {
          create: accountsData.map((acc) => ({
            ...acc,
            balance: new Decimal(Math.floor(1000 + Math.random() * 9000)),
            pixKey: {
              create: [
                {
                  type: PixKeyType.email,
                  value: `${userData.name
                    .split(" ")[0]
                    .toLowerCase()}${acc.number.slice(0, 2)}@pix.com`,
                },
                {
                  type: PixKeyType.CPF,
                  value: `222.222.222-${Math.floor(10 + Math.random() * 90)}`,
                },
                { type: PixKeyType.random, value: crypto.randomUUID() },
              ],
            },
          })),
        },
      },
    });
  }
  console.log(`✅ ${usersData.length} usuários criados com sucesso.`);

  console.log("💸 Criando transações...");
  const allAccounts = await prisma.account.findMany();

  for (let i = 0; i < 30; i++) {
    let senderAccount =
      allAccounts[Math.floor(Math.random() * allAccounts.length)];
    let recipientAccount =
      allAccounts[Math.floor(Math.random() * allAccounts.length)];
    while (senderAccount.id === recipientAccount.id) {
      recipientAccount =
        allAccounts[Math.floor(Math.random() * allAccounts.length)];
    }

    const transferValue = new Decimal(Math.floor(10 + Math.random() * 200));

    if (senderAccount.balance.greaterThanOrEqualTo(transferValue)) {
      await prisma.$transaction(async (tx) => {
        const updatedSender = await tx.account.update({
          where: { id: senderAccount.id },
          data: { balance: { decrement: transferValue } },
        });

        await tx.account.update({
          where: { id: recipientAccount.id },
          data: { balance: { increment: transferValue } },
        });

        await tx.transaction.create({
          data: {
            accountId: senderAccount.id,
            type: TransactionType.PIX,
            value: transferValue,
            recipientName: `Usuário ${recipientAccount.userId.slice(0, 5)}`,
            recipientDocument: `***.***.***-**`,
            balanceAfterTransaction: updatedSender.balance,
          },
        });
      });
    }
  }
  console.log("✅ Transações aleatórias criadas.");

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
