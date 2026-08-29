import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DeferredClientTools from '../src/components/ui/DeferredClientTools';

vi.mock('next/dynamic', () => ({
  default: () => function DeferredToolMock() {
    return <div data-testid="deferred-tool" />;
  },
}));

describe('DeferredClientTools', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps non-critical client tools out of the initial render', () => {
    const { getAllByTestId, queryByTestId } = render(<DeferredClientTools />);

    expect(queryByTestId('deferred-tool')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1799);
    });
    expect(queryByTestId('deferred-tool')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getAllByTestId('deferred-tool')).toHaveLength(6);
  });
});
