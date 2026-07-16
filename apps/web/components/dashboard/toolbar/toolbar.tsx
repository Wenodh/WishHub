'use client';

import {
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowDownWideNarrow,
  Settings2
} from 'lucide-react';
import {
  Input,
  Button,
  Select,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@wishhub/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@wishhub/utils';

export function Toolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const view = searchParams.get('view') || 'grid';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (term: string) => {
    router.push(`${pathname}?${createQueryString('search', term)}`);
  };

  const handleSort = (value: string) => {
    router.push(`${pathname}?${createQueryString('sort', value)}`);
  };

  const handleView = (value: string) => {
    router.push(`${pathname}?${createQueryString('view', value)}`);
  };

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-11 pl-10 rounded-xl border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-muted-foreground/10">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => handleView('grid')}
            className={cn("h-9 w-9 rounded-lg", view === 'grid' && "bg-background shadow-sm")}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => handleView('list')}
            className={cn("h-9 w-9 rounded-lg", view === 'list' && "bg-background shadow-sm")}
            title="List View"
          >
            <ListIcon className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 gap-2 rounded-xl border-muted-foreground/20 px-4 shadow-sm">
              <ArrowDownWideNarrow className="h-4 w-4" />
              <span className="hidden sm:inline">Sort: {getSortLabel(sort)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sort By</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
              <DropdownMenuRadioItem value="newest" className="rounded-lg">Newest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest" className="rounded-lg">Oldest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price_asc" className="rounded-lg">Price: Low to High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price_desc" className="rounded-lg">Price: High to Low</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="store" className="rounded-lg">Store</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function getSortLabel(sort: string) {
  switch (sort) {
    case 'newest': return 'Newest';
    case 'oldest': return 'Oldest';
    case 'price_asc': return 'Price ↑';
    case 'price_desc': return 'Price ↓';
    case 'store': return 'Store';
    default: return 'Newest';
  }
}
