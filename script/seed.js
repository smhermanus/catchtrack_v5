import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  try {
    const ADMIN_USER_ID = "6hqxx4ootcrrrkke";

    // Verify the user exists
    const adminUser = await prisma.user.findUnique({
      where: { id: ADMIN_USER_ID },
    });

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Read the JSON file
    const jsonPath = path.join(__dirname, "./quota.json");
    const jsonData = fs.readFileSync(jsonPath, "utf8");
    let quotas = JSON.parse(jsonData);

    // If the data is wrapped in an object with a quotas property, extract it
    if (quotas.quotas) {
      quotas = quotas.quotas;
    }

    console.log(`Found ${quotas.length} quotas to import`);

    // Process quotas in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < quotas.length; i += batchSize) {
      const batch = quotas.slice(i, i + batchSize);

      await prisma.quota.createMany({
        data: batch.map((quota) => ({
          rightsNr: quota.rights_nr,
          quotaCode: quota.quota_code.toString(),
          rightsHolder: quota.rights_holder,
          sectorName: quota.sector_name,
          quotaAllocation: quota.quota_allocation,
          overcatch20232024: quota.overcatch_2023_2024,
          finalQuotaAllocation: quota.final_quota_allocation,
          quotaUsed: quota.quota_used,
          quotaBalance: quota.quota_balance,
          expiryDate: new Date(quota.expiry_date),
          season: quota.season,
          area3_4: quota.area3_4,
          area7: quota.area7,
          area8: quota.area8,
          area11: quota.area11,
          nearshoreZone: quota.nearshore_zone,
          userId: ADMIN_USER_ID,
        })),
      });

      console.log(
        `Imported batch ${i / batchSize + 1} of ${Math.ceil(quotas.length / batchSize)}`,
      );
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
