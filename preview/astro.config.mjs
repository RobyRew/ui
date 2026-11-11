import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// @robyrew/ui is linked from the parent folder (file:..). Vite resolves the
// link to its real path, outside this project's root, so the dev server has
// to be allowed to read it.
export default defineConfig({
  server: { port: 4410 },
  devToolbar: { enabled: false },
  vite: {
    server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
  },
});
