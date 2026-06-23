import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "lib/advice/**/*.ts",
        "lib/lunar-converter.ts",
        "lib/xiaoliu-ren.ts",
        "lib/ming-gong.ts",
        "lib/marriage-direction.ts",
        "lib/readings/**/*.ts",
      ],
    },
  },
});
