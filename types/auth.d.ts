// Authentication Actions Type Declarations
import { User, UserRole } from '@prisma/client';

export interface AuthUser extends Omit<User, 'password' | 'passwordHash'> {
  role: UserRole;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  token?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorAuthenticationOptions {
  method: 'totp' | 'sms' | 'email';
  phoneNumber?: string;
  emailAddress?: string;
}

export interface AuthActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface AuthActions {
  login(credentials: LoginCredentials): Promise<AuthActionResponse<AuthUser>>;
  register(credentials: RegisterCredentials): Promise<AuthActionResponse<AuthUser>>;
  logout(): Promise<AuthActionResponse>;
  resetPasswordRequest(request: PasswordResetRequest): Promise<AuthActionResponse>;
  resetPasswordConfirm(confirmation: PasswordResetConfirmation): Promise<AuthActionResponse>;
  setupTwoFactorAuth(options: TwoFactorAuthenticationOptions): Promise<AuthActionResponse>;
  verifyTwoFactorCode(code: string): Promise<AuthActionResponse>;
}

export interface SessionData {
  user: AuthUser;
  expires: string;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user?: AuthUser;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
}

// Utility Types for Authorization
export type Permission =
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:projects'
  | 'write:projects'
  | 'delete:projects'
  | 'admin:system';

export function hasPermission(user: AuthUser, permission: Permission): boolean;

// Server-side Authentication Middleware Types
export interface AuthMiddlewareOptions {
  requiredPermissions?: Permission[];
  requireAuthentication?: boolean;
}

export type AuthMiddleware = (options?: AuthMiddlewareOptions) => Promise<AuthActionResponse>;
