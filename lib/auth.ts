import { compare } from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import { UserRole } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';

// Extend the default types to include role
declare module 'next-auth' {
  interface User {
    role: UserRole;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(credentials, req) {
        console.log('Authorizing with credentials:', {
          email: credentials?.email,
          password: credentials?.password ? '[REDACTED]' : undefined,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error('User not found');
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            console.error('Invalid password');
            return null;
          }

          console.log('Successfully authenticated user:', user.email);

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          email: token.email,
          name: `${token.firstName} ${token.lastName}`,
          firstName: token.firstName,
          lastName: token.lastName,
          role: token.role as UserRole,
        },
      };
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};
