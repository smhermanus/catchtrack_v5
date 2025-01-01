import { DataUpserter } from '../utils/db/upsertData.js';
import 'dotenv/config';

async function runUpsert() {
  const upserter = new DataUpserter();

  try {
    await upserter.upsertAllData(
      'C:/Users/Hello/OneDrive/Desktop/users.xlsx',
      1 // Admin user ID
    );
  } catch (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  }
}

runUpsert().catch(console.error);
