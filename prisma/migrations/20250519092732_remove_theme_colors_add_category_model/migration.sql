/*
  Warnings:

  - You are about to drop the column `collection` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `categoryImages` on the `WebsiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `WebsiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `WebsiteSettings` table. All the data in the column will be lost.

*/
-- First, create the Category table
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Create unique index on slug
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- Insert default categories to match existing Collection enum values
INSERT INTO "Category" ("id", "name", "slug", "description", "updatedAt")
VALUES 
  ('mens-category', 'Men''s', 'mens', 'Men''s clothing collection', NOW()),
  ('kids-category', 'Kids', 'kids', 'Kids clothing collection', NOW()),
  ('womens-category', 'Women''s', 'womens', 'Women''s clothing collection', NOW());

-- Add categoryId to Product table without requiring it yet
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

-- Update products to reference the appropriate category based on their current collection
UPDATE "Product" SET "categoryId" = 'mens-category' WHERE "collection" = 'MENS';
UPDATE "Product" SET "categoryId" = 'kids-category' WHERE "collection" = 'KIDS';

-- Set default category for any products without a match
UPDATE "Product" SET "categoryId" = 'mens-category' WHERE "categoryId" IS NULL;

-- Now make categoryId required
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove the old collection column
ALTER TABLE "Product" DROP COLUMN "collection";

-- Update WebsiteSettings
ALTER TABLE "WebsiteSettings" DROP COLUMN "categoryImages",
DROP COLUMN "primaryColor",
DROP COLUMN "secondaryColor",
ALTER COLUMN "siteName" SET DEFAULT 'Andaze Nu',
ALTER COLUMN "footerText" SET DEFAULT '© 2023 Andaze Nu. All rights reserved.',
ALTER COLUMN "contactEmail" SET DEFAULT 'contact@andazenu.com';

-- Finally drop the Collection enum
DROP TYPE "Collection";
