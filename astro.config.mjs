import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Determine base URL for GitHub Pages deployment
const getBase = () => {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repo}`;
  }
  return '/';
};

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://alvin2guo.github.io',
  base: getBase(),
  output: 'static',
  integrations: [tailwind()],
  build: {
    format: 'directory'
  }
});
