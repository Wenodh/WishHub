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
import { useCallback, useState, useEffect } from 'react';
import { cn } from '@wishhub/utils';

export function Toolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(searchParam);
  const sort = searchParams.get('sort') || 'newest';
  const view = searchParams.get('view') || 'grid';

  // Sync local input with query param changes (e.g., when clearing search or switching folders)
  useEffect(() => {
    setLocalSearch(searchParam);
  }, [searchParam]);

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

  // Debounce search input to avoid choking the router on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchParam) {
        router.push(`${pathname}?${createQueryString('search', localSearch)}`, { scroll: false });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [localSearch, searchParam, router, pathname, createQueryString]);

  const handleSort = (value: string) => {
    router.push(`${pathname}?${createQueryString('sort', value)}`);
  };

  const handleView = (value: string) => {
    router.push(`${pathname}?${createQueryString('view', value)}`);
  };

  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-300">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
        <Input
          placeholder="Search items..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-12 pl-11 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300 shadow-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => handleView('grid')}
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300",
              view === 'grid'
                ? "bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => handleView('list')}
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300",
              view === 'list'
                ? "bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            )}
            title="List View"
          >
            <ListIcon className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 gap-2 rounded-2xl border-neutral-200 dark:border-neutral-800 px-5 shadow-sm text-xs font-bold hover:scale-[1.01] transition-transform bg-white/70 dark:bg-neutral-950/70"
            >
              <ArrowDownWideNarrow className="h-4 w-4 text-neutral-500" />
              <span>Sort: {getSortLabel(sort)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 px-3 py-1.5">Sort By</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
              <DropdownMenuRadioItem value="newest" className="rounded-xl cursor-pointer py-2 px-3 text-xs font-semibold">Newest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest" className="rounded-xl cursor-pointer py-2 px-3 text-xs font-semibold">Oldest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price_asc" className="rounded-xl cursor-pointer py-2 px-3 text-xs font-semibold">Price: Low to High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price_desc" className="rounded-xl cursor-pointer py-2 px-3 text-xs font-semibold">Price: High to Low</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="store" className="rounded-xl cursor-pointer py-2 px-3 text-xs font-semibold">Store</DropdownMenuRadioItem>
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
