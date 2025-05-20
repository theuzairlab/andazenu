/*
  Warnings:

  - You are about to drop the column `repliedAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `repliedBy` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `WebsiteSettings` table. All the data in the column will be lost.
  - Made the column `heroSliderImages` on table `WebsiteSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "repliedAt",
DROP COLUMN "repliedBy";

-- AlterTable
ALTER TABLE "WebsiteSettings" DROP COLUMN "socialLinks",
ADD COLUMN     "socialLinkFacebook" TEXT,
ADD COLUMN     "socialLinkInstagram" TEXT,
ADD COLUMN     "socialLinkLinkedIn" TEXT,
ADD COLUMN     "socialLinkTwitter" TEXT,
ALTER COLUMN "heroSliderImages" SET NOT NULL,
ALTER COLUMN "heroSliderImages" SET DEFAULT '[]',
ALTER COLUMN "contactPhone" SET DEFAULT '+1 (555) 123-4567';
