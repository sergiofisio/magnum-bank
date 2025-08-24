/*
  Warnings:

  - A unique constraint covering the columns `[agency,number]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agency` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `digit` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PixKeyType" AS ENUM ('CPF', 'email', 'phone', 'random');

-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "agency" TEXT NOT NULL,
ADD COLUMN     "digit" TEXT NOT NULL,
ADD COLUMN     "number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "confirm" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."PixKey" (
    "id" TEXT NOT NULL,
    "type" "public"."PixKeyType" NOT NULL,
    "value" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PixKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PixKey_value_key" ON "public"."PixKey"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Account_agency_number_key" ON "public"."Account"("agency", "number");

-- AddForeignKey
ALTER TABLE "public"."PixKey" ADD CONSTRAINT "PixKey_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
