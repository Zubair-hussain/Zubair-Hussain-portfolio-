import introVideo from '../public/videos/intro-video.json';
import { describe, expect, it } from 'vitest';
import { PROFILE } from '../src/lib/zubair-profile';

describe('profile links and intro video metadata', () => {
  it('uses the canonical GitHub account for profile links and live project fetching', () => {
    expect(PROFILE.socials.github).toBe('https://github.com/Zubair-Hussain');
    expect(PROFILE.sources.githubUsername).toBe('Zubair-Hussain');
    expect(PROFILE.links).toContainEqual({
      label: 'GitHub',
      href: 'https://github.com/Zubair-Hussain',
      tag: 'code',
    });
  });

  it('uses the public Upwork service URL for hiring links', () => {
    const upworkServiceUrl =
      'https://www.upwork.com/services/product/development-it-syed-zubair-2030587661487129538?ref=project_share';

    expect(PROFILE.socials.upwork).toBe(upworkServiceUrl);
    expect(PROFILE.freelanceProfiles).toContainEqual(
      expect.objectContaining({ id: 'upwork', href: upworkServiceUrl })
    );
    expect(PROFILE.links).toContainEqual({
      label: 'Upwork Service',
      href: upworkServiceUrl,
      tag: 'freelance',
    });
  });

  it('uses the secure schedule route for public booking actions', () => {
    expect(PROFILE.actions.schedule.publicPath).toBe('/api/schedule');
    expect(PROFILE.actions.schedule.privateUrl).toBe('https://calendly.com/detroonshah/30min');
    expect(PROFILE.links).toContainEqual({
      label: 'Schedule a Call',
      href: '/api/schedule',
      tag: 'booking',
    });
  });

  it('exports the intro video metadata for chatbot and page integrations', () => {
    expect(PROFILE.actions.introVideo.url).toBe('https://youtu.be/W3Zmlo3D49Y');
    expect(PROFILE.actions.introVideo.uploadedAt).toBe('2026-03-16T08:56:28-07:00');
    expect(introVideo.url).toBe(PROFILE.actions.introVideo.url);
    expect(introVideo.uploadedAt).toBe(PROFILE.actions.introVideo.uploadedAt);
  });

  it('keeps all public profile links tagged for global discovery', () => {
    const tags = PROFILE.links.map((link) => link.tag);

    expect(tags).toEqual(
      expect.arrayContaining(['booking', 'video', 'contact', 'code', 'professional', 'writing', 'design'])
    );
  });
});
