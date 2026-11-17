import { defineConfig } from 'astro/config';

// Settings for the whole site. You should rarely need to touch this file.
export default defineConfig({
  site: 'https://www.jacobspetzler.com',
  trailingSlash: 'always',
  build: {
    // Keep the styles in one shared file instead of repeating them in every page.
    inlineStylesheets: 'never',
  },
});
