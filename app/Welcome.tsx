"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
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

      {/* Right Column - Login Content */}
      <div className="w-full lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 dark:from-primary/50 dark:to-primary/30" />
          <div className="absolute inset-0 bg-[radial-gradient(#000_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#fff_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12">
          {/* Logo and Title Section */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6 mb-8 md:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="bg-[#1C72BD] rounded-full p-4 md:p-6">
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                  <Image
                    src="/logo_white.png"
                    alt="CatchTrack Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Welcome to CatchTrack
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto px-4"
            >
              Your comprehensive solution for documenting and managing fishing
              operations
            </motion.p>
          </motion.div>

          {/* Buttons Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col space-y-4 w-full max-w-sm px-4"
          >
            <Link href="/login" className="w-full">
              <Button
                size="lg"
                className="w-full bg-[#1C72BD] text-primary-foreground hover:bg-[#1C72BD]/90"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-[#1C72BD] hover:bg-[#1C72BD]/10"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                New Registration
              </Button>
            </Link>
            <Link href="/registerWithQuota" className="w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-[#1C72BD] hover:bg-[#1C72BD]/10"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Register with Quota Code
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
