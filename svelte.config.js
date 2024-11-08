import { fileURLToPath, URL } from 'node:url';

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
    alias: {
      $assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      $components: fileURLToPath(new URL('./src/components', import.meta.url)),
      $utils: fileURLToPath(new URL('./src/utils', import.meta.url)),
    }
	}
};

export default config;
