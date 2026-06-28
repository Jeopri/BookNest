'use client'
import { TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from "sonner";
export default function Home() {
  const router = useRouter();
const [form, setForm] = useState({
  firstname: "",
  lastname: "",
  email: "",
  password: "",
})
const [error, setError] = useState(null);
const [pending, setPending] = useState(false)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setPending(true);

  try {
    const res = await fetch('/api/auth/signup', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.status === 400) {
     setError(data.message);
      setPending(false);
      
    } else if (res.status ===201) {
      setPending(false);
      toast.success(data.message);
      router.push("/signin"); 
    } 
    else if(res.status === 500){
      setError(data.message);
      setPending(false)
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    setPending(false);
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900 dark:shadow-none">
          <div className="px-8 py-10 sm:px-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image
                src="/images/g.png"
                width={50}
                height={50}
                alt="Moneycache"
                className="rounded-full"
              />
            </div>
            {!! error && (
              <div className="bg-destructive/15 p-3 rounded-md text-destructive flex items-center gap-x-2 text-sm mb-6">
                <TriangleAlert />
                <p>{error}</p>
              </div>
            )}
            <h1 className="text-xl font-bold leading-tight tracking-tight text-center text-gray-900 md:text-xl dark:text-white">
              Register an Account
            </h1>
            <p className="text-red-500 text-sm"></p>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                <input 
                  type="text" 
                  disabled={pending}
                  value={form.firstname}
                  name="firstname" 
                  onChange={(e) => setForm({...form, firstname:e.target.value})}
                  className="text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="jhon" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                <input 
                  type="text"     
                  disabled={pending}
                  value={form.lastname}
                  name="lastname" 
                  id="lastname" 
                  onChange={(e) => setForm({...form, lastname:e.target.value})}
                  className="text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="doe" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email}
                  disabled={pending}
                  onChange={(e) => setForm({...form, email:e.target.value})}
                  id="email" 
                  className="text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                <input 
                  type="password" 
                  disabled={pending}
                  name="password" 
                  value={form.password}
                  id="password" 
                  onChange={(e) => setForm({...form, password:e.target.value})}
                  placeholder="••••••••" 
                  className="text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-500 dark:text-gray-300">Remember me</label>
                </div>
                <a href="/forgot-password" className="text-sm ml-2 text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
              </div>
                <button 
                type="submit" 
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 "
              >Register
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
              Sign up with Google
            </button>

              <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">Already Have an Account? <Link href="/signin" className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300">Click me!</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}