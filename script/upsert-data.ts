// scripts/upsert-data.ts
import { DataUpserter } from '../utils/db/upsertData';
import 'dotenv/config';

async function runUpsert() {
    console.log('Starting data upsert process...');
    
    const upserter = new DataUpserter();
    
    try {
        await upserter.upsertAllData(
            'C:/Users/Hello/OneDrive/Desktop/rightsholders.xlsx',
            1 // Admin user ID (not used for quotas but kept for consistency)
        );
    } catch (error) {
        console.error('Upsert failed:', error);
        process.exit(1);
    }
}

runUpsert().catch(console.error);