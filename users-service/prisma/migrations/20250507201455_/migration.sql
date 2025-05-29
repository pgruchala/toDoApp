/*
  Warnings:

  - A unique constraint covering the columns `[keycloakId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keycloakId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "keycloakId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_keycloakId_key" ON "User"("keycloakId");
