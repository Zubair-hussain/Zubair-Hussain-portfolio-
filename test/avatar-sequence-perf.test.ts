import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AvatarSequence from '../src/components/3d/AvatarSequence';
import {
  avatarSequencePerfConfig,
  getAvatarFrameTarget,
  getAvatarFrameUrl,
  getAvatarFrameFallbackUrl,
  shouldHoldAvatarScroll,
} from '../src/components/3d/AvatarSequence';

describe('Avatar sequence performance guardrails', () => {
  it('shows the Vercel poster without a blocking full-screen splash', () => {
    const { container } = render(React.createElement(AvatarSequence));
    const poster = container.querySelector('img');

    expect(screen.queryByText('Initialising Essence')).not.toBeInTheDocument();
    expect(poster).toHaveAttribute(
      'src',
      'https://portfolio-assets-sigma.vercel.app/frames-webp/ezgif-frame-001.webp'
    );
  });

  it('keeps initial frame preloads small for startup performance', () => {
    expect(avatarSequencePerfConfig.totalFrames).toBe(197);
    expect(avatarSequencePerfConfig.initialPreloadMobile).toBeLessThanOrEqual(4);
    expect(avatarSequencePerfConfig.initialPreloadDesktop).toBeLessThanOrEqual(8);
    expect(avatarSequencePerfConfig.preloadWindow).toBeLessThanOrEqual(10);
  });

  it('generates stable padded Vercel frame URLs', () => {
    expect(getAvatarFrameUrl(0)).toBe(
      'https://portfolio-assets-sigma.vercel.app/frames-webp/ezgif-frame-001.webp'
    );
    expect(getAvatarFrameUrl(196)).toBe(
      'https://portfolio-assets-sigma.vercel.app/frames-webp/ezgif-frame-197.webp'
    );
    expect(avatarSequencePerfConfig.frameBaseUrl).toBe(
      'https://portfolio-assets-sigma.vercel.app/frames-webp/'
    );
  });

  it('holds frame targets within the sequence in both scroll directions', () => {
    expect(getAvatarFrameTarget(0, -100)).toBe(0);
    expect(getAvatarFrameTarget(0, 120)).toBe(10);
    expect(getAvatarFrameTarget(100, -120)).toBe(90);
    expect(getAvatarFrameTarget(196, 100)).toBe(196);
  });

  it('releases page scrolling only at the correct directional boundary', () => {
    expect(shouldHoldAvatarScroll(100, 0, 0, 0)).toBe(true);
    expect(shouldHoldAvatarScroll(100, 196, 196, 195)).toBe(true);
    expect(shouldHoldAvatarScroll(100, 196, 196, 196)).toBe(false);

    expect(shouldHoldAvatarScroll(-100, 196, 196, 196)).toBe(true);
    expect(shouldHoldAvatarScroll(-100, 0, 0, 1)).toBe(true);
    expect(shouldHoldAvatarScroll(-100, 0, 0, 0)).toBe(false);
  });

  it('falls back to local JPEG frames with matching padding', () => {
    expect(getAvatarFrameFallbackUrl(0)).toBe('/frames/ezgif-frame-001.jpg');
    expect(getAvatarFrameFallbackUrl(196)).toBe('/frames/ezgif-frame-197.jpg');
  });
});
