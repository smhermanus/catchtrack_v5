import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

// Define the UserRole enum to match your schema
enum UserRole {
  USER = "USER",
  SYSTEMADMINISTRATOR = "SYSTEMADMINISTRATOR",
  ADMIN = "ADMIN",
  SECURITYADMINISTRATOR = "SECURITYADMINISTRATOR",
  PERMITADMINISTRATOR = "PERMITADMINISTRATOR",
  PERMITHOLDER = "PERMITHOLDER",
  RIGHTSHOLDER = "RIGHTSHOLDER",
  SKIPPER = "SKIPPER",
  INSPECTOR = "INSPECTOR",
  MONITOR = "MONITOR",
  DRIVER = "DRIVER",
  FACTORYSTOCKCONTROLLER = "FACTORYSTOCKCONTROLLER",
  LOCALOUTLETCONTROLLER = "LOCALOUTLETCONTROLLER",
  EXPORTCONTROLLER = "EXPORTCONTROLLER",
}

// Define the routes for each role
const roleRoutes: Record<UserRole, string> = {
  [UserRole.USER]: "/",
  [UserRole.SYSTEMADMINISTRATOR]: "/system_admin",
  [UserRole.ADMIN]: "/admin",
  [UserRole.SECURITYADMINISTRATOR]: "/security_admin",
  [UserRole.PERMITADMINISTRATOR]: "/permit_admin",
  [UserRole.PERMITHOLDER]: "/permit_holder",
  [UserRole.RIGHTSHOLDER]: "/rights_holder",
  [UserRole.SKIPPER]: "/skipper",
  [UserRole.INSPECTOR]: "/inspector",
  [UserRole.MONITOR]: "/monitor",
  [UserRole.DRIVER]: "/driver",
  [UserRole.FACTORYSTOCKCONTROLLER]: "/factory-stock_controller",
  [UserRole.LOCALOUTLETCONTROLLER]: "/local-outlet_controller",
  [UserRole.EXPORTCONTROLLER]: "/export_controller",
};

// Function to safely convert string to UserRole
function toUserRole(role: string): UserRole | undefined {
  return Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : undefined;
}

export default async function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    const userRole = toUserRole(user.role);

    if (userRole && userRole in roleRoutes) {
      redirect(roleRoutes[userRole]);
    } else {
      // Log the unrecognized role and redirect to login
      console.warn(`Unrecognized user role: ${user.role}`);
      redirect("/login");
    }
  }

  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
}
