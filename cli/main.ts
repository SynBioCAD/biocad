
import Layout from 'biocad/cad/Layout'
import ImageRenderer from 'biocad/cad/ImageRenderer'
import { SBOLXGraph } from 'sbolgraph'
import { Vec2 } from 'jfw/geom'

import fs = require('fs')
import LayoutPOD from 'biocad/cad/LayoutPOD';

main()

async function main() {

    let f = process.argv.slice(2).join(' ')

    if(f) {

        await doFile(f)

    } else {

        for(let file of fs.readdirSync('testfiles')) {

            if(!file.endsWith('.xml') || file.endsWith('_sbolx.xml'))
                continue

            let path = 'testfiles/' + file

            await doFile(path)
        }

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

