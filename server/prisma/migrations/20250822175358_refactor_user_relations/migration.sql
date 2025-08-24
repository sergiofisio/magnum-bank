/*
  Warnings:

  - You are about to drop the column `document` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CPF', 'RG', 'PASSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PhoneType" AS ENUM ('MOBILE', 'WORK', 'HOME', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AddressType" AS ENUM ('RESIDENTIAL', 'WORK', 'COMMERCIAL', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";

-- DropIndex
DROP INDEX "public"."Account_userId_key";

-- DropIndex
DROP INDEX "public"."User_document_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "document",
DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL DEFAULT 'CPF',
    "other_type" TEXT,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Phone" (
    "id" TEXT NOT NULL,
    "type" "public"."PhoneType" NOT NULL DEFAULT 'MOBILE',
    "country_code" INTEGER NOT NULL,
    "area_code" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "other_type" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "type" "public"."AddressType" NOT NULL DEFAULT 'RESIDENTIAL',
    "other_type" TEXT,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "zipcode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_value_key" ON "public"."Document"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_country_code_area_code_number_key" ON "public"."Phone"("country_code", "area_code", "number");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Phone" ADD CONSTRAINT "Phone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
