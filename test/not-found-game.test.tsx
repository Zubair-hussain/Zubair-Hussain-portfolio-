import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotFound from '../src/app/not-found';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('interactive 404 game', () => {
  it('offers an accessible game and a direct way home', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '404 escape game' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /skip to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: 'Move up' })).toBeInTheDocument();
  });

  it('supports keyboard movement and restarting', () => {
    render(<NotFound />);

    expect(screen.getByText('0', { selector: 'strong' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('1', { selector: 'strong' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /restart/i }));
    expect(screen.getByText('0', { selector: 'strong' })).toBeInTheDocument();
  });
});
