/*
  Warnings:

  - Made the column `address` on table `WebsiteSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WebsiteSettings" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address" SET DEFAULT 'TopCity-1, Islamabad';
