// @/lib/validation.ts
import * as z from "zod";

// Define the UserRole enum type
export const UserRole = {
  USER: "USER",
  SYSTEMADMINISTRATOR: "SYSTEMADMINISTRATOR",
  SECURITYADMINISTRATOR: "SECURITYADMINISTRATOR",
  PERMITADMINISTRATOR: "PERMITADMINISTRATOR",
  PERMITHOLDER: "PERMITHOLDER",
  RIGHTSHOLDER: "RIGHTSHOLDER",
  SKIPPER: "SKIPPER",
  INSPECTOR: "INSPECTOR",
  MONITOR: "MONITOR",
  DRIVER: "DRIVER",
  FACTORYSTOCKCONTROLLER: "FACTORYSTOCKCONTROLLER",
  LOCALOUTLETCONTROLLER: "LOCALOUTLETCONTROLLER",
  EXPORTCONTROLLER: "EXPORTCONTROLLER",
  ADMIN: "ADMIN",
} as const;

// Create the proper type for user roles
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Define the type for role objects
export type RoleOption = {
  value: UserRoleType;
  label: string;
};

// Create an array of role objects with values and labels
export const userRoles: RoleOption[] = [
  { value: "USER", label: "User" },
  { value: "SYSTEMADMINISTRATOR", label: "System Administrator" },
  { value: "SECURITYADMINISTRATOR", label: "Security Administrator" },
  { value: "PERMITADMINISTRATOR", label: "Permit Administrator" },
  { value: "PERMITHOLDER", label: "Permit Holder" },
  { value: "RIGHTSHOLDER", label: "Rights Holder" },
  { value: "SKIPPER", label: "Skipper" },
  { value: "INSPECTOR", label: "Inspector" },
  { value: "MONITOR", label: "Monitor" },
  { value: "DRIVER", label: "Driver" },
  { value: "FACTORYSTOCKCONTROLLER", label: "Factory Stock Controller" },
  { value: "LOCALOUTLETCONTROLLER", label: "Local Outlet Controller" },
  { value: "EXPORTCONTROLLER", label: "Export Controller" },
  { value: "ADMIN", label: "Admin" },
];

// Create the Zod enum for validation
export const UserRoleEnum = z.enum([
  "USER",
  "SYSTEMADMINISTRATOR",
  "SECURITYADMINISTRATOR",
  "PERMITADMINISTRATOR",
  "PERMITHOLDER",
  "RIGHTSHOLDER",
  "SKIPPER",
  "INSPECTOR",
  "MONITOR",
  "DRIVER",
  "FACTORYSTOCKCONTROLLER",
  "LOCALOUTLETCONTROLLER",
  "EXPORTCONTROLLER",
  "ADMIN",
] as const);

// Create the Zod schema for registration
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  cellphone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?[\d\s-]+$/, "Please enter a valid phone number"),
  rsaId: z.string().optional(),
  physicalAddress: z.string().optional(),
  roleApplication: UserRoleEnum,
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Form values types
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Login form types
export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// Register with Quota form types
export interface RegisterWithQuotaFormValues {
  quotaCode: string;
  rightsholderCode: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  role: UserRoleType;
  status: string;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
}

// Register with Quota schema
export const registerWithQuotaSchema = z.object({
  quotaCode: z.string().min(1, "Quota code is required"),
  rightsholderCode: z.string().min(1, "Rightsholder code is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  role: z.enum([
    "USER",
    "SYSTEMADMINISTRATOR",
    "SECURITYADMINISTRATOR",
    "PERMITADMINISTRATOR",
    "PERMITHOLDER",
    "RIGHTSHOLDER",
    "SKIPPER",
    "INSPECTOR",
    "MONITOR",
    "DRIVER",
    "FACTORYSTOCKCONTROLLER",
    "LOCALOUTLETCONTROLLER",
    "EXPORTCONTROLLER",
    "ADMIN",
  ]),
  status: z.string(),
  rsaId: z.string().min(13, "RSA ID must be 13 digits").max(13),
  cellNumber: z.string().min(10, "Cell number must be 10 digits").max(10),
  physicalAddress: z.string().min(1, "Physical address is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
