'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Brain, Code, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/projects');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gray-950 lg:flex lg:flex-col lg:justify-between">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[10%] left-[10%] h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-purple-600/15 blur-[100px] animate-float-reverse" />
          <div className="absolute top-[50%] left-[50%] h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-600/10 blur-[80px] animate-float" />
        </div>
        <div className="bg-grid absolute inset-0 opacity-30" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PromptCorp<span className="text-indigo-400"> OS</span></span>
          </div>

          <h2 className="text-4xl font-bold text-white xl:text-5xl">
            Build production apps
            <span className="block text-gradient mt-1">with one prompt.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-gray-400 leading-relaxed">
            11 AI agents collaborate to transform your idea into a fully deployed application — code, tests, CI/CD, and Kubernetes included.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: Brain, label: 'Multi-Agent AI' },
              { icon: Code, label: 'Full-Stack Code' },
              { icon: Rocket, label: 'Auto Deploy' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm"
              >
                <item.icon className="h-3.5 w-3.5 text-indigo-400" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10 border-t border-white/5 px-12 py-8 xl:px-16">
          <p className="text-sm italic text-gray-400">
            &ldquo;Went from a napkin sketch to a deployed Kubernetes app in 12 minutes. This is the future.&rdquo;
          </p>
          <p className="mt-2 text-xs text-gray-500">— Early Access User</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="relative flex w-full flex-col justify-center bg-gray-950 px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Mobile orb */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute top-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
        </div>

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-lg font-bold text-white">PromptCorp<span className="text-indigo-400"> OS</span></span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-gray-400">Sign in to your account to continue building.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {!loading && <span>Sign In</span>}
              {!loading && <ArrowRight className="h-4 w-4" />}
              {loading && <span>Signing in...</span>}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
