

var path = require('path')
var nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    entry: "./cli/main.ts",
    target: 'node',
    externals: [nodeExternals()],
    output: {
        filename: "bundle_cli.js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".js", ".json"],

        alias: {
            jfw: path.resolve(__dirname, 'node_modules/@biocad/jfw/dist/jfw'),
            data: path.resolve(__dirname, 'data'),
            featurecreep: path.resolve(__dirname, 'featurecreep'),
            biocad: path.resolve(__dirname, 'biocad'),
            'sbh-proxy-client': path.resolve(__dirname, 'sbh-proxy-client'),
        }
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: path.resolve(__dirname, './webpack_remove_logs.js')
                    },
                    {
                        loader: "awesome-typescript-loader" // 1
                    }
                ]
            },
            { test: /\.svg$/, loader: "raw-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        //"react": "React",
        //"react-dom": "ReactDOM"
    }
}

