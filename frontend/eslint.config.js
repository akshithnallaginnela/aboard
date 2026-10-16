import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["build", "build-demo", ".react-router", "node_modules", "test-results", "playwright-report"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Programmatic focus targets (h1, error summary) legitimately use tabIndex={-1}.
      "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: [], roles: [], allowExpressionValues: true }],
    },
  },
  {
    files: ["**/*.mjs", "**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
);
