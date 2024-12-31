"use server";

import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { RegisterWithQuotaFormValues } from "./validation";

export async function validateQuota(quotaCode: string, rightsholderCode: string) {
  try {
    const quota = await db.quota.findUnique({
      where: {
        quotaCode: quotaCode,
      },
      include: {
        rightsholders: {
          include: {
            rightsholder: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!quota) {
      return { error: "Invalid quota code" };
    }

    const rightsholderQuota = quota.rightsholders.find(
      rq => rq.rightsholder.registrationNumber === rightsholderCode
    );

    if (!rightsholderQuota) {
      return { error: "Invalid rightsholder code" };
    }

    return {
      success: true,
      data: {
        companyName: rightsholderQuota.rightsholder.companyName || null,
        role: rightsholderQuota.rightsholder.user?.role || null,
        status: quota.status
      }
    };
  } catch (error) {
    console.error("Error validating quota:", error);
    return { error: "Failed to validate quota" };
  }
}

export async function signUpWithQuota(values: RegisterWithQuotaFormValues) {
  try {
    const quota = await db.quota.findUnique({
      where: {
        quotaCode: values.quotaCode,
      },
      include: {
        rightsholders: {
          include: {
            rightsholder: true
          }
        }
      }
    });

    if (!quota) {
      return { error: "Invalid quota code" };
    }

    const rightsholderQuota = quota.rightsholders.find(
      rq => rq.rightsholder.registrationNumber === values.rightsholderCode
    );

    if (!rightsholderQuota) {
      return { error: "Invalid rightsholder code" };
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: values.email },
          { username: values.username },
          { rsaId: values.rsaId }
        ]
      }
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await hash(values.password, 10);

    const user = await db.user.create({
      data: {
        username: values.username,
        email: values.email,
        passwordHash: hashedPassword,
        role: values.role,
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        rsaId: values.rsaId,
        cellNumber: values.cellNumber,
        physicalAddress: values.physicalAddress,
        status: "PENDING",
        userCode: `USER${Math.floor(Math.random() * 1000000)}`,
      }
    });

    if (values.companyName) {
      await db.rightsholder.update({
        where: {
          id: rightsholderQuota.rightsholderId
        },
        data: {
          userId: user.id
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error during registration:", error);
    return { error: "Failed to create user" };
  }
}
