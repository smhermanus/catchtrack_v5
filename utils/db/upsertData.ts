import { PrismaClient, UserRole, UserStatus, QuotaStatus } from '@prisma/client';
import xlsx from 'xlsx';

interface UserRow {
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
}

interface QuotaRow {
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

interface RightsholderRow {
    registrationNumber: string;
    permitNumber: string;
    rightsholderCode: string;
    username: string;
    companyName: string;
    contactAddress: string;
}

class DataUpserter {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    private generateUsername(companyName: string, userCode: string): string {
        // Convert to lowercase and remove special characters
        let username = companyName.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20); // Limit to 20 characters

        // Append userCode to ensure uniqueness
        username = `${username}${userCode}`;
        return username;
    }

    async readExcelFile(filePath: string): Promise<Record<string, any>[]> {
        try {
            const workbook = xlsx.readFile(filePath);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Configure Excel to properly handle dates
            const rows = xlsx.utils.sheet_to_json(worksheet, {
                header: 1, // Use array format to handle headers
                defval: '', // Default value for empty cells
                raw: false, // Convert values to strings
                dateNF: 'yyyy-mm-dd' // Date format
            }) as any[][];

            // Skip the header row and convert to objects
            const headers = (rows[0] as string[]).map((header: string) => header.trim().toLowerCase());
            console.log('Excel Headers:', headers);

            // Log the first row as a sample
            if (rows.length > 1) {
                const sampleRow = rows[1];
                console.log('\nSample Row (before conversion):', sampleRow.reduce((obj: Record<string, any>, val: any, idx: number) => {
                    obj[headers[idx]] = val;
                    return obj;
                }, {}));
            }

            const data = rows.slice(1)
                .filter((row: any[]) => row.some(cell => cell !== '')) // Filter out empty rows
                .map((row: any[]) => {
                    const obj: Record<string, any> = {};
                    headers.forEach((header: string, index: number) => {
                        if (row[index] !== undefined && row[index] !== '') {
                            obj[header] = row[index];
                        }
                    });
                    return obj;
                });

            // Log the first converted row as a sample
            if (data.length > 0) {
                console.log('\nSample Row (after conversion):', data[0]);
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error(`Error reading Excel file ${filePath}:`, err);
            throw new Error(`Failed to read Excel file ${filePath}: ${errorMessage}`);
        }
    }

    private excelDateToDate(excelDate: string | number): Date {
        if (typeof excelDate === 'string') {
            return new Date(excelDate);
        }
        return new Date((excelDate - 25569) * 86400 * 1000);
    }

    private validateQuota(quota: Record<string, any>, index: number): QuotaRow {
        // Log the quota object for debugging
        console.log(`\nValidating quota at row ${index + 2}:`, quota);

        // Parse dates safely
        const startDate = quota.startdate ? new Date(quota.startdate) : new Date();
        const endDate = quota.enddate ? new Date(quota.enddate) : new Date();

        // Ensure dates are valid
        if (isNaN(startDate.getTime())) {
            console.warn(`Invalid start date for quota at row ${index + 2}, using current date`);
            startDate.setTime(Date.now());
        }
        if (isNaN(endDate.getTime())) {
            console.warn(`Invalid end date for quota at row ${index + 2}, using current date`);
            endDate.setTime(Date.now());
        }

        // Default values for optional fields
        const defaultValues = {
            quotaCode: quota.quotacode || String(index + 2),
            quotaAllocation: Number(quota.quotaallocation) || 0,
            overcatch20232024: Number(quota.overcatch20232024) || 0,
            finalQuotaAllocation: Number(quota.finalquotaallocation) || 0,
            quotaUsed: Number(quota.quotaused) || 0,
            quotaBalance: Number(quota.quotabalance) || 0,
            startDate,
            endDate,
            status: (quota.status?.toUpperCase() || 'PENDING') as QuotaStatus,
            season: quota.season || '',
            marineResources: (quota.marineresources || '').toString().split(',').map((r: string) => r.trim()).filter(Boolean),
            productType: quota.producttype || '',
            sectorName: quota.sectorname || '',
            catchArea3_4: quota.catcharea3_4 === 'true',
            catchArea7: quota.catcharea7 === 'true',
            catchArea8: quota.catcharea8 === 'true',
            catchArea11: quota.catcharea11 === 'true',
            zone: quota.zone || undefined,
            warningThreshold: Number(quota.warningthreshold) || undefined,
            criticalThreshold: Number(quota.criticalthreshold) || undefined
        };

        // Create validated quota object
        const validatedQuota: QuotaRow = {
            ...defaultValues
        };

        // Log the validated quota for debugging
        console.log(`Successfully validated quota: ${validatedQuota.quotaCode}`);

        return validatedQuota;
    }

    private async upsertQuotas(quotas: QuotaRow[], adminUserId: number): Promise<void> {
        console.log('\nStarting quota upsert...');
        
        for (let i = 0; i < quotas.length; i++) {
            try {
                const quota = quotas[i];
                
                // Upsert the quota
                const upsertedQuota = await this.prisma.quota.upsert({
                    where: {
                        quotaCode: quota.quotaCode
                    },
                    create: {
                        quotaCode: quota.quotaCode,
                        quotaAllocation: quota.quotaAllocation,
                        overcatch20232024: quota.overcatch20232024,
                        finalQuotaAllocation: quota.finalQuotaAllocation,
                        quotaUsed: quota.quotaUsed,
                        quotaBalance: quota.quotaBalance,
                        startDate: quota.startDate,
                        endDate: quota.endDate,
                        status: quota.status,
                        season: quota.season,
                        marineResources: quota.marineResources,
                        productType: quota.productType,
                        sectorName: quota.sectorName,
                        catchArea3_4: quota.catchArea3_4,
                        catchArea7: quota.catchArea7,
                        catchArea8: quota.catchArea8,
                        catchArea11: quota.catchArea11,
                        zone: quota.zone,
                        warningThreshold: quota.warningThreshold,
                        criticalThreshold: quota.criticalThreshold,
                        createdByUser: {
                            connect: {
                                id: adminUserId
                            }
                        }
                    },
                    update: {
                        quotaAllocation: quota.quotaAllocation,
                        overcatch20232024: quota.overcatch20232024,
                        finalQuotaAllocation: quota.finalQuotaAllocation,
                        quotaUsed: quota.quotaUsed,
                        quotaBalance: quota.quotaBalance,
                        startDate: quota.startDate,
                        endDate: quota.endDate,
                        status: quota.status,
                        season: quota.season,
                        marineResources: quota.marineResources,
                        productType: quota.productType,
                        sectorName: quota.sectorName,
                        catchArea3_4: quota.catchArea3_4,
                        catchArea7: quota.catchArea7,
                        catchArea8: quota.catchArea8,
                        catchArea11: quota.catchArea11,
                        zone: quota.zone,
                        warningThreshold: quota.warningThreshold,
                        criticalThreshold: quota.criticalThreshold
                    }
                });

                console.log(`Successfully upserted quota: ${quota.quotaCode}`);
            } catch (err) {
                console.error(`Error upserting quota at row ${i + 2}:`, err);
                throw err;
            }
        }
    }

    async upsertAllData(quotasFilePath: string, adminUserId: number): Promise<void> {
        try {
            console.log('Starting data upsert process...');

            console.log('Reading Excel files...');
            const rawQuotas = await this.readExcelFile(quotasFilePath);
            console.log(`Read ${rawQuotas.length} quotas from Excel`);

            console.log('\nStarting quota upsert...');
            const validatedQuotas: QuotaRow[] = rawQuotas.map((quota, index) => this.validateQuota(quota, index));
            await this.upsertQuotas(validatedQuotas, adminUserId);
            console.log(`Successfully upserted ${validatedQuotas.length} quotas`);

            console.log('\nData upsert completed successfully!');
            console.log(`Summary:`);
            console.log(`- Quotas upserted: ${validatedQuotas.length}`);
        } catch (err) {
            console.error('\nFatal error during data upsert:', err);
            if (err instanceof Error) {
                console.error('Stack trace:', err.stack);
                throw new Error(`Data upsert failed: ${err.message}`);
            } else {
                throw err;
            }
        } finally {
            await this.prisma.$disconnect();
            console.log('\nDatabase connection closed.');
        }
    }
}

export { DataUpserter };