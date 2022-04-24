
// var NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default
// var NodeGlobalsPolyfills = require('@esbuild-plugins/node-globals-polyfill').default
var { lessLoader } = require('esbuild-plugin-less')
var { build } = require('esbuild')


//https://github.com/evanw/esbuild/issues/1311
const fs = require('fs');
 const jsdomPatch = {
   name: 'jsdom-patch',
   setup(build) {
    build.onLoad({ filter: /jsdom\/living\/xhr\/XMLHttpRequest-impl\.js$/ }, async (args) => {
       let contents = await fs.promises.readFile(args.path, 'utf8');
 
       contents = contents.replace(
         'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
        `const syncWorkerFile = "${require.resolve('jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js')}";`,
       );
 
       return { contents, loader: 'js' };
     });
   },
 };


build({
	// logLevel: 'verbose',
    bundle: true,
    entryPoints:['./cli/main.ts'],
    platform: 'node',

    //inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],

    define: {
	    global: 'global',
	    process: 'process',
	    Buffer: 'Buffer',

    },

    inject: [
	    './cli/dom.js'
    ],

    external: [
	    'canvas',
    ],

    plugins: [
	jsdomPatch
      ],


    outfile: 'bundle_cli.js',
    sourcemap: true,
    loader: {
	    '.woff': 'dataurl',
	    '.woff2': 'dataurl',
	    '.eot': 'dataurl',
	    '.ttf': 'dataurl',
	    '.svg': 'dataurl'
    }
})






