import { prisma } from "../lib/prisma";

export function calculateCheckDigit(accountNumber: string): string {
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

export async function generateUniqueAccount() {
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
