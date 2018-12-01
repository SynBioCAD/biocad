
/*
 * You can host biocad by simply running webpack and exposing the dist
 * directory on a webserver.  However, this script:
 * 
 *   - Automates running webpack in watch mode
 *   - Compiles to RAM to save your SSD
 *   - Hosts a server on port 9999 serving the dist folder
 * 
 * So use if it makes things easier.
 */

var MemoryFS = require("memory-fs")
var webpack = require('webpack')
var config = require(process.argv.slice(2).join(' '))
var compiler = webpack(config)
var express = require('express')
var mime = require('mime')

var less = require('less')

var path = require('path')
var memfs = new MemoryFS()
var fs = require('fs')

compiler.watch({
    aggregateTimeout: 300,
    //poll: true,
    ignored: /node_modules/
}, function(err, stats) {

    if(err)
        throw err

    console.log(stats.toString({
        //chunks: false,
        colors: false
    }))

    var statsObj = stats.toJson();

    if (statsObj.errors.length > 0) {
        console.log(statsObj.errors.join('\n'))
    }

    if (statsObj.warnings.length > 0) {
        console.log(statsObj.warnings.join('\n'))
    }

    var local = 'bundle_cli.js'

    var localFilename = path.join.apply(path, [
	    __dirname,
	    'dist',
        local
   ])

    if(memfs.existsSync(localFilename)) {
        console.log('writing local bundle ' + localFilename + ' to disk')
        fs.writeFileSync(local, memfs.readFileSync(localFilename).toString())
        fs.writeFileSync(local + '.map', memfs.readFileSync(localFilename + '.map').toString())
    } else {
        console.warn('local bundle filename ' + localFilename + ' was not written')
    }

})

compiler.outputFileSystem = memfs

var server = express()

server.use(function(req, res, next) {

    console.log('req ' + req.path)

    if(req.path === '/css/biocad.css') {

        console.log('> sending css')

        const lessOpts = {
            paths: [ __dirname + '/less', __dirname + '/node_modules/jfw/less' ],
            filename: 'biocad.less'
        }

        less.render(fs.readFileSync('./less/biocad.less').toString(), lessOpts).then((output) => {
            res.header('content-type', 'text/css')
            res.send(output.css)

        }).catch((e) => {

            console.log(e)
            process.exit(1)

        })

        return


    }

    var filename = path.join.apply(path, [
	    __dirname,
	    'dist'
   ].concat(req.path.split('/').slice(1)))

   res.header('content-type', mime.getType(filename) || 'text/plain')

    console.log(req.method + ' ' + filename)

	try {
        var f = memfs.readFileSync(filename)
        console.log('> found in memory store')
	    res.send( f)
	} catch(e) {
        try {
            var f = fs.readFileSync(filename)
            console.log('> found on disk')
            res.send(f)
        } catch(e) {
            console.log('not found anywhere dude')
            res.status(404)
            res.send('not found')
        }
	}

})

server.listen(9999)

