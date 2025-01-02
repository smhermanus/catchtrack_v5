import { NextResponse } from 'next/server';
import { validateRequest } from '../../../auth';
import { db } from '@/lib/db';
import { UserStatus, DocStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await db.user.findMany({
      include: {
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Handle user creation logic here

    revalidatePath('/system_admin/users');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
