'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-gray-900/95 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          <Link href="/projects" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">PromptCorp<span className="text-indigo-400"> OS</span></span>
          </Link>
          <button
            className="rounded-lg p-1 text-gray-500 hover:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New project button */}
        <div className="px-3 pt-4 pb-2">
          <Link href="/projects/new">
            <Button className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-indigo-500/50" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-gray-950/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            className="rounded-lg p-1.5 text-gray-500 hover:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center justify-between">
            <div />
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-400 sm:inline">
                {user?.name || 'User'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
