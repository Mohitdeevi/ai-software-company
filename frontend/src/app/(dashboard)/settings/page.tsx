'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, CreditCard, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  const tokenUsed = user?.tokenUsage?.used ?? 0;
  const tokenLimit = user?.tokenUsage?.limit ?? 100000;
  const usagePercent = tokenLimit > 0 ? Math.min((tokenUsed / tokenLimit) * 100, 100) : 0;

  const planName = user?.plan || 'Free';
  const planBadgeVariant = planName === 'Free' ? 'outline' : 'success';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account and view usage.</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Profile
          </CardTitle>
          <CardDescription>Your personal account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                <User className="h-3.5 w-3.5" />
                Name
              </dt>
              <dd className="text-sm font-medium text-white">
                {user?.name || 'N/A'}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                Email
              </dt>
              <dd className="text-sm font-medium text-white">
                {user?.email || 'N/A'}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                <CreditCard className="h-3.5 w-3.5" />
                Plan
              </dt>
              <dd>
                <Badge variant={planBadgeVariant as any}>{planName}</Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Token Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-500" />
            Token Usage
          </CardTitle>
          <CardDescription>Your current billing period token consumption.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-white">
                {tokenUsed.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">
                of {tokenLimit.toLocaleString()} tokens used
              </p>
            </div>
            <span
              className={`text-sm font-medium ${
                usagePercent > 90
                  ? 'text-red-400'
                  : usagePercent > 70
                  ? 'text-amber-400'
                  : 'text-gray-400'
              }`}
            >
              {usagePercent.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 90
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : usagePercent > 70
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {planName === 'Free' && (
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Upgrade to Pro</h3>
              <p className="mt-1 text-sm text-gray-400">
                Get 10x more tokens, priority agent execution, and premium support.
              </p>
            </div>
            <Button className="shrink-0">Upgrade Plan</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
