"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Abstracted OTP generation call here.
    // In actual implementation this calls a tRPC endpoint or Next.js server action
    // to dispatch the email and log an OTP code into the db for verification.
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <KeyRound className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Remember your password? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="text-sm text-gray-700">
                If an account exists for <span className="font-medium text-gray-900">{email}</span>, we&apos;ve sent an OTP to reset your password.
              </div>
              <div>
                <Link href="/login">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Log In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@stitch.com"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Send reset OTP
                </Button>
              </div>
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
}
