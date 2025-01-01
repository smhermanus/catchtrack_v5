import { DataImporter } from '../utils/db/importData';
import dotenv from 'dotenv';

dotenv.config();

async function runImport() {
  const importer = new DataImporter();

  try {
    await importer.importAllData(
      'C:/Users/Hello/OneDrive/Desktop/users.xlsx',
      'C:/Users/Hello/OneDrive/Desktop/quotas.xlsx',
      'C:/Users/Hello/OneDrive/Desktop/rightsholders.xlsx',
      1 // Admin user ID
    );
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

runImport().catch(console.error);
