import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HeroCTA from '../src/components/sections/HeroCTA';
import { PROFILE } from '../src/lib/zubair-profile';

vi.mock('framer-motion', () => {
  const passthrough =
    (tag: 'a' | 'button' | 'div') =>
    function MotionPassthrough({
      animate: _animate,
      children,
      initial: _initial,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: { children?: React.ReactNode; [key: string]: unknown }) {
      return React.createElement(tag, props as React.HTMLAttributes<HTMLElement>, children);
    };

  return {
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      a: passthrough('a'),
      button: passthrough('button'),
      div: passthrough('div'),
    },
  };
});

describe('HeroCTA', () => {
  it('opens Calendly in an in-app scheduler dialog', () => {
    const { getByRole, getByText, queryByRole } = render(<HeroCTA />);

    fireEvent.click(getByRole('button', { name: PROFILE.actions.schedule.label }));

    expect(getByRole('dialog', { name: PROFILE.actions.schedule.label })).toBeInTheDocument();
    expect(getByText(/schedule a call/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /close scheduler/i })).toBeInTheDocument();
    expect(queryByRole('link', { name: PROFILE.actions.schedule.label })).not.toBeInTheDocument();
  });

  it('keeps only the intro video as an external hero link', () => {
    const { getByRole, queryByRole } = render(<HeroCTA />);

    expect(getByRole('link', { name: PROFILE.actions.introVideo.label })).toHaveAttribute(
      'href',
      PROFILE.actions.introVideo.url
    );
    expect(queryByRole('link', { name: /view my work/i })).not.toBeInTheDocument();
    expect(queryByRole('link', { name: /download cv/i })).not.toBeInTheDocument();
  });
});
