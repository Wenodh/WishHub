import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockPrefetch = vi.fn();

const mockUseRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard',
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
