const site = (process.env.AUDIT_URL || 'https://zubair-hussain-portfolio.detroonshah.workers.dev').replace(/\/+$/, '');

module.exports = {
  ci: {
    collect: {
      url: [`${site}/`, `${site}/blog`],
      numberOfRuns: 2,
      settings: {
        preset: 'desktop',
        chromeFlags: '--headless --no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.7 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.65 }],
        // 3rd-party scripts (GTM, GA4, Firebase) log to console on cold load.
        // Treat as a warning so CI doesn't break on external noise.
        'errors-in-console': ['warn', { minScore: 0 }],
        'is-crawlable': 'error',
        'document-title': 'error',
        'meta-description': 'error',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
