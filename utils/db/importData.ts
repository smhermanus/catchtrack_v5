// utils/db/importData.ts
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus, QuotaStatus } from '@prisma/client';

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

export class DataImporter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async readExcelFile<T>(filePath: string): Promise<T[]> {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json<T>(worksheet);

      console.log(`Read ${data.length} rows from ${filePath}`);
      console.log('First row sample:', JSON.stringify(data[0], null, 2));

      // Set default values for user data
      if (filePath.toLowerCase().includes('users')) {
        return data.map((row: any) => ({
          ...row,
          status: row.status || 'PENDING',
          username: row.username || `user_${row.id}`,
          passwordHash: row.passwordHash || 'defaultPasswordHash',
          email: row.email || `user_${row.id}@example.com`,
          firstName: row.firstName || '',
          lastName: row.lastName || '',
          userCode: row.userCode || `UC${row.id}`,
          rsaId: row.rsaId || `RSA${row.id}`,
          cellNumber: row.cellNumber || '',
          physicalAddress: row.physicalAddress || '',
          isVerified: row.isVerified || false,
          isActive: row.isActive || true,
        }));
      }

      // Convert date strings to Date objects for specific fields
      return data.map((row: any) => {
        if ('startDate' in row) {
          row.startDate = this.excelDateToDate(row.startDate);
        }
        if ('endDate' in row) {
          row.endDate = this.excelDateToDate(row.endDate);
        }
        return row as T;
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Error reading Excel file ${filePath}:`, err);
      throw new Error(`Failed to read Excel file ${filePath}: ${errorMessage}`);
    }
  }

  private excelDateToDate(excelDate: string | number): Date {
    if (typeof excelDate === 'string') {
      return new Date(excelDate);
    }
    // Excel date number to JavaScript Date
    return new Date((excelDate - 25569) * 86400 * 1000);
  }

  private validateUserData(user: UserRow): void {
    console.log('Validating user:', JSON.stringify(user, null, 2));

    const missingFields: string[] = [];

    // Check required fields
    if (!user.userCode) missingFields.push('userCode');
    if (!user.email) missingFields.push('email');
    if (!user.username) missingFields.push('username');
    if (!user.passwordHash) missingFields.push('passwordHash');
    if (!user.rsaId) missingFields.push('rsaId');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for user: ${missingFields.join(', ')}`);
    }

    // Validate role
    if (!user.role) {
      throw new Error(`Missing role for user: ${user.username}`);
    }

