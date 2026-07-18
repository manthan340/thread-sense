-- AlterEnum columns to free-form text
ALTER TABLE "Image" ALTER COLUMN "category" TYPE TEXT USING "category"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "color" TYPE TEXT USING "color"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "season" TYPE TEXT USING "season"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "occasion" TYPE TEXT USING "occasion"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "style" TYPE TEXT USING "style"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "material" TYPE TEXT USING "material"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "pattern" TYPE TEXT USING "pattern"::TEXT;
ALTER TABLE "Image" ALTER COLUMN "formality" TYPE TEXT USING "formality"::TEXT;

-- DropEnum
DROP TYPE "Category";
DROP TYPE "Color";
DROP TYPE "Season";
DROP TYPE "Occasion";
DROP TYPE "Style";
DROP TYPE "Material";
DROP TYPE "Pattern";
DROP TYPE "Formality";
