'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  registerWithQuotaSchema,
  userRoles,
  type RegisterWithQuotaFormValues,
  UserRole,
} from './validation';
import { signUpWithQuota, validateQuota } from './actions';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RegisterForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [quotaDetails, setQuotaDetails] = React.useState<{
    companyName: string | null;
    role: string | null;
    status: string;
  } | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<RegisterWithQuotaFormValues>({
    resolver: zodResolver(registerWithQuotaSchema),
    defaultValues: {
      quotaCode: '',
      rightsholderCode: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      companyName: '',
      role: UserRole.USER,
      status: '',
      rsaId: '',
      cellNumber: '',
      physicalAddress: '',
    },
  });

  const onSubmit = async (data: RegisterWithQuotaFormValues) => {
    try {
      setIsPending(true);
      const result = await signUpWithQuota(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Registration successful!');
      router.push('/register-pending-message');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const validateQuotaDetails = async (quotaCode: string, rightsholderCode: string) => {
    if (!quotaCode || !rightsholderCode) return;

    try {
      const result = await validateQuota(quotaCode, rightsholderCode);
      if (result.error) {
        toast.error(result.error);
        setQuotaDetails(null);
        return;
      }

      if (result.success && result.data) {
        setQuotaDetails(result.data);
        form.setValue('role', result.data.role || UserRole.USER);
        form.setValue('status', result.data.status);
        if (result.data.companyName) {
          form.setValue('companyName', result.data.companyName);
        }
      }
    } catch (error) {
      toast.error('Failed to validate quota details');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Background Image */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/bg_landing.png"
          alt="Fishing background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right Column - Registration Form */}
      <div className="w-full lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 dark:from-primary/50 dark:to-primary/30" />
          <div className="absolute inset-0 bg-[radial-gradient(#000_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#fff_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 py-8 md:px-8 lg:px-12">
          {!isClient ? (
            <div className="w-full max-w-md mx-auto space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-48" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center">
                    <div className="bg-[#1C72BD] rounded-full p-1.5">
                      <div className="relative w-5 h-5">
                        <Image
                          src="/logo_white.png"
                          alt="CatchTrack Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </Link>
                  <h1 className="text-xl font-semibold">Register with Quota</h1>
                </div>
              </div>

              <div className="space-y-2 text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your quota details to register for CatchTrack
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quotaCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quota Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter quota code"
                              disabled={isPending}
                              onChange={(e) => {
                                field.onChange(e);
                                validateQuotaDetails(
                                  e.target.value,
                                  form.getValues('rightsholderCode')
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rightsholderCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rightsholder Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter rightsholder code"
                              disabled={isPending}
                              onChange={(e) => {
                                field.onChange(e);
                                validateQuotaDetails(form.getValues('quotaCode'), e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {quotaDetails && (
                    <>
                      {quotaDetails.companyName ? (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={true} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter first name"
                                    disabled={isPending}
                                  />
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
                                  <Input
                                    {...field}
                                    placeholder="Enter last name"
                                    disabled={isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Create username"
                                  disabled={isPending}
                                />
                              </FormControl>
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
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Enter email"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="Create password"
                                    disabled={isPending}
                                  />
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
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="Confirm password"
                                    disabled={isPending}
                                  />
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
                                <Input {...field} placeholder="Enter RSA ID" disabled={isPending} />
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
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="Enter cell number"
                                  disabled={isPending}
                                />
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
                                <Input
                                  {...field}
                                  placeholder="Enter physical address"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#1C72BD] text-primary-foreground hover:bg-[#1C72BD]/90"
                    disabled={isPending || !quotaDetails}
                  >
                    {isPending ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
