-- CreateEnum
CREATE TYPE "LicenseActivityType" AS ENUM ('activate', 'deactivate', 'autoDeactivate');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'inProgress', 'waitingCustomer', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "licenseEmail" VARCHAR(255),
ADD COLUMN     "licenseExpiresAt" TIMESTAMP(3),
ADD COLUMN     "licenseKey" VARCHAR(255),
ADD COLUMN     "licenseStatus" VARCHAR(32);

-- CreateTable
CREATE TABLE "AccountActivationToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" UUID NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_AccountActivationToken" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "subscriptionId" TEXT,
    "licenseKey" VARCHAR(64) NOT NULL,
    "activatedDomain" VARCHAR(255),
    "activatedAt" TIMESTAMP(3),
    "maxDomains" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "activationCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_License" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseActivity" (
    "id" UUID NOT NULL,
    "licenseId" UUID NOT NULL,
    "actionType" "LicenseActivityType" NOT NULL,
    "domain" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_LicenseActivity" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseDomainActivation" (
    "id" UUID NOT NULL,
    "licenseId" UUID NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(45),
    "metadata" JSONB,

    CONSTRAINT "PK_LicenseDomainActivation" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" UUID NOT NULL,
    "ticketNumber" SERIAL NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "TicketPriority" NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_SupportTicket" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketMessage" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "userId" UUID,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "messageId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_SupportTicketMessage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketMessageAttachment" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" VARCHAR(255) NOT NULL,
    "contentId" VARCHAR(255),
    "size" INTEGER NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_SupportTicketMessageAttachment" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountActivationToken_token_key" ON "AccountActivationToken"("token");

-- CreateIndex
CREATE INDEX "IX_AccountActivationToken_userId" ON "AccountActivationToken"("userId");

-- CreateIndex
CREATE INDEX "IX_AccountActivationToken_token" ON "AccountActivationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseKey_key" ON "License"("licenseKey");

-- CreateIndex
CREATE INDEX "IX_License_organizationId" ON "License"("organizationId");

-- CreateIndex
CREATE INDEX "IX_License_licenseKey" ON "License"("licenseKey");

-- CreateIndex
CREATE INDEX "IX_License_subscriptionId" ON "License"("subscriptionId");

-- CreateIndex
CREATE INDEX "IX_License_deletedAt" ON "License"("deletedAt");

-- CreateIndex
CREATE INDEX "IX_LicenseActivity_licenseId" ON "LicenseActivity"("licenseId");

-- CreateIndex
CREATE INDEX "IX_LicenseActivity_occurredAt" ON "LicenseActivity"("occurredAt");

-- CreateIndex
CREATE INDEX "IX_LicenseDomainActivation_licenseId" ON "LicenseDomainActivation"("licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_LicenseDomainActivation_licenseId_domain" ON "LicenseDomainActivation"("licenseId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "IX_SupportTicket_organizationId" ON "SupportTicket"("organizationId");

-- CreateIndex
CREATE INDEX "IX_SupportTicket_userId" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "IX_SupportTicket_status" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "IX_SupportTicket_ticketNumber" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "IX_SupportTicketMessage_ticketId" ON "SupportTicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX "IX_SupportTicketMessage_userId" ON "SupportTicketMessage"("userId");

-- CreateIndex
CREATE INDEX "IX_SupportTicketMessage_messageId" ON "SupportTicketMessage"("messageId");

-- CreateIndex
CREATE INDEX "IX_SupportTicketMessageAttachment_messageId" ON "SupportTicketMessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "IX_SupportTicketMessageAttachment_contentId" ON "SupportTicketMessageAttachment"("contentId");

-- AddForeignKey
ALTER TABLE "AccountActivationToken" ADD CONSTRAINT "AccountActivationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseActivity" ADD CONSTRAINT "LicenseActivity_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseDomainActivation" ADD CONSTRAINT "LicenseDomainActivation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketMessageAttachment" ADD CONSTRAINT "SupportTicketMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "SupportTicketMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
