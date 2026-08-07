import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../toolbar/toolbar';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';

describe('Toolbar', () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push });
  });

  it('renders search input', () => {
    render(<Toolbar />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('updates URL on search input change', () => {
    vi.useFakeTimers();
    render(<Toolbar />);
    const input = screen.getByPlaceholderText('Search items...');

    fireEvent.change(input, { target: { value: 'headphones' } });

    vi.advanceTimersByTime(150);

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining('search=headphones'),
      expect.objectContaining({ scroll: false })
    );
    vi.useRealTimers();
  });

  it('updates URL on view toggle', () => {
    render(<Toolbar />);
    const listViewButton = screen.getByRole('button', { name: /list view/i });

    fireEvent.click(listViewButton);

    expect(push).toHaveBeenCalledWith(expect.stringContaining('view=list'));
  });
});
