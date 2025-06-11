/*
  Warnings:

  - You are about to drop the column `insights` on the `insights` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "insights" DROP COLUMN "insights";

-- CreateTable
CREATE TABLE "driver_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,

    CONSTRAINT "driver_info_pkey" PRIMARY KEY ("id")
);
