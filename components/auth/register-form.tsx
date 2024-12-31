'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { register } from '@/actions/auth';
import { registerSchema } from '@/lib/validations/auth';
import { signIn } from 'next-auth/react';

type FormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rsaId: '',
      cellNumber: '',
      physicalAddress: '',
      userCode: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    
    try {
      // Log the form values
      console.log('Form values:', JSON.stringify(values, null, 2));

      // Validate the data
      const validationResult = registerSchema.safeParse(values);
      
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.errors);
        form.setError('root', { 
          message: 'Please check all fields and try again' 
        });
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            form.setError(error.path[0] as keyof FormData, {
              message: error.message
            });
          }
        });
        return;
      }

      console.log('Validation successful, parsed data:', JSON.stringify(validationResult.data, null, 2));

      // Extract everything except confirmPassword
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registrationData } = validationResult.data;
      console.log('Registration data being sent:', JSON.stringify(registrationData, null, 2));
      
      const result = await register(registrationData);
      console.log('Registration result:', JSON.stringify(result, null, 2));

      if (!result) {
        throw new Error('Registration failed - no response from server');
      }

      if (result.error) {
        form.setError('root', { 
          message: result.error 
        });
        return;
      }

      if (!result.success) {
        form.setError('root', { 
          message: 'Registration failed. Please try again.' 
        });
        return;
      }

      // Sign in after successful registration
      console.log('Attempting sign in with:', { 
        email: registrationData.email,
        password: '[REDACTED]'
      });

      const signInResult = await signIn('credentials', {
        email: registrationData.email,
        password: registrationData.password,
        redirect: false,
      });

      console.log('Sign in result:', signInResult);

      if (signInResult?.error) {
        console.error('Sign in error:', signInResult.error);
        form.setError('root', { 
          message: 'Registration successful but could not sign in automatically. Please try signing in manually.' 
        });
        router.push('/auth/login');
        return;
      }

      // Redirect to dashboard on successful sign in
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Registration error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      form.setError('root', { 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md border border-red-200">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
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
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="rsaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RSA ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter your RSA ID" {...field} />
              </FormControl>
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
                <Input placeholder="+27..." {...field} />
              </FormControl>
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
                <Input placeholder="Enter your address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter user code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </Form>
  );
}
