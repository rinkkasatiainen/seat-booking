module.exports = function () {
    return {
        files: [
            {pattern: '**/src/**/*.ts'},
            {pattern: '**/test/utils/*.ts',},
        ],
        tests: [
            {pattern: '**/test/**/*.test.ts'},
            {pattern: '**/test/deployment/*.test.ts', ignore: true},
            {pattern: '**/test/deployment/**/*.test.ts', ignore: true},
            {pattern: '**/test/component/*.test.ts', ignore: true},
        ],
        testFramework: "mocha",
        env: {type: 'node'}
    };
};
