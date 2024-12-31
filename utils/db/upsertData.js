import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';

class DataUpserter {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async readExcelFile(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = xlsx.utils.sheet_to_json(worksheet, { 
                raw: false,
                dateNF: 'yyyy-mm-dd',
                defval: '',
                header: 1 // Use array format to handle headers
            });

            // Skip the header row and convert to objects
            const headers = rows[0].map(header => header.trim().toLowerCase());
            console.log('Excel Headers:', headers);

            const data = rows.slice(1)
                .filter(row => row.some(cell => cell !== '')) // Filter out empty rows
                .map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        if (row[index] !== undefined && row[index] !== '') {
                            obj[header] = row[index];
                        }
                    });
                    return obj;
                });

            // Log the first row as a sample
            if (data.length > 0) {
                console.log('\nSample Row (before conversion):', data[0]);
            }

            const convertedData = data.map(row => {
                // Convert Excel dates to JavaScript Date objects
                if ('startdate' in row) {
                    row.startDate = this.excelDateToDate(row.startdate);
                    delete row.startdate;
                }
                if ('enddate' in row) {
                    row.endDate = this.excelDateToDate(row.enddate);
                    delete row.enddate;
                }

                // Convert field names to match our schema
                if ('usercode' in row) {
                    row.userCode = row.usercode;
                    delete row.usercode;
                }
                if ('firstname' in row) {
                    row.firstName = row.firstname;
                    delete row.firstname;
                }
                if ('lastname' in row) {
                    row.lastName = row.lastname;
                    delete row.lastname;
                }
                if ('companyname' in row) {
                    row.companyName = row.companyname;
                    delete row.companyname;
                }
                if ('cellnumber' in row) {
                    row.cellNumber = row.cellnumber;
                    delete row.cellnumber;
                }
                if ('physicaladdress' in row) {
                    row.physicalAddress = row.physicaladdress;
                    delete row.physicaladdress;
                }
                if ('passwordhash' in row) {
                    row.passwordHash = row.passwordhash;
                    delete row.passwordhash;
                }
                if ('rsaid' in row) {
                    row.rsaId = row.rsaid;
                    delete row.rsaid;
                }
                if ('isverified' in row) {
                    row.isVerified = row.isverified.toLowerCase() === 'true';
                    delete row.isverified;
                }
                if ('isactive' in row) {
                    row.isActive = row.isactive.toLowerCase() === 'true';
                    delete row.isactive;
                }

                return row;
            });

            // Log the first converted row as a sample
            if (convertedData.length > 0) {
                console.log('\nSample Row (after conversion):', convertedData[0]);
            }

            return convertedData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error(`Error reading Excel file ${filePath}:`, err);
            throw new Error(`Failed to read Excel file ${filePath}: ${errorMessage}`);
        }
    }

    excelDateToDate(excelDate) {
        if (typeof excelDate === 'string') {
            return new Date(excelDate);
        }
        return new Date((excelDate - 25569) * 86400 * 1000);
    }

    validateUser(user, index) {
        // Log the user object for debugging
        console.log(`\nValidating user at row ${index + 2}:`, user);

        const requiredFields = ['userCode', 'username', 'role', 'status'];
        const missingFields = requiredFields.filter(field => !user[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Row ${index + 2}: Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate role and status
        const validRoles = ['ADMIN', 'USER', 'RIGHTSHOLDER', 'INSPECTOR'];
        const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];

        const role = user.role.toString().toUpperCase().replace(/\s+/g, '');
        const status = user.status.toString().toUpperCase().replace(/\s+/g, '');

        if (!validRoles.includes(role)) {
            throw new Error(`Row ${index + 2}: Invalid role '${user.role}'. Must be one of: ${validRoles.join(', ')}`);
        }

        if (!validStatuses.includes(status)) {
            throw new Error(`Row ${index + 2}: Invalid status '${user.status}'. Must be one of: ${validStatuses.join(', ')}`);
        }

        return {
            ...user,
            role,
            status
        };
    }

    async upsertUsers(users) {
        const userIdMap = new Map();

        try {
            await this.prisma.$transaction(async (prisma) => {
                for (let i = 0; i < users.length; i++) {
                    try {
                        const user = this.validateUser(users[i], i);
                        const companyname = user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim();

                        const upsertedUser = await prisma.user.upsert({
                            where: { userCode: user.userCode },
                            update: {
                                email: user.email || '',
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                companyname: companyname || 'Individual',
                                cellNumber: user.cellNumber || '',
                                physicalAddress: user.physicalAddress || '',
                                role: user.role,
                                status: user.status,
                                isActive: user.isActive ?? true
                            },
                            create: {
                                username: user.username,
                                passwordHash: user.passwordHash || '',
                                role: user.role,
                                userCode: user.userCode,
                                email: user.email || '',
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                companyname: companyname || 'Individual',
                                rsaId: user.rsaId || '',
                                cellNumber: user.cellNumber || '',
                                physicalAddress: user.physicalAddress || '',
                                isVerified: user.isVerified ?? false,
                                isActive: user.isActive ?? true,
                                status: user.status,
                                preferences: {
                                    create: {
                                        quotaWarningThreshold: 20,
                                        quotaCriticalThreshold: 10,
                                        daysBeforeExpiryWarning: 30,
                                        emailNotifications: true,
                                        dailyDigest: false,
                                        weeklyReport: false
                                    }
                                }
                            }
                        });

                        userIdMap.set(user.userCode, upsertedUser.id);
                        console.log(`Successfully upserted user: ${user.username} (${user.userCode})`);
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                        console.error(`Failed to upsert user at row ${i + 2}:`, err);
                        throw new Error(`Failed to upsert user at row ${i + 2}: ${errorMessage}`);
                    }
                }
            });

            return userIdMap;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error upserting users:', err);
            throw new Error(`Failed to upsert users: ${errorMessage}`);
        }
    }

    async upsertAllData(usersFilePath, adminUserId) {
        try {
            console.log('Starting data upsert process...');

            console.log('Reading Excel files...');
            const users = await this.readExcelFile(usersFilePath);
            console.log(`Read ${users.length} users from Excel`);

            console.log('\nStarting user upsert...');
            await this.upsertUsers(users);
            console.log(`Successfully upserted ${users.length} users`);

            console.log('\nData upsert completed successfully!');
            console.log(`Summary:`);
            console.log(`- Users upserted: ${users.length}`);
        } catch (err) {
            console.error('\nFatal error during data upsert:', err);
            if (err instanceof Error) {
                console.error('Stack trace:', err.stack);
                throw new Error(`Data upsert failed: ${err.message}`);
            } else {
                throw new Error('Data upsert failed: An unknown error occurred');
            }
        } finally {
            await this.prisma.$disconnect();
            console.log('\nDatabase connection closed.');
        }
    }
}

export { DataUpserter };
