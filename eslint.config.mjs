// @ts-check

import eslint from '@eslint/js';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            'dist',
            'node_modules',
            'eslint.config.mjs',
            'jest.config.js',
            '',
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
                extraFileExtensions: ['.mjs'],
            },
        },
        rules: {
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-console': 'error',
            'dot-notation': 'error',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
);
