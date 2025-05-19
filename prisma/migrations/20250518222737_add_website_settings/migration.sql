-- CreateTable
CREATE TABLE "WebsiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'settings',
    "siteName" TEXT NOT NULL DEFAULT 'T-Shirt Store',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#000000',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "heroSliderImages" JSONB,
    "categoryImages" JSONB,
    "footerText" TEXT NOT NULL DEFAULT '© 2023 T-Shirt Store. All rights reserved.',
    "contactEmail" TEXT NOT NULL DEFAULT 'contact@example.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+1234567890',
    "socialLinks" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteSettings_pkey" PRIMARY KEY ("id")
);
