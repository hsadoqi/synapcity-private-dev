import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@workspace\/ui\/(.*)$/,
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/ui/src/$1"
        ),
      },
      {
        find: "@workspace/ui/components/primitives/sidebar",
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/ui/src/components/primitives/sidebar.tsx"
        ),
      },
      {
        find: "@workspace/ui/components",
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/ui/src/components/index.ts"
        ),
      },
      {
        find: "@",
        replacement: path.resolve(import.meta.dirname, "."),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
  },
})
