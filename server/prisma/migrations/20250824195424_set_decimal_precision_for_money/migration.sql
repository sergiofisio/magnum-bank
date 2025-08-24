/*
  Warnings:

  - You are about to alter the column `balance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `value` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `balanceAfterTransaction` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Account" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "balanceAfterTransaction" SET DATA TYPE DECIMAL(12,2);
