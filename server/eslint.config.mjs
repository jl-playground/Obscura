import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { configs, plugins, rules } from 'eslint-config-airbnb-extended';
import prettierConfigRules from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import sonarjs from 'eslint-plugin-sonarjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve('../', '.gitignore'); // Fixed path resolution

const jsConfig = [
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
  sonarjs.configs.recommended,
  rules.base.importsStrict,
];

const nodeConfig = [plugins.node, ...configs.node.recommended];

const typescriptConfig = [
  plugins.typescriptEslint,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'import-x/no-dynamic-require': 'warn',
      'import-x/no-nodejs-modules': 'off',
    },
  },
  ...configs.base.typescript,
  sonarjs.configs.recommended,
  rules.typescript.typescriptEslintStrict,
];

// --- 2. Project Overrides ---

const globalOptions = {
  name: 'project/global-overrides',
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: path.join(__dirname, 'tsconfig.json'),
      },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  rules: {
    // --- NEW: Auto-sort Imports ---
    'import-x/order': [
      'error',
      {
        groups: [
          'builtin', // node:path, node:fs
          'external', // react, lodash
          'internal', // @/components (if mapped)
          'parent', // ../
          'sibling', // ./
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // Logic Rules
    camelcase: ['error', { properties: 'never' }],
    eqeqeq: 'off',
    'no-plusplus': 'off',
    'no-return-assign': 'off',
    'consistent-return': 'off',
    'prefer-destructuring': 'warn',
    'func-names': 0,
    'no-console': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
        message: 'Unexpected property on console object was called',
      },
    ],
    'class-methods-use-this': 'off',
  },
};

const typescriptOptions = {
  name: 'project/typescript-overrides',
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',

    '@typescript-eslint/no-require-imports': 'off',

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
  },
};

const specificFileExclusions = {
  name: 'project/config-file-overrides',
  files: ['eslint.config.mjs'],
  rules: {
    'no-underscore-dangle': 'off',
  },
};

const eslintIgnores = {
  name: 'project/ignores',
  ignores: [
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/*.d.ts',
    '**/public/**',
    '**/config/**',
    '**/package-lock.json',
  ],
};

// --- 3. Prettier Config (MUST BE LAST) ---
// This turns off conflicting rules and enables the "prettier/prettier" error rule.

const prettierConfig = [
  {
    name: 'prettier/plugin',
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfigRules.rules, // Turns off stylistic rules from Airbnb/Sonar
      'prettier/prettier': 'error', // Highlights formatting issues as ESLint errors
    },
  },
];

// --- Export ---
export default [
  includeIgnoreFile(gitignorePath),
  eslintIgnores,

  // 1. Load Base Configs
  ...jsConfig,
  ...nodeConfig,
  ...typescriptConfig,

  // 2. Apply Custom Overrides
  globalOptions,
  typescriptOptions,
  specificFileExclusions,

  // 3. Apply Prettier (The Conflict Solver)
  ...prettierConfig,
];
