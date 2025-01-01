'use server';

import prisma from '@/lib/prisma';
import { hash } from '@node-rs/argon2';
import { generateId } from 'lucia';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';
import { RegisterFormValues, registerSchema } from './validation';

export async function signUp(formData: RegisterFormValues): Promise<{ error?: string } | never> {
  try {
    // Validate the form data
    const validatedData = registerSchema.parse(formData);

    // Generate userCode only (remove userId generation)
    const userCode = `CT${generateId(8).toUpperCase()}`; // Generate a unique user code with CT prefix

    // Hash the password
    const passwordHash = await hash(validatedData.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Check for existing username
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: validatedData.username,
          mode: 'insensitive',
        },
      },
    });

    if (existingUsername) {
      return {
        error: 'Username already taken',
      };
    }

    // Check for existing email
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: validatedData.email,
          mode: 'insensitive',
        },
      },
    });

    if (existingEmail) {
      return {
        error: 'Email already taken',
      };
    }

    // Create the user in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          username: validatedData.username,
          email: validatedData.email,
          passwordHash,
          userCode,
          firstName: validatedData.firstName || '', // These will be collected later
          lastName: validatedData.lastName || '',
          rsaId: validatedData.rsaId || `TEMP${generateId(6)}`, // Temporary RSA ID
          cellNumber: validatedData.cellphone || '', // Use cellphone from form
          physicalAddress: validatedData.physicalAddress || '', // Use provided address or empty string
          role: validatedData.roleApplication, // Use the roleApplication value directly for the role field
          isVerified: false,
          isActive: true,
          profilePictureUrl: null,
          companyname: validatedData.companyName || 'Default Company', // Add companyname
        },
      });
    });

    // Redirect to success page or pending approval page
    redirect('/register-pending-message');
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error('Registration error:', error);

    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}
