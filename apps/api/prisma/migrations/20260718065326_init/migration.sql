-- CreateEnum
CREATE TYPE "Category" AS ENUM ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'bags', 'activewear');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('black', 'white', 'gray', 'navy', 'blue', 'green', 'red', 'pink', 'yellow', 'orange', 'brown', 'beige', 'purple', 'multicolor');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('spring', 'summer', 'fall', 'winter', 'all_season');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('casual', 'work', 'formal', 'party', 'date', 'travel', 'sport');

-- CreateEnum
CREATE TYPE "Style" AS ENUM ('minimal', 'classic', 'streetwear', 'boho', 'preppy', 'athleisure', 'vintage');

-- CreateEnum
CREATE TYPE "Material" AS ENUM ('cotton', 'linen', 'wool', 'silk', 'denim', 'leather', 'synthetic', 'knit');

-- CreateEnum
CREATE TYPE "Pattern" AS ENUM ('solid', 'striped', 'checked', 'floral', 'printed', 'graphic', 'other');

-- CreateEnum
CREATE TYPE "Formality" AS ENUM ('very_casual', 'casual', 'smart_casual', 'business', 'formal');

-- CreateEnum
CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "Category",
    "color" "Color",
    "season" "Season",
    "occasion" "Occasion",
    "style" "Style",
    "material" "Material",
    "pattern" "Pattern",
    "formality" "Formality",
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_token_key" ON "AuthToken"("token");

-- CreateIndex
CREATE INDEX "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Image_key_key" ON "Image"("key");

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
