
// var NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default
// var NodeGlobalsPolyfills = require('@esbuild-plugins/node-globals-polyfill').default
var { lessLoader } = require('esbuild-plugin-less')
var { build } = require('esbuild')


const plugin = require('node-stdlib-browser/helpers/esbuild/plugin');
const stdLibBrowser = require('node-stdlib-browser');




build({
	// logLevel: 'verbose',
    bundle: true,
    entryPoints:['./biocad/browser.ts'],
    platform: 'browser',

    inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],

    define: {
	    global: 'global',
	    process: 'process',
	    Buffer: 'Buffer'
    },


    plugins: [
	plugin(stdLibBrowser),
        // NodeGlobalsPolyfills(),
        // NodeModulesPolyfills(),
        lessLoader({
		paths: [
			'./node_modules/@biocad/jfw/less',

		]
	}),
	// {
	// 	name: 'fontawesomefix',
	// 	setup: (build) => {

	// 		build.onResolve({filter:/.*/},(args) => {
	// 			if(args.kind === "url-token")
	// 				return { path: args.path, external: true }

	// 		})
	// 	}
	// }
    ],
    outfile: 'bundle.js',
    sourcemap: true,
    loader: {
	    '.woff': 'dataurl',
	    '.woff2': 'dataurl',
	    '.eot': 'dataurl',
	    '.ttf': 'dataurl',
	    '.svg': 'dataurl'
    }
})
