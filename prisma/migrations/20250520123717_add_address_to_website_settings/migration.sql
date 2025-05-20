/*
  Warnings:

  - You are about to drop the column `socialLinkFacebook` on the `WebsiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinkInstagram` on the `WebsiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinkLinkedIn` on the `WebsiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinkTwitter` on the `WebsiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WebsiteSettings" DROP COLUMN "socialLinkFacebook",
DROP COLUMN "socialLinkInstagram",
DROP COLUMN "socialLinkLinkedIn",
DROP COLUMN "socialLinkTwitter",
ADD COLUMN     "address" TEXT DEFAULT 'Top City-1, Islamabad, Pakistan',
ADD COLUMN     "socialLinks" JSONB,
ALTER COLUMN "heroSliderImages" DROP NOT NULL,
ALTER COLUMN "heroSliderImages" DROP DEFAULT,
ALTER COLUMN "contactPhone" SET DEFAULT '+1234567890';
