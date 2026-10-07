"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"login" | "signup">("login");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Invalid email or password."); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">CoreInventory</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(["login","signup"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors capitalize ${
                tab === t ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}>
              {t === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSignIn} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="name@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <a href="/reset-password" className="text-xs text-indigo-600 hover:underline">Forgot Password?</a>
            </div>
            <div className="relative">
              <Input id="password" type={show ? "text" : "password"} placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded" />
            Remember me for 30 days
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? "Signing in..." : (<>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>)}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h4v4H3V3zm0 7h4v4H3v-4zm0 7h4v4H3v-4zm7-14h4v4h-4V3zm0 7h4v4h-4v-4zm0 7h4v4h-4v-4zm7-14h4v4h-4V3zm0 7h4v4h-4v-4zm0 7h4v4h-4v-4z"/></svg>
              SSO
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 pt-2">
            Protected by enterprise-grade 256-bit encryption.{" "}
            <a href="#" className="text-indigo-600 hover:underline">Learn more</a>
          </p>
        </form>
      </div>

      <div className="flex gap-4 mt-6 text-xs text-gray-400">
        {["Privacy Policy","Terms of Service","Status","Contact Support"].map(l => (
          <a key={l} href="#" className="hover:text-gray-600">{l}</a>
        ))}
      </div>
    </div>
  );
}
