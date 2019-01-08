
import Layout from 'biocad/cad/Layout'
import ImageRenderer from 'biocad/cad/ImageRenderer'
import { SBOLXGraph } from 'sbolgraph'
import { Vec2 } from 'jfw/geom'

import fs = require('fs')
import LayoutPOD from 'biocad/cad/LayoutPOD';

import minimist = require('minimist')

import express = require('express')
import bodyParser = require('body-parser')

main(minimist(process.argv.slice(2)))

async function main(argv) {

    if(argv._[0] === 'testall') {

        for(let file of fs.readdirSync('testfiles')) {

            if(!file.endsWith('.xml') || file.endsWith('_sbolx.xml'))
                continue

            let path = 'testfiles/' + file

            await doFile(path)
        }

    } else if(argv._[0] === 'test') {

        let f = process.argv.slice(2).join(' ')

        await doFile(f)

    } else if(argv._[0] === 'server') {

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
            let svg = renderer.renderToSVGString()

            res.header('content-type', 'image/svg+xml')
            res.send(svg)
        })

        server.listen(argv.port)
    }


    async function doFile(path) {

        let graph = await SBOLXGraph.loadString(fs.readFileSync(path) + '', 'application/rdf+xml')

        //fs.writeFileSync('testfiles/' + file + '_sbolx.xml', graph.serializeXML())

        let layout = new Layout(graph)

        layout.syncAllDepictions(5)
        layout.configurate([])
        layout.size = layout.getBoundingSize().add(Vec2.fromXY(1, 1))

        let renderer = new ImageRenderer(layout)

        let svg = renderer.renderToSVGString()

        fs.writeFileSync(path + '.svg', svg)

        fs.writeFileSync(path + '_layout.json', JSON.stringify(LayoutPOD.serialize(layout), null, 2))
    }

}

