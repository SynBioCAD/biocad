
import Layout from 'biocad/cad/layout/Layout'
import ImageRenderer, { ImageFormat } from 'biocad/cad/ImageRenderer'
import { Graph, SBOL3GraphView } from 'sboljs'
import { Vec2 } from '@biocad/jfw/geom'

import fs = require('fs')
import LayoutPOD from 'biocad/cad/layout/LayoutPOD';

import express = require('express')
import bodyParser = require('body-parser')

import yargs = require('yargs')
import Glyph from '../biocad/glyph/Glyph'

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

async function init() {
	await Glyph.loadGlyphs()
}

async function testall(argv) {

    await init()

    for(let file of fs.readdirSync('testfiles')) {

        if(!file.endsWith('.ttl'))
            continue

        let path = 'testfiles/' + file
        let outPath = 'testfiles_out/'

	console.log('*** testall: running test: ' + path)

        await doFile(path, outPath, null, ImageFormat.SVG)
    }
}
async function server(argv) {

    await init()

    let server = express()
    server.use(bodyParser.text({
        type: '*/*',
        limit: '1mb'
    }))

    server.use(async (req, res, next) => {

        let gv = await SBOL3GraphView.loadString(req.body, 'text/turtle')
        let layout = new Layout(gv.graph)

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

    await init()

    let outfmt = ImageFormat.SVG

    if(argv.outfmt === 'pdf') {
        outfmt = ImageFormat.PDF
    } else if(argv.outfmt === 'pptx') {
        outfmt = ImageFormat.PPTX
    }

    await doFile(argv.file, null, argv.out, outfmt)

}

async function doFile(path, outPath, out, outfmt) {

    let gv = await SBOL3GraphView.loadString(fs.readFileSync(path) + '', 'text/turtle')

    if(outPath)
	fs.writeFileSync(outPath + path.split('/').pop().split('.').shift() + '_sbol3.xml', gv.serializeXML())

    let layout = new Layout(gv.graph)

    layout.syncAllDepictions(5)

    if(outPath)
	fs.writeFileSync(outPath + path.split('/').pop().split('.').shift() + '_layout_before_configurate.json', JSON.stringify(LayoutPOD.serialize(layout), null, 2))

    layout.configurate([])
    layout.size = layout.getBoundingSize().add(Vec2.fromXY(1, 1))

    let renderer = new ImageRenderer(layout)

    let svg = await renderer.render(outfmt)

    out = out || outPath + path.split('/').pop().split('.').shift() + '.svg'

    fs.writeFileSync(out, new TextDecoder().decode(svg))

    if(outPath)
	fs.writeFileSync(outPath + path.split('/').pop().split('.').shift() + '_layout_after_configurate.json', JSON.stringify(LayoutPOD.serialize(layout), null, 2))
}


