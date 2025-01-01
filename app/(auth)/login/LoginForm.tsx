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
import { Checkbox } from '@/components/ui/checkbox';
import { LoginFormValues, loginSchema } from './validation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { login } from './actions';

const LoginForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsPending(true);

      const result = await login(data);

      if (result?.error) {
        toast.error(result.error);
        if (result.error.includes('Invalid email or password')) {
          form.setError('email', { message: 'Invalid credentials' });
          form.setError('password', { message: 'Invalid credentials' });
        }
        return;
      }

      if (result?.redirectPath) {
        toast.success('Logged in successfully!');
        router.push(result.redirectPath);
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
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

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 dark:from-primary/50 dark:to-primary/30" />
          <div className="absolute inset-0 bg-[radial-gradient(#000_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#fff_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 py-8 md:px-8 lg:px-12">
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
                <h1 className="text-xl font-semibold">Login to CatchTrack</h1>
              </div>
            </div>

            <div className="space-y-2 text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          placeholder="Enter your email"
                          disabled={isPending}
                        />
                      </FormControl>
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
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#1C72BD] text-primary-foreground hover:bg-[#1C72BD]/90"
                  disabled={isPending}
                >
                  {isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
