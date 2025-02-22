import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build', // CRA's default build output
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ["./src/setupTests.ts"]
  }
});
