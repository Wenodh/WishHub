'use client';

import { useSession } from '@wishhub/api-client';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import {
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Skeleton,
  Button
} from '@wishhub/ui';
import { User, Mail, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, isLoading } = useSession();
  const user = session?.user as any;

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
              My Profile
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
              Manage your personal workspace details and account settings.
            </p>
          </div>
        </header>

        {isLoading ? (
          <Card className="rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-3xl" />
              <div className="space-y-2 w-full max-w-sm">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            </div>
            <div className="border-t border-neutral-100 dark:border-neutral-900 pt-6 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </Card>
        ) : user ? (
          <Card className="rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 premium-shadow overflow-hidden">
            <CardContent className="p-8 space-y-8">
              {/* Profile Card Main Info */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-neutral-100 dark:border-neutral-900">
                <Avatar className="h-24 w-24 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-md">
                  <AvatarImage src={user.image} alt={user.name || 'User'} className="rounded-3xl object-cover" />
                  <AvatarFallback className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-2xl font-black rounded-3xl">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    {user.name || 'Anonymous User'}
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                    Verified WishHub Explorer
                  </p>
                </div>
              </div>

              {/* Account Details list */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Account Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10">
                    <div className="p-2.5 bg-white dark:bg-neutral-950 rounded-xl shadow-sm text-neutral-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Full Name</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {user.name || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10">
                    <div className="p-2.5 bg-white dark:bg-neutral-950 rounded-xl shadow-sm text-neutral-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Email Address</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate block">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Account created field */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10 sm:col-span-2">
                    <div className="p-2.5 bg-white dark:bg-neutral-950 rounded-xl shadow-sm text-neutral-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Workspace Creation Date</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 p-8 text-center bg-white dark:bg-neutral-950">
            <p className="text-neutral-500">Please sign in to view your profile details.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
