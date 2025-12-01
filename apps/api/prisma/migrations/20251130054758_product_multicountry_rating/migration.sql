/*
  Warnings:

  - You are about to drop the column `classification` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `countryGroup` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Product_countryGroup_status_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "classification",
DROP COLUMN "countryGroup",
ADD COLUMN     "countryGroups" "CountryGroup"[] DEFAULT ARRAY[]::"CountryGroup"[],
ADD COLUMN     "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");
