import { describe, expect, it } from 'vitest';
import {
  avatarSequencePerfConfig,
  getAvatarFrameUrl,
  getAvatarFrameFallbackUrl,
} from '../src/components/3d/AvatarSequence';

describe('Avatar sequence performance guardrails', () => {
  it('keeps initial frame preloads small for startup performance', () => {
    expect(avatarSequencePerfConfig.totalFrames).toBe(197);
    expect(avatarSequencePerfConfig.initialPreloadMobile).toBeLessThanOrEqual(4);
    expect(avatarSequencePerfConfig.initialPreloadDesktop).toBeLessThanOrEqual(8);
    expect(avatarSequencePerfConfig.preloadWindow).toBeLessThanOrEqual(10);
  });

  it('generates stable padded local frame URLs', () => {
    // Frames are now self-hosted (public/frames) for reliability.
    expect(getAvatarFrameUrl(0)).toBe('/frames/ezgif-frame-001.jpg');
    expect(getAvatarFrameUrl(196)).toBe('/frames/ezgif-frame-197.jpg');
    expect(avatarSequencePerfConfig.frameBaseUrl).toBe('/frames/');
  });

  it('falls back to the external host with matching padding', () => {
    expect(getAvatarFrameFallbackUrl(0)).toBe(
      'https://portfolio-assets-sigma.vercel.app/frames-webp/ezgif-frame-001.webp'
    );
    expect(getAvatarFrameFallbackUrl(196)).toBe(
      'https://portfolio-assets-sigma.vercel.app/frames-webp/ezgif-frame-197.webp'
    );
  });
});
