import { defineConfig, js, reactHooksPlugin, reactPlugin, ts } from "@rslint/core";

export default defineConfig([
  { ignores: ["dist/**", "node_modules/**", ".yarn/**"] },
  { ...js.configs.recommended, files: ["src/**/*.{ts,tsx}"] },
  ...ts.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,tsx}"],
  })),
  { ...reactPlugin.configs.recommended, files: ["src/**/*.tsx"] },
  { ...reactHooksPlugin.configs.recommended, files: ["src/**/*.{ts,tsx}"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
    },
  },
]);
