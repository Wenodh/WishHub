'use client';

import {
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge
} from '@wishhub/ui';
import { useSession } from '@wishhub/api-client';
import { ThemeToggle } from './theme-toggle';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/api/auth-client';

export function TopNav() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/75 dark:bg-neutral-950/75 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Breadcrumb Placeholder */}
        <nav className="hidden text-sm font-medium md:flex items-center gap-2">
          <span className="text-neutral-400 dark:text-neutral-500 font-semibold tracking-wide">Workspace</span>
          <span className="text-neutral-300 dark:text-neutral-700 font-light">/</span>
          <span className="text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1.5 bg-neutral-100/50 dark:bg-neutral-900/50 px-2.5 py-1 rounded-xl">
            <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
            Universal Wishlist
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Switching Switcher */}
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-all">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 justify-center p-0 text-[9px] font-black bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-full border border-white dark:border-neutral-950">
            3
          </Badge>
        </Button>

        <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-2xl bg-neutral-100/50 hover:bg-neutral-200/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/50 transition-all border border-neutral-200/10 dark:border-neutral-800/10 h-10">
              <Avatar className="h-6.5 w-6.5 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                <AvatarImage src={user?.image} alt={user?.name || 'User'} className="rounded-xl" />
                <AvatarFallback className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[10px] font-extrabold rounded-xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-xs font-bold leading-none text-neutral-900 dark:text-neutral-100">{user?.name || 'Anonymous'}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-3xl p-2.5 shadow-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
            <DropdownMenuLabel className="text-xs font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase px-2 py-1.5">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-900 my-1" />
            <DropdownMenuItem className="rounded-2xl gap-2 cursor-pointer px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <User className="h-4 w-4 text-neutral-400" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-2xl gap-2 cursor-pointer px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <Settings className="h-4 w-4 text-neutral-400" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-900 my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-2xl gap-2 cursor-pointer px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