    // Convert the role to uppercase to match the enum format
    const normalizedRole = user.role.toUpperCase().replace(/\s+/g, '');
    if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
      throw new Error(
        `Invalid user role: ${user.role} (normalized: ${normalizedRole}). ` +
          `Valid roles are: ${Object.values(UserRole).join(', ')}`
      );
    }

    // Validate status
    if (!user.status) {
      throw new Error(`Missing status for user: ${user.username}`);
    }

    // Convert the status to uppercase to match the enum format
    const normalizedStatus = user.status.toUpperCase().replace(/\s+/g, '');
    if (!Object.values(UserStatus).includes(normalizedStatus as UserStatus)) {
      throw new Error(
        `Invalid user status: ${user.status} (normalized: ${normalizedStatus}). ` +
          `Valid statuses are: ${Object.values(UserStatus).join(', ')}`
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error(`Invalid email format for user: ${user.username}`);
    }
  }

  private validateQuotaData(quota: QuotaRow): void {
    console.log('Validating quota:', JSON.stringify(quota, null, 2));

    const missingFields: string[] = [];

    // Check required fields
    if (!quota.quotaCode) missingFields.push('quotaCode');
    if (quota.quotaAllocation === undefined) missingFields.push('quotaAllocation');
    if (quota.finalQuotaAllocation === undefined) missingFields.push('finalQuotaAllocation');
    if (!quota.startDate) missingFields.push('startDate');
    if (!quota.endDate) missingFields.push('endDate');
    if (!quota.status) missingFields.push('status');
    if (!quota.season) missingFields.push('season');
    if (!quota.marineResources || !Array.isArray(quota.marineResources))
      missingFields.push('marineResources');
    if (!quota.productType) missingFields.push('productType');
    if (!quota.sectorName) missingFields.push('sectorName');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for quota: ${missingFields.join(', ')}`);
    }

    // Validate status
    if (!Object.values(QuotaStatus).includes(quota.status as QuotaStatus)) {
      throw new Error(
        `Invalid quota status: ${quota.status}. ` +
          `Valid statuses are: ${Object.values(QuotaStatus).join(', ')}`
      );
    }

    // Validate dates
    if (quota.startDate > quota.endDate) {
      throw new Error('Start date must be before end date');
    }

    // Validate numeric fields
    if (quota.quotaAllocation < 0) {
      throw new Error('Quota allocation cannot be negative');
    }
    if (quota.finalQuotaAllocation < 0) {
      throw new Error('Final quota allocation cannot be negative');
    }
    if (quota.quotaUsed < 0) {
      throw new Error('Quota used cannot be negative');
    }

    // Validate thresholds if provided
    if (
      quota.warningThreshold !== undefined &&
      (quota.warningThreshold < 0 || quota.warningThreshold > 100)
    ) {
      throw new Error('Warning threshold must be between 0 and 100');
    }
    if (
      quota.criticalThreshold !== undefined &&
      (quota.criticalThreshold < 0 || quota.criticalThreshold > 100)
    ) {
      throw new Error('Critical threshold must be between 0 and 100');
    }
  }

  private validateRightsholderData(rightsholder: RightsholderRow): void {
    console.log('Validating rightsholder:', JSON.stringify(rightsholder, null, 2));

    const missingFields: string[] = [];

    // Check required fields
    if (!rightsholder.registrationNumber) missingFields.push('registrationNumber');
    if (!rightsholder.permitNumber) missingFields.push('permitNumber');
    if (!rightsholder.rightsholderCode) missingFields.push('rightsholderCode');
    if (!rightsholder.companyName) missingFields.push('companyName');
    if (!rightsholder.contactAddress) missingFields.push('contactAddress');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for rightsholder: ${missingFields.join(', ')}`);
    }
  }

  async importUsers(users: UserRow[]): Promise<Map<string, number>> {
    const userIdMap = new Map<string, number>();

    try {
      await this.prisma.$transaction(async (prisma) => {
        for (const user of users) {
          try {
            this.validateUserData(user);

            const normalizedRole = user.role.toUpperCase().replace(/\s+/g, '') as UserRole;
            const normalizedStatus = user.status.toUpperCase().replace(/\s+/g, '') as UserStatus;

            const companyname = user.companyName || `${user.firstName} ${user.lastName}`.trim();
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const physicalAddress = user.physicalAddress || '';
            const cellNumber = user.cellNumber || '';

            const createdUser = await prisma.user.create({
              data: {
                username: user.username,
                passwordHash: user.passwordHash,
                role: normalizedRole,
                userCode: user.userCode,
                email: user.email,
                firstName,
                lastName,
                companyname: companyname || 'Individual',
                rsaId: user.rsaId,
                cellNumber,
                physicalAddress,
                isVerified: user.isVerified ?? false,
                isActive: user.isActive ?? true,
                status: normalizedStatus,
                preferences: {
                  create: {
                    quotaWarningThreshold: 20,
                    quotaCriticalThreshold: 10,
                    daysBeforeExpiryWarning: 30,
                    emailNotifications: true,
                    dailyDigest: false,
                    weeklyReport: false,
                  },
                },
              },
            });

            userIdMap.set(user.userCode, createdUser.id);
            console.log(`Successfully created user: ${user.username} (${user.userCode})`);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error(`Failed to create user ${user.username}:`, err);
            throw new Error(`Failed to create user ${user.username}: ${errorMessage}`);
          }
        }
      });

      return userIdMap;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error importing users:', err);
      throw new Error(`Failed to import users: ${errorMessage}`);
    }
  }

  async importQuotas(quotas: QuotaRow[], createdById: number): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        for (const quota of quotas) {
          try {
            this.validateQuotaData(quota);

            await prisma.quota.create({
              data: {
                quotaCode: quota.quotaCode.toString(),
                quotaAllocation: quota.quotaAllocation,
                overcatch20232024: quota.overcatch20232024,
                finalQuotaAllocation: quota.finalQuotaAllocation,
                quotaUsed: quota.quotaUsed,
                quotaBalance: quota.quotaBalance,
                startDate: quota.startDate,
                endDate: quota.endDate,
                status: quota.status as QuotaStatus,
                season: quota.season,
                marineResources: quota.marineResources,
                productType: quota.productType,
                sectorName: quota.sectorName,
                catchArea3_4: quota.catchArea3_4,
                catchArea7: quota.catchArea7,
                catchArea8: quota.catchArea8,
                catchArea11: quota.catchArea11,
                zone: quota.zone,
                warningThreshold: quota.warningThreshold ?? 20,
                criticalThreshold: quota.criticalThreshold ?? 10,
                createdBy: createdById,
              },
            });

            console.log(`Successfully created quota: ${quota.quotaCode}`);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error(`Failed to create quota ${quota.quotaCode}:`, err);
            throw new Error(`Failed to create quota ${quota.quotaCode}: ${errorMessage}`);
          }
        }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error importing quotas:', err);
      throw new Error(`Failed to import quotas: ${errorMessage}`);
    }
  }

  async importRightsholders(
    rightsholders: RightsholderRow[],
    userIdMap: Map<string, number>
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        for (const rightsholder of rightsholders) {
          try {
            this.validateRightsholderData(rightsholder);

            const userId = userIdMap.get(rightsholder.rightsholderCode);
            if (!userId) {
              console.warn(`No user found for rightsholder code: ${rightsholder.rightsholderCode}`);
              continue;
            }

            await prisma.rightsholder.create({
              data: {
                userId: userId,
                registrationNumber: rightsholder.registrationNumber,
                permitNumber: rightsholder.permitNumber,
                companyName: rightsholder.companyName,
                contactAddress: rightsholder.contactAddress,
                rightsholderCode: rightsholder.rightsholderCode,
              },
            });
            console.log(`Successfully created rightsholder: ${rightsholder.registrationNumber}`);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error(`Failed to create rightsholder ${rightsholder.registrationNumber}:`, err);
            throw new Error(
              `Failed to create rightsholder ${rightsholder.registrationNumber}: ${errorMessage}`
            );
          }
        }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error importing rightsholders:', err);
      throw new Error(`Failed to import rightsholders: ${errorMessage}`);
    }
  }

  public async importAllData(
    usersFilePath: string,
    quotasFilePath: string,
    rightsholdersFilePath: string,
    adminUserId: number
  ): Promise<void> {
    try {
      console.log('Starting data import process...');

      // Read all data files first to validate their existence and format
      console.log('Reading Excel files...');
      const users = await this.readExcelFile<UserRow>(usersFilePath);
      console.log(`Read ${users.length} users from Excel`);

      const quotas = await this.readExcelFile<QuotaRow>(quotasFilePath);
      console.log(`Read ${quotas.length} quotas from Excel`);

      const rightsholders = await this.readExcelFile<RightsholderRow>(rightsholdersFilePath);
      console.log(`Read ${rightsholders.length} rightsholders from Excel`);

      // Import data in sequence with proper error handling
      console.log('\nStarting user import...');
      const userIdMap = await this.importUsers(users);
      console.log(`Successfully imported ${users.length} users`);

      console.log('\nStarting quota import...');
      await this.importQuotas(quotas, adminUserId);
      console.log(`Successfully imported ${quotas.length} quotas`);

      console.log('\nStarting rightsholder import...');
      await this.importRightsholders(rightsholders, userIdMap);
      console.log(`Successfully imported ${rightsholders.length} rightsholders`);

      console.log('\nData import completed successfully!');
      console.log('Summary:');
      console.log(`- Users imported: ${users.length}`);
      console.log(`- Quotas imported: ${quotas.length}`);
      console.log(`- Rightsholders imported: ${rightsholders.length}`);
    } catch (err: unknown) {
      console.error('\nFatal error during data import:', err);
      if (err instanceof Error) {
        console.error('Stack trace:', err.stack);
        throw new Error(`Data import failed: ${err.message}`);
      } else {
        throw new Error('Data import failed: An unknown error occurred');
      }
    } finally {
      await this.prisma.$disconnect();
      console.log('\nDatabase connection closed.');
    }
  }
}
