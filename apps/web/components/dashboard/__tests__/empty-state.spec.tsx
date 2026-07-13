import { render, screen } from '@testing-library/react';
import { EmptyState } from '../empty-states/empty-state';
import { Search } from 'lucide-react';
import { describe, it, expect, vi } from 'vitest';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Search}
        title="No results"
        description="Try searching for something else."
      />
    );

    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try searching for something else.')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={Search}
        title="Empty"
        description="It is empty."
        action={{ label: 'Click me', onClick }}
      />
    );

    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    button.click();
    expect(onClick).toHaveBeenCalled();
  });
});
