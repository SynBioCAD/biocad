

var path = require('path')

module.exports = {
    mode: 'development',
    entry: "./biocad/browser.ts",
    output: {
        filename: "bundle_biocad.js",
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
            visbolite: path.resolve(__dirname, 'visbolite'),
            biocad: path.resolve(__dirname, 'biocad'),
            request: 'browser-request',
            'sbh-proxy-client': path.resolve(__dirname, 'sbh-proxy-client'),
        }
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.ts$/, loader: "awesome-typescript-loader" },

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
