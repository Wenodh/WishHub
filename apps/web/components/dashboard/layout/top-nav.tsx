'use client';

import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown
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

export function TopNav() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {/* Breadcrumb Placeholder */}
        <nav className="hidden text-sm font-medium md:flex">
          <span className="text-muted-foreground">Dashboard</span>
          <span className="mx-2 text-muted-foreground/40">/</span>
          <span className="text-foreground">Wishlists</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-4 w-4 justify-center p-0 text-[10px]">3</Badge>
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <div className="h-8 w-[1px] bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1 rounded-full hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-xs font-bold leading-none">{user?.name || 'Anonymous User'}</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-1">{user?.email || 'user@example.com'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
