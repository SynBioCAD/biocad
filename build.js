
var NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default
var NodeGlobalsPolyfills = require('@esbuild-plugins/node-globals-polyfill').default
var { build } = require('esbuild')
build({
    bundle: true,
    entryPoints:['./biocad/browser.ts'],
    plugins: [
        NodeModulesPolyfills(),
        NodeGlobalsPolyfills()
    ],
    outfile: 'bundle.js',
    sourcemap: true
})

