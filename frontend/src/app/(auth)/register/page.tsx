'use client';

import { useState, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
  Brain,
  Code,
  Rocket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
];

function getStrength(password: string): { score: number; label: string; color: string } {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
  if (passed === 2) return { score: 50, label: 'Fair', color: 'bg-orange-500' };
  if (passed === 3) return { score: 75, label: 'Good', color: 'bg-yellow-500' };
  return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Account created! Welcome to PromptCorp OS');
      router.push('/projects');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gray-950 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[15%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[15%] left-[10%] h-[350px] w-[350px] rounded-full bg-indigo-600/15 blur-[100px] animate-float-reverse" />
          <div className="absolute top-[45%] left-[40%] h-[200px] w-[200px] rounded-full bg-cyan-600/10 blur-[80px] animate-float" />
        </div>
        <div className="bg-grid absolute inset-0 opacity-30" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PromptCorp<span className="text-indigo-400"> OS</span></span>
          </div>

          <h2 className="text-4xl font-bold text-white xl:text-5xl">
            Ship your ideas
            <span className="block text-gradient mt-1">in minutes, not months.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-gray-400 leading-relaxed">
            Create an account to start building production-ready applications with our multi-agent AI platform.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {[
              { icon: Brain, text: '11 AI agents working in parallel' },
              { icon: Code, text: 'Full-stack code generation with tests' },
              { icon: Rocket, text: 'Docker + Kubernetes deployment ready' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-gray-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <item.icon className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/5 px-12 py-8 xl:px-16">
          <p className="text-xs text-gray-500">Free tier includes 3 projects per month. No credit card required.</p>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="relative flex w-full flex-col justify-center bg-gray-950 px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[80px]" />
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
            <h1 className="text-3xl font-bold text-white">Create your account</h1>
            <p className="mt-2 text-gray-400">Start building production apps in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11"
                  error={touched && !!errors.name}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              {touched && errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  error={touched && !!errors.email}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {touched && errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11"
                  error={touched && !!errors.password}
                  disabled={loading}
                  autoComplete="new-password"
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

              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strength.score === 100 ? 'text-emerald-400' :
                      strength.score >= 75 ? 'text-yellow-400' :
                      strength.score >= 50 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {passed ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <X className="h-3 w-3 text-gray-600" />
                          )}
                          <span className={`text-[11px] ${passed ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 pr-11"
                  error={touched && !!errors.confirmPassword}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched && errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
              {confirmPassword && password === confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {!loading && <span>Create Account</span>}
                {!loading && <ArrowRight className="h-4 w-4" />}
                {loading && <span>Creating account...</span>}
              </Button>
            </div>
          </form>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <span className="text-gray-400 hover:text-gray-300 cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-gray-400 hover:text-gray-300 cursor-pointer">Privacy Policy</span>.
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
