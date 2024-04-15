import mochaPlugin from 'eslint-plugin-mocha'
import importPlugin from 'eslint-plugin-import'
import webComponentsPlugin from 'eslint-plugin-wc'
import globals from 'globals'

export default [
    mochaPlugin.configs.flat.recommended,

    // webComponentsPlugin.configs.recommended,
    // importPlugin.configs.flat.recommended,
    {
        ...webComponentsPlugin.configs.recommended,
        rules: {
            'arrow-body-style': 'error',
            'arrow-parens': [
                'off',
                'always',
            ],
            'brace-style': [
                'error',
                '1tbs',
            ],
            'camelcase': 'error',
            'comma-dangle': [
                'error',
                'always-multiline',
            ],
            'complexity': 'off',
            'constructor-super': 'error',
            'curly': 'error',
            'eol-last': 'error',
            'eqeqeq': [
                'error',
                'smart',
            ],
            'for-direction': 'error',
            'getter-return': 'error',
            'guard-for-in': 'error',
            'id-blacklist': [
                'error',
                'any',
                'Number',
                'number',
                'String',
                'string',
                'Boolean',
                'boolean',
                'Undefined',
                'undefined',
            ],
            'id-match': 'error',
            'import/no-default-export': 'off',
            'import/order': 'error',
            'indent': [
                'error',
                4,
            ],
            'linebreak-style': [
                'error',
                'unix',
            ],
            'max-classes-per-file': [
                'error',
                1,
            ],
            'max-len': [
                'error',
                {
                    code: 120,
                },
            ],
            'mocha/no-mocha-arrows': 'off',
            'mocha/no-setup-in-describe': 'off',
            'new-parens': 'error',
            'no-array-constructor': 'off',
            'no-async-promise-executor': 'error',
            'no-bitwise': 'error',
            'no-caller': 'error',
            'no-case-declarations': 'error',
            'no-class-assign': 'error',
            'no-compare-neg-zero': 'error',
            'no-cond-assign': 'error',
            'no-console': 'error',
            'no-const-assign': 'error',
            'no-constant-condition': 'error',
            'no-control-regex': 'error',
            'no-debugger': 'error',
            'no-delete-var': 'error',
            'no-dupe-args': 'error',
            'no-dupe-class-members': 'error',
            'no-dupe-else-if': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-empty': 'error',
            'no-empty-character-class': 'error',
            'no-empty-function': 'off',
            'no-empty-pattern': 'error',
            'no-eval': 'error',
            'no-ex-assign': 'error',
            'no-extra-boolean-cast': 'error',
            'no-extra-semi': 'off',
            'no-fallthrough': 'off',
            'no-func-assign': 'error',
            'no-global-assign': 'error',
            'no-import-assign': 'error',
            'no-inner-declarations': 'error',
            'no-invalid-regexp': 'error',
            'no-invalid-this': 'off',
            'no-irregular-whitespace': 'error',
            'no-misleading-character-class': 'error',
            'no-mixed-spaces-and-tabs': 'error',
            'no-multiple-empty-lines': 'off',
            // FIXME
            'no-new-symbol': 'error',
            'no-new-wrappers': 'error',
            'no-obj-calls': 'error',
            'no-octal': 'error',
            'no-prototype-builtins': 'error',
            'no-redeclare': 'error',
            'no-regex-spaces': 'error',
            'no-self-assign': 'error',
            'no-setter-return': 'error',
            'no-shadow': [
                'error',
                {
                    hoist: 'all',
                },
            ],
            'no-shadow-restricted-names': 'error',
            'no-sparse-arrays': 'error',
            'no-this-before-super': 'error',
            'no-throw-literal': 'error',
            'no-trailing-spaces': 'off',
            // FIXME
            'no-undef': 'error',
            'no-undef-init': 'error',
            'no-underscore-dangle': 'off',
            'no-unexpected-multiline': 'error',
            'no-unreachable': 'error',
            'no-unsafe-finally': 'error',
            'no-unsafe-negation': 'error',
            'no-unused-labels': 'error',
            'no-unused-vars': 'off',
            'no-useless-catch': 'error',
            'no-useless-escape': 'error',
            'no-var': 'error',
            'no-with': 'error',
            'object-shorthand': 'error',
            'one-var': [
                'error',
                'never',
            ],
            'prefer-arrow-callback': 'warn',
            'prefer-const': 'error',
            'quote-props': [
                'error',
                'consistent-as-needed',
            ],
            'quotes': [
                'error',
                'single',
            ],
            'radix': 'error',
            'require-yield': 'error',
            'semi': [
                'error',
                'never',
            ],
            'space-before-function-paren': [
                'error',
                {
                    anonymous: 'never',
                    asyncArrow: 'always',
                    named: 'never',
                },
            ],
            'spaced-comment': [
                'error',
                'always',
                {
                    markers: [
                        '/',
                    ],
                },
            ],
            'use-isnan': 'error',
            'valid-typeof': 'off',
        },
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.browser,
                describe: 'readonly',
                it: 'readonly',
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'error',
        },
        plugins: {
            import: importPlugin,
        },
        ignores: ['node_modules/*'],
    },
]
