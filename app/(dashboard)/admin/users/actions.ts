'use server';

import { db } from '@/lib/db';
import { hash } from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
}

function generateUserCode(username: string): string {
  // Create a unique code based on username and timestamp
  const prefix = username.slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${random}`;
}

export async function createUser(data: CreateUserData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const exists = await db.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      throw new Error('User already exists');
    }

    const passwordHash = await hash(data.password, 10);
    const userCode = generateUserCode(data.username);

    const user = await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: data.role,
        userCode,
        firstName: data.firstName,
        lastName: data.lastName,
        rsaId: data.rsaId,
        cellNumber: data.cellNumber,
        physicalAddress: data.physicalAddress,
      },
    });

    revalidatePath('/admin/users');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE') {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      throw new Error('Invalid user ID');
    }

    const user = await db.user.update({
      where: { id: parsedUserId },
      data: { 
        isActive: status === 'ACTIVE',
      },
    });

    revalidatePath('/admin/users');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update user status:', error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      throw new Error('Invalid user ID');
    }

    await db.user.delete({
      where: { id: parsedUserId },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}
