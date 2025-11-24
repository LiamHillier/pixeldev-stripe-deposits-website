-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "siteUrl" VARCHAR(2000),
ADD COLUMN     "stripeAccountId" VARCHAR(255);

-- CreateIndex
CREATE INDEX "IX_Organization_siteUrl" ON "Organization"("siteUrl");

-- CreateIndex
CREATE INDEX "IX_Organization_stripeAccountId" ON "Organization"("stripeAccountId");
