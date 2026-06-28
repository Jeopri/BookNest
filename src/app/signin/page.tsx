'use client'
import { TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from "sonner";
export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    console.log("Login response:", JSON.stringify(res, null, 2));

    if (res?.ok){
      try {
        const sessionRes = await fetch('/api/auth/user');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          console.log("User session data:", JSON.stringify(sessionData, null, 2));
        }
      } catch (e) {
        console.error("Failed to fetch session data:", e);
      }
      setPending(false);
      toast.success("login successful")
      router.push("/dashboard");

  }else if(res?.status === 400){
    setPending(false);
    toast.error("Invalid Credentials")
  }else {
    toast.error("Something went wrong")
    setPending(false);
  }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <main className="w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900 dark:shadow-none">
          <div className="px-8 py-10 sm:px-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image
                src="/images/g.png"
                width={56}
                height={56}
                alt="Moneycache"
                className="rounded-full"
              />
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Sign in to your account
              </h1>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Enter your credentials to access the dashboard and manage your book inventory.
              </p>
            </div>
            {!!error && (
              <div className="mt-6 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
                <div className="flex items-center gap-2">
                  <TriangleAlert />
                  <p>{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email address
                </label>
                <input
                  type="email"
                  disabled={pending}
                  value={email}
                  name="email"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  disabled={pending}
                  value={password}
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
                <label className="inline-flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-slate-500"
                    required
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {pending ? 'Signing in...' : 'Log In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              New here? <Link href="/register" className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300">Go back home</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}