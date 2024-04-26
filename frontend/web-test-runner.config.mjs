import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
    plugins: [
        importMapsPlugin({
            inject: {
                importMap: {
                    imports: {
                        // mock a dependency
                        '@shell/': './src/shell/',
                        '@components/': './src/components/',
                        "@sb-adapters/": "./test/mocks/adapters/",
                        "@testing/": "./test/"
                    },
                },
            },
        }),
    ],
};