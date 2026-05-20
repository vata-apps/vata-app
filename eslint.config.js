import js from '@eslint/js';
import globals from 'globals';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
      'no-undef': 'off', // TypeScript handles this
      'no-nested-ternary': 'error',
      // Prefer immutable bindings. For values derived from a branch, use
      // a `const` initialised by an IIFE (or a lookup table) rather than
      // a `let` reassigned across an if/else. No built-in rule enforces
      // the IIFE-vs-let preference, so it lives as a convention enforced
      // by review; `prefer-const` covers the simple "never reassigned"
      // case.
      'prefer-const': 'error',
    },
  },
  {
    files: ['vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['src/routeTree.gen.ts', 'dist/', 'src-tauri/', '.worktrees/'],
  },
];
