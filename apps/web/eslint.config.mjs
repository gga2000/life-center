import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Rules are fixed in config, never switched off inline (project rule).
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    rules: {
      // Errors are handled or shown, never swallowed.
      "no-empty": ["error", { allowEmptyCatch: false }],
      // Never log: logs can leak health or money data. Use error tracking.
      "no-console": "error",
      // No casting to silence the type checker. `as const` is still allowed.
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // No "fix later" notes in code.
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "hack", "xxx", "fix later"] }],
    },
  },
  {
    files: ["**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  globalIgnores([".next/**", "playwright-report/**", "test-results/**", "next-env.d.ts"]),
]);
