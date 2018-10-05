
import Layout from 'biocad/cad/Layout'
import ImageRenderer from 'biocad/cad/ImageRenderer'
import { SBOLXGraph } from 'sbolgraph'
import { Vec2 } from 'jfw/geom'

let fs = require('fs')

main()

async function main() {

    for(let file of fs.readdirSync('testfiles')) {

        if(!file.endsWith('.xml') || file.endsWith('_sbolx.xml'))
            continue

        let path = 'testfiles/' + file

        let graph = await SBOLXGraph.loadString(fs.readFileSync(path) + '', 'application/rdf+xml')

        fs.writeFileSync('testfiles/' + file + '_sbolx.xml', graph.serializeXML())

        let layout = new Layout(graph)

        layout.syncAllDepictions(5)
        layout.configurate([])
        layout.size = layout.getBoundingSize().add(Vec2.fromXY(1, 1))

        let renderer = new ImageRenderer(layout)

        let svg = renderer.renderToSVGString()

        fs.writeFileSync('testfiles/' + file + '.svg', svg)
    }

}

