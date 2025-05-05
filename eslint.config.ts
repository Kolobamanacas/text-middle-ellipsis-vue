import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier  from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      // Default ESLint rules.
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,

      // Default eslint-plugin-import rules.
      importPlugin.flatConfigs.recommended,

      // Default eslint-plugin-prettier rules. According to the docs, must be the last: https://www.npmjs.com/package/eslint-plugin-prettier#configuration-new-eslintconfigjs
      eslintPluginPrettier,
    ],
    settings: {
      // Default eslint-import-resolver-typescript settings.
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: 'tsconfig.json',
        },
      },
    },
    rules: {
      // Custom ESLint rules.
      'no-restricted-imports': [
        'error', {
          patterns: [
            {
              group: ['./*', '../*'],
              message: 'Relative imports (which start with "./" or "../") are not allowed. Please use (and add if necessary) TypeScript aliases.'
            }
          ],
        }
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // Custom eslint-plugin-import rules.
      'import/no-relative-packages': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
          },
          groups: [
            'builtin',
            ['external', 'internal', 'unknown', 'parent', 'sibling', 'index', 'object'],
            'type'
          ],
          named: true,
          'newlines-between': 'always',
        }
      ],
    },
  },
);
