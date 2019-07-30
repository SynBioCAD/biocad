
import Layout from 'biocad/cad/Layout'
import ImageRenderer, { ImageFormat } from 'biocad/cad/ImageRenderer'
import { SBOLXGraph } from 'sbolgraph'
import { Vec2 } from 'jfw/geom'

import fs = require('fs')
import LayoutPOD from 'biocad/cad/LayoutPOD';

import express = require('express')
import bodyParser = require('body-parser')

import yargs = require('yargs')

yargs
.option('out', {
    alias: 'o',
    description: 'Output filename',
    demandOption: false
})
.option('outfmt', {
    alias: 'f',
    description: 'Output format',
    demandOption: false,
    choices: [ 'svg', 'pdf', 'pptx' ],
    default: 'svg'
})
.command('testall', 'run all tests in testfiles', () => {}, testall)
.command('render <file>', 'render one file', () => {}, render)
.command('server <port>', 'run server', () => {}, server)
.showHelpOnFail(true)
.demandCommand()
.help()
.argv

async function testall(argv) {

    for(let file of fs.readdirSync('testfiles')) {

        if(!file.endsWith('.xml') || file.endsWith('_sbolx.xml'))
            continue

        let path = 'testfiles/' + file

        console.log(path)

        try {
            await doFile(path, null, ImageFormat.SVG)
        } catch(e) {
            console.dir(e)
        }
    }
}
async function server(argv) {

    let server = express()
    server.use(bodyParser.text({
        type: '*/*',
        limit: '1mb'
    }))

    server.use(async (req, res, next) => {

        let graph = await SBOLXGraph.loadString(req.body, 'application/rdf+xml')

        let layout = new Layout(graph)

        layout.syncAllDepictions(5)
        layout.configurate([])
        layout.size = layout.getBoundingSize().add(Vec2.fromXY(1, 1))

        let renderer = new ImageRenderer(layout)
        let svg = await renderer.render(ImageFormat.SVG)

        res.header('content-type', 'image/svg+xml')
        res.send(svg)
    })

    server.listen(argv.port)
}

async function render(argv) {

    let outfmt = ImageFormat.SVG

    if(argv.outfmt === 'pdf') {
        outfmt = ImageFormat.PDF
    } else if(argv.outfmt === 'pptx') {
        outfmt = ImageFormat.PPTX
    }

    await doFile(argv.file, argv.out, outfmt)

}

async function doFile(path, out, outfmt) {

    let graph = await SBOLXGraph.loadString(fs.readFileSync(path) + '', 'application/rdf+xml')

    //fs.writeFileSync('testfiles/' + file + '_sbolx.xml', graph.serializeXML())

    let layout = new Layout(graph)

    layout.syncAllDepictions(5)
    layout.configurate([])
    layout.size = layout.getBoundingSize().add(Vec2.fromXY(1, 1))

    let renderer = new ImageRenderer(layout)

    let svg = await renderer.render(outfmt)

    out = out || path + '.svg'

    fs.writeFileSync(out, svg)

    fs.writeFileSync(out + '_layout.json', JSON.stringify(LayoutPOD.serialize(layout), null, 2))
}


