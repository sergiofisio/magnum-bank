-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "deleteDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
