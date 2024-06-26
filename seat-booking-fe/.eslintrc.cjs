module.exports = {
    root: true,
    env: {browser: true, es2020: true},
    extends: [
        'eslint:recommended',
        'plugin:react-hooks/recommended',
        'plugin:eslint-plugin-testing-library',
        'plugin:@typescript-eslint/recommended',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:mocha/recommended"
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: {
        project: [
            "./tsconfig.json"
        ],
        sourceType: "module"
    },
    parser: '@typescript-eslint/parser',
    plugins: [
        'react-refresh',
        "@typescript-eslint",
        "mocha",
        "import"],
    rules:
        {
            "@typescript-eslint/adjacent-overload-signatures": "error",
            "@typescript-eslint/array-type": [
                "error",
                {
                    "default": "array-simple"
                }
            ],
            "@typescript-eslint/ban-ts-comment": [
                "warn",
                {
                    "ts-ignore": "allow-with-description"
                }
            ],
            "@typescript-eslint/ban-types": [
                "error",
                {
                    "types": {
                        "Object": {
                            "message": "Avoid using the `Object` type. Did you mean `object`?"
                        },
                        "Function": {
                            "message": "Avoid using the `Function` type. Prefer a specific function type, like `() => void`."
                        },
                        "Boolean": {
                            "message": "Avoid using the `Boolean` type. Did you mean `boolean`?"
                        },
                        "Number": {
                            "message": "Avoid using the `Number` type. Did you mean `number`?"
                        },
                        "String": {
                            "message": "Avoid using the `String` type. Did you mean `string`?"
                        },
                        "Symbol": {
                            "message": "Avoid using the `Symbol` type. Did you mean `symbol`?"
                        }
                    }
                }
            ],
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": "error",
            "@typescript-eslint/dot-notation": "error",
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    "accessibility": "explicit",
                    "overrides": {
                        "accessors": "explicit",
                        "constructors": "no-public",
                        "methods": "explicit",
                        "properties": "explicit",
                        "parameterProperties": "explicit"
                    }
                }
            ],
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/member-delimiter-style": [
                "error",
                {
                    "multiline": {
                        "delimiter": "semi",
                        "requireLast": true
                    },
                    "singleline": {
                        "delimiter": "semi",
                        "requireLast": false
                    }
                }
            ],
            "@typescript-eslint/member-ordering": [
                "error",
                {
                    "default": ["signature", "field", "constructor", "public-method", "method", "public-static-method", "static-method"]
                }
            ],
            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-empty-function": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-extra-non-null-assertion": "error",
            "@typescript-eslint/no-extra-semi": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-parameter-properties": "off",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/prefer-as-const": "error",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-namespace-keyword": "error",
            "@typescript-eslint/triple-slash-reference": [
                "error",
                {
                    "path": "always",
                    "types": "prefer-import",
                    "lib": "always"
                }
            ],
            "@typescript-eslint/type-annotation-spacing": "error",
            "@typescript-eslint/unified-signatures": "error",
            "arrow-body-style": "error",
            "arrow-parens": [
                "off",
                "always"
            ],
            "brace-style": [
                "error",
                "1tbs"
            ],
            "camelcase": "error",
            "comma-dangle": [
                "error",
                "always-multiline"
            ],
            "complexity": "off",
            "constructor-super": "error",
            "curly": "error",
            "eol-last": "error",
            "eqeqeq": [
                "error",
                "smart"
            ],
            "for-direction": "error",
            "getter-return": "error",
            "guard-for-in": "error",
            "id-blacklist": [
                "error",
                "any",
                "Number",
                "number",
                "String",
                "string",
                "Boolean",
                "boolean",
                "Undefined",
                "undefined"
            ],
            "id-match": "error",
            "import/no-default-export": "off",
            "import/order": "error",
            "indent": [
                "error",
                4
            ],
            "linebreak-style": [
                "error",
                "unix"
            ],
            "max-classes-per-file": [
                "error",
                1
            ],
            "max-len": [
                "error",
                {
                    "code": 120
                }
            ],
            "mocha/no-mocha-arrows": "off",
            "mocha/no-setup-in-describe": "off",
            "new-parens": "error",
            "no-array-constructor": "off",
            "no-async-promise-executor": "error",
            "no-bitwise": "error",
            "no-caller": "error",
            "no-case-declarations": "error",
            "no-class-assign": "error",
            "no-compare-neg-zero": "error",
            "no-cond-assign": "error",
            "no-console": "error",
            "no-const-assign": "error",
            "no-constant-condition": "error",
            "no-control-regex": "error",
            "no-debugger": "error",
            "no-delete-var": "error",
            "no-dupe-args": "error",
            "no-dupe-class-members": "error",
            "no-dupe-else-if": "error",
            "no-dupe-keys": "error",
            "no-duplicate-case": "error",
            "no-empty": "error",
            "no-empty-character-class": "error",
            "no-empty-function": "off",
            "no-empty-pattern": "error",
            "no-eval": "error",
            "no-ex-assign": "error",
            "no-extra-boolean-cast": "error",
            "no-extra-semi": "off",
            "no-fallthrough": "off",
            "no-func-assign": "error",
            "no-global-assign": "error",
            "no-import-assign": "error",
            "no-inner-declarations": "error",
            "no-invalid-regexp": "error",
            "no-invalid-this": "off",
            "no-irregular-whitespace": "error",
            "no-misleading-character-class": "error",
            "no-mixed-spaces-and-tabs": "error",
            "no-multiple-empty-lines": "off",
            //FIXME
            "no-new-symbol": "error",
            "no-new-wrappers": "error",
            "no-obj-calls": "error",
            "no-octal": "error",
            "no-prototype-builtins": "error",
            "no-redeclare": "error",
            "no-regex-spaces": "error",
            "no-self-assign": "error",
            "no-setter-return": "error",
            "no-shadow": [
                "error",
                {
                    "hoist": "all"
                }
            ],
            "no-shadow-restricted-names": "error",
            "no-sparse-arrays": "error",
            "no-this-before-super": "error",
            "no-throw-literal": "error",
            "no-trailing-spaces": "off",
            //FIXME
            "no-undef": "error",
            "no-undef-init": "error",
            "no-underscore-dangle": "off",
            "no-unexpected-multiline": "error",
            "no-unreachable": "error",
            "no-unsafe-finally": "error",
            "no-unsafe-negation": "error",
            "no-unused-labels": "error",
            "no-unused-vars": "off",
            "no-useless-catch": "error",
            "no-useless-escape": "error",
            "no-var": "error",
            "no-with": "error",
            "object-shorthand": "error",
            "one-var": [
                "error",
                "never"
            ],
            "prefer-arrow-callback": "warn",
            "prefer-const": "error",
            "quote-props": [
                "error",
                "consistent-as-needed"
            ],
            "quotes": [
                "error",
                "single"
            ],
            "radix": "error",
            "require-yield": "error",
            "semi": [
                "error",
                "never"
            ],
            "space-before-function-paren": [
                "error",
                {
                    "anonymous": "never",
                    "asyncArrow": "always",
                    "named": "never"
                }
            ],
            "spaced-comment": [
                "error",
                "always",
                {
                    "markers": [
                        "/"
                    ]
                }
            ],
            "use-isnan": "error",
            "valid-typeof": "off",
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
        }
}
