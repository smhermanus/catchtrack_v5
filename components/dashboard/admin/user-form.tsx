'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';

const userFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(30, { message: 'Username must not be longer than 30 characters.' }),
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters.' })
    .max(30, { message: 'First name must not be longer than 30 characters.' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters.' })
    .max(30, { message: 'Last name must not be longer than 30 characters.' }),
  email: z.string().min(1, { message: 'Email is required.' }).email('This is not a valid email.'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
      message: 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number.',
    }),
  rsaId: z
    .string()
    .min(13, { message: 'RSA ID must be 13 digits.' })
    .max(13, { message: 'RSA ID must be 13 digits.' })
    .regex(/^[0-9]+$/, { message: 'RSA ID must only contain numbers.' }),
  cellNumber: z
    .string()
    .min(10, { message: 'Cell number must be at least 10 digits.' })
    .max(15, { message: 'Cell number must not be longer than 15 digits.' })
    .regex(/^[0-9+]+$/, { message: 'Cell number must only contain numbers and + symbol.' }),
  physicalAddress: z
    .string()
    .min(5, { message: 'Physical address must be at least 5 characters.' })
    .max(200, { message: 'Physical address must not be longer than 200 characters.' }),
  role: z.nativeEnum(UserRole, {
    required_error: 'Please select a role.',
  }),
});

interface CreateUserFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
  role: UserRole;
}

interface UserFormProps {
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  initialData?: Partial<CreateUserFormData>;
}

const defaultValues: Partial<CreateUserFormData> = {
  role: UserRole.USER,
};

export function UserForm({ onSubmit, initialData }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || defaultValues,
  });

  async function handleSubmit(data: CreateUserFormData) {
    try {
      setIsLoading(true);
      await onSubmit(data);
      form.reset();
      toast.success('User created successfully');
    } catch (error) {
      toast.error('Failed to create user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormDescription>This is the user&apos;s username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
              <FormDescription>This is the user&apos;s first name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} />
              </FormControl>
              <FormDescription>This is the user&apos;s last name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" type="email" {...field} />
              </FormControl>
              <FormDescription>This will be used for login and notifications.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rsaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RSA ID</FormLabel>
              <FormControl>
                <Input placeholder="RSA ID" {...field} />
              </FormControl>
              <FormDescription>This is the user&apos;s RSA ID.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cellNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cell Number</FormLabel>
              <FormControl>
                <Input placeholder="Cell Number" {...field} />
              </FormControl>
              <FormDescription>This is the user&apos;s cell number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="physicalAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Physical Address</FormLabel>
              <FormControl>
                <Input placeholder="Physical Address" {...field} />
              </FormControl>
              <FormDescription>This is the user&apos;s physical address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                  <SelectItem value={UserRole.MONITOR}>Monitor</SelectItem>
                  <SelectItem value={UserRole.SKIPPER}>Skipper</SelectItem>
                  <SelectItem value={UserRole.RIGHTSHOLDER}>Rights Holder</SelectItem>
                  <SelectItem value={UserRole.SYSTEMADMINISTRATOR}>System Administrator</SelectItem>
                  <SelectItem value={UserRole.SECURITYADMINISTRATOR}>
                    Security Administrator
                  </SelectItem>
                  <SelectItem value={UserRole.PERMITADMINISTRATOR}>Permit Administrator</SelectItem>
                  <SelectItem value={UserRole.PERMITHOLDER}>Permit Holder</SelectItem>
                  <SelectItem value={UserRole.INSPECTOR}>Inspector</SelectItem>
                  <SelectItem value={UserRole.DRIVER}>Driver</SelectItem>
                  <SelectItem value={UserRole.FACTORYSTOCKCONTROLLER}>
                    Factory Stock Controller
                  </SelectItem>
                  <SelectItem value={UserRole.LOCALOUTLETCONTROLLER}>
                    Local Outlet Controller
                  </SelectItem>
                  <SelectItem value={UserRole.EXPORTCONTROLLER}>Export Controller</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This determines the user&apos;s permissions and access level.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </Form>
  );
}
