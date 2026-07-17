'use client';

import { useTheme } from 'next-themes';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import {
  Card,
  CardContent,
  Button
} from '@wishhub/ui';
import { Sun, Moon, ArrowLeft, Download, LogOut, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/api/auth-client';
import * as React from 'react';

export default function SettingsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <header className="flex items-center gap-4 pb-6 border-b border-neutral-200/40 dark:border-neutral-800/40">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 premium-gradient-text">
              Settings
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
              Customize appearance, integrate extensions, and manage session settings.
            </p>
          </div>
        </header>

        <Card className="rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 premium-shadow overflow-hidden">
          <CardContent className="p-8 space-y-8">

            {/* Theme Settings Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Appearance & Theme</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Choose between customized premium light and dark modes designed to be soft on the eyes.
              </p>
              {mounted ? (
                <div className="flex gap-4 pt-2">
                  <Button
                    variant={resolvedTheme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="rounded-2xl gap-2 h-11 px-6 font-semibold"
                  >
                    <Sun className="h-4 w-4" />
                    Light Mode
                  </Button>
                  <Button
                    variant={resolvedTheme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="rounded-2xl gap-2 h-11 px-6 font-semibold"
                  >
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </Button>
                </div>
              ) : (
                <div className="h-11 w-48 bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-2xl" />
              )}
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-900 my-6" />

            {/* Extension Integration Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Browser Extension</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                Save products with a single click from Amazon and other supported retailers directly to your wishlists.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-2xl gap-2 h-11 px-6 font-bold"
                  onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                >
                  <Download className="h-4 w-4" />
                  Install Chrome Extension
                </Button>
                <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Scraper V4.0 Compatible
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-900 my-6" />

            {/* Sign Out Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Session Management</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Log out of your current session on this device securely.
              </p>
              <div className="pt-2">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="rounded-2xl gap-2 h-11 px-6 font-bold hover:scale-[1.01] transition-transform"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
