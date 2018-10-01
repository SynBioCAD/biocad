
import Layout from 'biocad/cad/Layout'
import ImageRenderer from 'biocad/cad/ImageRenderer'
import { SBOLXGraph } from 'sbolgraph'

let fs = require('fs')

main()

async function main() {

    for(let file of fs.readdirSync('testfiles')) {

        let path = 'testfiles/' + file

        let graph = await SBOLXGraph.loadString(fs.readFileSync(path) + '', 'application/rdf+xml')

        let layout = new Layout(graph)

        layout.syncAllDepictions(5)
        layout.configurate([])

        let renderer = new ImageRenderer(layout)

        let svg = renderer.renderToSVGString()

        fs.writeFileSync(file + '.svg', svg)
    }

}

