'use client';

import Script from 'next/script';

export function ThemeScript() {
    return (
        <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
                __html: `
          (function() {
            try {
              var storageKey = 'ascenda-theme-preference';
              var userSetKey = 'ascenda-theme-user-set';
              var stored = window.localStorage.getItem(storageKey);
              var userSet = window.localStorage.getItem(userSetKey) === 'manual';
              
              var preference = 'system';
              if (stored && userSet && (stored === 'light' || stored === 'dark')) {
                preference = stored;
              }
              
              var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              var mode = preference === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : preference;
              
              document.documentElement.dataset.theme = mode;
              document.documentElement.style.colorScheme = mode;
            } catch (_) {}
          })();
        `
            }}
        />
    );
}
