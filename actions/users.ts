'use server';

import { db } from '@/lib/db';
import { hash } from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { users };
  } catch {
    return { error: 'Failed to fetch users' };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: parseInt(id) },
    });
    return { user };
  } catch {
    return { error: 'Failed to fetch user' };
  }
}

export async function createUser({
  firstName,
  email,
  password,
  role,
  lastName,
  rsaId,
  cellNumber,
  physicalAddress,
  companyname,
}: {
  firstName: string;
  email: string;
  password: string;
  role: UserRole;
  lastName: string;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
  companyname?: string;
}) {
  try {
    const exists = await db.user.findUnique({
      where: { email },
    });

    if (exists) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await hash(password, 10);

    // Generate a unique username from email
    const username = email.split('@')[0];

    // Generate a unique user code
    const userCode = `USR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role,
        userCode,
        firstName,
        lastName,
        rsaId,
        cellNumber,
        physicalAddress,
        companyname: companyname || 'Default Company',
      },
    });

    revalidatePath('/admin/users');
    return { user };
  } catch {
    return { error: 'Failed to create user' };
  }
}

export async function updateUser(
  id: string,
  data: Partial<{
    firstName: string;
    email: string;
    role: UserRole;
    lastName: string;
    rsaId: string;
    cellNumber: string;
    physicalAddress: string;
  }>
) {
  try {
    const user = await db.user.update({
      where: { id: parseInt(id) },
      data,
    });

    revalidatePath('/admin/users');
    return { user };
  } catch {
    return { error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await db.user.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { error: 'Failed to delete user' };
  }
}
