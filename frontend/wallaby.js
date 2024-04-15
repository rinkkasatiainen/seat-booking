export default function() {
    return {
        files: [
            {pattern: './src/**/*.mjs'},
            {pattern: './src/*.mjs'},
            {pattern: '**/test/**/*-helpers.mjs'},
        ],
        tests: [
            {pattern: '**/test/**/*.test.mjs'},
            // {pattern: '**/test/deployment/*.test.mjs', ignore: true},
            // {pattern: '**/test/deployment/**/*.test.mjs', ignore: true},
            // {pattern: '**/test/component/*.test.mjs', ignore: true},
            // {pattern: '/**/test/**/*.mjs' }
        ],
        testFramework: 'web-test-runner',
        env: {type: 'node'},
    }
};
