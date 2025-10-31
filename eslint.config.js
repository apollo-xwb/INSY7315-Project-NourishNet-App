// @ts-check

import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'web-build/**'
    ]
  },
  js.configs.recommended,
  ...compat.config({ extends: ['plugin:react/recommended'] }),
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        __DEV__: 'readonly',
        require: 'readonly',
        module: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        window: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'eqeqeq': ['error', 'always'],
      'curly': ['warn', 'multi-line'],
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'no-dupe-keys': 'off',
      'react-hooks/exhaustive-deps': 'off'
    },
    settings: {
      react: { version: 'detect' }
    }
  },
  {
    files: ['**/__tests__/**', '**/*.test.js', '**/*.test.jsx', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['scripts/**', 'babel.config.js', 'metro.config.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      }
    },
    rules: {
      'no-undef': 'off'
    }
  }
];
