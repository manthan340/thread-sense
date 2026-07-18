-- Convert single taxonomy strings to multi-value text arrays
ALTER TABLE "Image" ALTER COLUMN "category" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "category" TYPE TEXT[] USING (
  CASE WHEN "category" IS NULL OR "category" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["category"] END
);
ALTER TABLE "Image" ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "color" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "color" TYPE TEXT[] USING (
  CASE WHEN "color" IS NULL OR "color" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["color"] END
);
ALTER TABLE "Image" ALTER COLUMN "color" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "season" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "season" TYPE TEXT[] USING (
  CASE WHEN "season" IS NULL OR "season" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["season"] END
);
ALTER TABLE "Image" ALTER COLUMN "season" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "occasion" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "occasion" TYPE TEXT[] USING (
  CASE WHEN "occasion" IS NULL OR "occasion" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["occasion"] END
);
ALTER TABLE "Image" ALTER COLUMN "occasion" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "style" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "style" TYPE TEXT[] USING (
  CASE WHEN "style" IS NULL OR "style" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["style"] END
);
ALTER TABLE "Image" ALTER COLUMN "style" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "material" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "material" TYPE TEXT[] USING (
  CASE WHEN "material" IS NULL OR "material" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["material"] END
);
ALTER TABLE "Image" ALTER COLUMN "material" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "pattern" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "pattern" TYPE TEXT[] USING (
  CASE WHEN "pattern" IS NULL OR "pattern" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["pattern"] END
);
ALTER TABLE "Image" ALTER COLUMN "pattern" SET NOT NULL;

ALTER TABLE "Image" ALTER COLUMN "formality" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Image" ALTER COLUMN "formality" TYPE TEXT[] USING (
  CASE WHEN "formality" IS NULL OR "formality" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY["formality"] END
);
ALTER TABLE "Image" ALTER COLUMN "formality" SET NOT NULL;
