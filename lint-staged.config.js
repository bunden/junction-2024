/** @type {import('lint-staged').Config} */
const config = {
  '*.{cjs,cjs,css,html,js,json,jsx,md,mjs,svelte,ts,tsx,yaml,yml}': 'prettier --write',
  '*.{cjs,html,js,json,jsx,mjs,svelte,ts,tsx}': 'eslint --fix',
}

export default config;
