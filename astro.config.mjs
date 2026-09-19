// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sitemapFilter } from './src/lib/sitemap';

const base = process.env.DEMO ? '/demo' : '/';

export default defineConfig({
  site: 'https://jordimp.net',
  base,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'never',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ca'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es', ca: 'ca' } },
      filter: sitemapFilter,
    }),
  ],
});
