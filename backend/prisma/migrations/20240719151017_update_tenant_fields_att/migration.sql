/*
  Warnings:

  - You are about to drop the column `databaseSchema` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `databaseUrl` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `port` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "databaseSchema",
DROP COLUMN "databaseUrl",
DROP COLUMN "port",
ADD COLUMN     "dbHost" TEXT,
ADD COLUMN     "dbPort" INTEGER,
ADD COLUMN     "dbSchema" TEXT,
ADD COLUMN     "dbType" TEXT;
