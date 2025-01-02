-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SYSTEMADMINISTRATOR', 'SECURITYADMINISTRATOR', 'PERMITADMINISTRATOR', 'PERMITHOLDER', 'RIGHTSHOLDER', 'SKIPPER', 'INSPECTOR', 'MONITOR', 'DRIVER', 'FACTORYSTOCKCONTROLLER', 'LOCALOUTLETCONTROLLER', 'EXPORTCONTROLLER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "QuotaStatus" AS ENUM ('VALID', 'INVALID', 'EXPIRED', 'PENDING');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_APPROVED', 'USER_REJECTED', 'USER_SUSPENDED', 'USER_ACTIVATED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED', 'ROLE_CHANGED', 'SETTINGS_CHANGED', 'QUOTA_CREATED', 'QUOTA_UPDATED', 'QUOTA_DELETED', 'TRANSFER_REQUESTED', 'TRANSFER_APPROVED', 'TRANSFER_REJECTED', 'TRANSFER_CANCELLED', 'COMPLIANCE_REPORTED', 'COMPLIANCE_UPDATED', 'COMPLIANCE_RESOLVED', 'COMPLIANCE_DISMISSED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('QUOTA_NEAR_DEPLETION', 'QUOTA_DEPLETED', 'SEASONAL_CLOSURE_APPROACHING', 'SEASONAL_CLOSURE_ACTIVE', 'COMPLIANCE_VIOLATION', 'TRANSFER_REQUEST', 'TRANSFER_APPROVED', 'TRANSFER_REJECTED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "userCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "companyname" TEXT NOT NULL,
    "rsaId" TEXT NOT NULL,
    "cellNumber" TEXT NOT NULL,
    "physicalAddress" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "avatarUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" INTEGER,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "displayName" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species" (
    "id" SERIAL NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "speciesCode" TEXT NOT NULL,
    "minimumSize" DECIMAL(65,30),
    "maximumSize" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catch_areas" (
    "id" SERIAL NOT NULL,
    "areaCode" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "coordinates" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catch_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_sites" (
    "id" SERIAL NOT NULL,
    "siteName" TEXT NOT NULL,
    "locationCoordinates" JSONB NOT NULL,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "zone" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "subarea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotas" (
    "id" SERIAL NOT NULL,
    "quotaCode" TEXT NOT NULL,
    "quotaAllocation" DECIMAL(65,30) NOT NULL,
    "overcatch20232024" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "finalQuotaAllocation" DECIMAL(65,30) NOT NULL,
    "quotaUsed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quotaBalance" DECIMAL(65,30),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "QuotaStatus" NOT NULL,
    "season" TEXT NOT NULL,
    "marineResources" TEXT[],
    "productType" TEXT NOT NULL,
    "sectorName" TEXT NOT NULL,
    "catchArea3_4" BOOLEAN NOT NULL DEFAULT false,
    "catchArea7" BOOLEAN NOT NULL DEFAULT false,
    "catchArea8" BOOLEAN NOT NULL DEFAULT false,
    "catchArea11" BOOLEAN NOT NULL DEFAULT false,
    "zone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "lastUpdatedBy" INTEGER,
    "warningThreshold" DECIMAL(65,30) NOT NULL DEFAULT 20,
    "criticalThreshold" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "seasonalRestrictions" JSONB,
    "notes" TEXT,

    CONSTRAINT "quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quota_landing_sites" (
    "quotaId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,

    CONSTRAINT "quota_landing_sites_pkey" PRIMARY KEY ("quotaId","siteId")
);

-- CreateTable
CREATE TABLE "quota_species" (
    "quotaId" INTEGER NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "catchLimit" DECIMAL(65,30),
    "minimumSize" DECIMAL(65,30),
    "maximumSize" DECIMAL(65,30),
    "seasonStart" TIMESTAMP(3),
    "seasonEnd" TIMESTAMP(3),
    "restrictions" JSONB,

    CONSTRAINT "quota_species_pkey" PRIMARY KEY ("quotaId","speciesId")
);

-- CreateTable
CREATE TABLE "quota_alerts" (
    "id" SERIAL NOT NULL,
    "quotaId" INTEGER NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,

    CONSTRAINT "quota_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quota_transfers" (
    "id" SERIAL NOT NULL,
    "sourceQuotaId" INTEGER NOT NULL,
    "destinationQuotaId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,

    CONSTRAINT "quota_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_records" (
    "id" SERIAL NOT NULL,
    "quotaId" INTEGER NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" INTEGER NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,
    "resolution" TEXT,

    CONSTRAINT "compliance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rightsholders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "contactAddress" TEXT NOT NULL,
    "rightsholderCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rightsholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rightsholder_quotas" (
    "rightsholderId" INTEGER NOT NULL,
    "quotaId" INTEGER NOT NULL,

    CONSTRAINT "rightsholder_quotas_pkey" PRIMARY KEY ("rightsholderId","quotaId")
);

-- CreateTable
CREATE TABLE "factories" (
    "id" SERIAL NOT NULL,
    "rightsholderId" INTEGER NOT NULL,
    "factoryOwner" TEXT NOT NULL,
    "factoryName" TEXT NOT NULL,
    "factoryAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessels" (
    "id" SERIAL NOT NULL,
    "rightsholderId" INTEGER NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lastStatusUpdate" TIMESTAMP(3),

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skippers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rightsholderId" INTEGER NOT NULL,
    "vesselId" INTEGER NOT NULL,
    "skipperCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skippers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitors" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "monitorCode" TEXT NOT NULL,
    "statisticBook" TEXT,
    "receiptNumber" TEXT,
    "receiptAmount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_notifications" (
    "id" SERIAL NOT NULL,
    "skipperId" INTEGER NOT NULL,
    "quotaId" INTEGER NOT NULL,
    "vesselId" INTEGER NOT NULL,
    "plannedDeparture" TIMESTAMP(3) NOT NULL,
    "expectedReturn" TIMESTAMP(3) NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "cellphoneNr" TEXT NOT NULL,
    "sessionId" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catch_records" (
    "id" SERIAL NOT NULL,
    "quotaId" INTEGER NOT NULL,
    "monitorId" INTEGER NOT NULL,
    "rightsholderId" INTEGER NOT NULL,
    "vesselId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,
    "grossRegisteredTonnage" DECIMAL(65,30),
    "locationCoordinates" JSONB,
    "trapsSet" INTEGER,
    "trapsPulled" INTEGER,
    "binsAnimals" INTEGER,
    "totalCatchMass" DECIMAL(65,30) NOT NULL,
    "numberOfCatches" INTEGER NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "landingDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "uploadImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catch_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quota_allocations" (
    "id" SERIAL NOT NULL,
    "vesselId" INTEGER NOT NULL,
    "quotaId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "quota_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actionType" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" INTEGER NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quotaWarningThreshold" INTEGER NOT NULL DEFAULT 20,
    "quotaCriticalThreshold" INTEGER NOT NULL DEFAULT 10,
    "daysBeforeExpiryWarning" INTEGER NOT NULL DEFAULT 30,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "dailyDigest" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keys" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "hashedPassword" TEXT,

    CONSTRAINT "keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "userId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_userCode_key" ON "users"("userCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_rsaId_key" ON "users"("rsaId");

-- CreateIndex
CREATE UNIQUE INDEX "species_speciesCode_key" ON "species"("speciesCode");

-- CreateIndex
CREATE UNIQUE INDEX "catch_areas_areaCode_key" ON "catch_areas"("areaCode");

-- CreateIndex
CREATE UNIQUE INDEX "quotas_quotaCode_key" ON "quotas"("quotaCode");

-- CreateIndex
CREATE UNIQUE INDEX "rightsholders_userId_key" ON "rightsholders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rightsholders_registrationNumber_key" ON "rightsholders"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "rightsholders_permitNumber_key" ON "rightsholders"("permitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "rightsholders_rightsholderCode_key" ON "rightsholders"("rightsholderCode");

-- CreateIndex
CREATE UNIQUE INDEX "vessels_registrationNumber_key" ON "vessels"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "skippers_userId_key" ON "skippers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skippers_skipperCode_key" ON "skippers"("skipperCode");

-- CreateIndex
CREATE UNIQUE INDEX "monitors_userId_key" ON "monitors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "monitors_monitorCode_key" ON "monitors"("monitorCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "keys_id_key" ON "keys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_id_key" ON "sessions"("id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotas" ADD CONSTRAINT "quotas_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotas" ADD CONSTRAINT "quotas_lastUpdatedBy_fkey" FOREIGN KEY ("lastUpdatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_landing_sites" ADD CONSTRAINT "quota_landing_sites_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_landing_sites" ADD CONSTRAINT "quota_landing_sites_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "landing_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_species" ADD CONSTRAINT "quota_species_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_species" ADD CONSTRAINT "quota_species_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_alerts" ADD CONSTRAINT "quota_alerts_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_alerts" ADD CONSTRAINT "quota_alerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_transfers" ADD CONSTRAINT "quota_transfers_sourceQuotaId_fkey" FOREIGN KEY ("sourceQuotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_transfers" ADD CONSTRAINT "quota_transfers_destinationQuotaId_fkey" FOREIGN KEY ("destinationQuotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_transfers" ADD CONSTRAINT "quota_transfers_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rightsholders" ADD CONSTRAINT "rightsholders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rightsholder_quotas" ADD CONSTRAINT "rightsholder_quotas_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rightsholder_quotas" ADD CONSTRAINT "rightsholder_quotas_rightsholderId_fkey" FOREIGN KEY ("rightsholderId") REFERENCES "rightsholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factories" ADD CONSTRAINT "factories_rightsholderId_fkey" FOREIGN KEY ("rightsholderId") REFERENCES "rightsholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_rightsholderId_fkey" FOREIGN KEY ("rightsholderId") REFERENCES "rightsholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skippers" ADD CONSTRAINT "skippers_rightsholderId_fkey" FOREIGN KEY ("rightsholderId") REFERENCES "rightsholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skippers" ADD CONSTRAINT "skippers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skippers" ADD CONSTRAINT "skippers_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notifications" ADD CONSTRAINT "trip_notifications_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notifications" ADD CONSTRAINT "trip_notifications_skipperId_fkey" FOREIGN KEY ("skipperId") REFERENCES "skippers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notifications" ADD CONSTRAINT "trip_notifications_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_records" ADD CONSTRAINT "catch_records_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_records" ADD CONSTRAINT "catch_records_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_records" ADD CONSTRAINT "catch_records_rightsholderId_fkey" FOREIGN KEY ("rightsholderId") REFERENCES "rightsholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_records" ADD CONSTRAINT "catch_records_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "landing_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catch_records" ADD CONSTRAINT "catch_records_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_allocations" ADD CONSTRAINT "quota_allocations_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_allocations" ADD CONSTRAINT "quota_allocations_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keys" ADD CONSTRAINT "keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
