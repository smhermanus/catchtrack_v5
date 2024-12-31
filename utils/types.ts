import { UserRole, UserStatus, QuotaStatus } from '@prisma/client';

export interface UserRow {
    username: string;
    passwordHash: string;
    role: UserRole;
    userCode: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    rsaId: string;
    cellNumber: string;
    physicalAddress: string;
    profilePictureUrl?: string;
    isVerified: boolean;
    isActive: boolean;
    status: UserStatus;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
}

export interface QuotaRow {
    quotaCode: string;
    quotaAllocation: number;
    overcatch20232024: number;
    finalQuotaAllocation: number;
    quotaUsed: number;
    quotaBalance: number;
    startDate: Date;
    endDate: Date;
    status: QuotaStatus;
    season: string;
    marineResources: string[];
    productType: string;
    sectorName: string;
    catchArea3_4: boolean;
    catchArea7: boolean;
    catchArea8: boolean;
    catchArea11: boolean;
    zone?: string;
    warningThreshold?: number;
    criticalThreshold?: number;
}

export interface RightsholderRow {
    registrationNumber: string;
    permitNumber: string;
    rightsholderCode: string;
    username: string;
    companyName: string;
    contactAddress: string;
}

export interface ImportResult {
    success: boolean;
    message: string;
    error?: Error;
}

export interface ExcelData {
    users: UserRow[];
    quotas: QuotaRow[];
    rightsholders: RightsholderRow[];
}