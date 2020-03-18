import { Graph, sbol3 } from "sbolgraph";

import { Vec2 } from 'jfw/geom'
import { View } from 'jfw/ui'
import { h, svg, VNode} from 'jfw/vdom'
import { click as clickEvent, contextMenu as contextMenuEvent } from 'jfw/event'

import App from "jfw/App";
import BiocadApp from "biocad/BiocadApp";

import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import BrowseSBHDialog, { BrowseSBHDialogOptions } from "biocad/dialog/BrowseSBHDialog";
import { SearchQuery } from "sbolgraph"

import { FinalizeEvent } from 'biocad/DropOverlay'
import Glyph from "biocad/glyph/Glyph";

export default class PartsListView extends View {

    app:App

    parts:Glyph[]

    constructor(app:App, parts:Glyph[]) {

        super(app)

        this.parts = parts

    }

    render():VNode {

        var app:App = this.app

        function renderPartEntry(part:Glyph) {

            /*
            var glyphInfoBW = {
                type: part.shortName,
                color: 'white',
                stroke: 'none',
                size: boxSize,
                thickness: 2,
                autoApplyScale: true
            }*/

            var glyphInfoColor = {
                defaultColor: '#ddd',
                stroke: 'none',
                thickness: 2,
                autoApplyScale: true
            }

            //var glyphSvgBW = visbolite.render(glyphInfoBW)
            var glyphSvgColor = Glyph.render(part.glyphName, glyphInfoColor)

            return h('div.sf-plv-entry', {
                'ev-mousedown': clickEvent(mousedownPart, { app: app, part: part }),
                'ev-contextmenu': contextMenuEvent(clickSearch, { app: app, part: part })
            }, [
                /*svg('svg', {
                    'class': 'sf-plv-bw',
                    'viewBox': [
                        0,
                        0,
                        boxSize.x,
                        boxSize.y
                    ].join(' ')
                }, [
                    glyphSvgBW
                ]),*/
                svg('svg', {
                    'class': 'sf-plv-color',
                //    width: 100,
                //    height: 100,
                //     'viewBox': [
                //         0,
                //         0,
                //         100,
                //         100
                //     ].join(' ')
                }, [
                    glyphSvgColor
                ]),

                h('div.sf-plv-entry-label', [
                    part.glyphName,

                    h('span.fa.fa-search.sf-part-search-button', {
                        'ev-mousedown': clickEvent(clickSearch, { app: app, part: part })
                    }, [
                    ])
                ])
            ])
        }

        return renderSection(app, [

            h('div.sf-plv', this.parts.map(renderPartEntry))

        ])

        function renderSection(app, children) {

            return h('div.jfw-sidebar-section', {

            }, children)

        }
    }


}


function mousedownPart(data:any) {

    console.log('foomd')

    const app:BiocadApp = data.app
    const part = data.part

    const graph:Graph = new Graph([])

    let component = sbol3(graph).createComponent(app.defaultPrefix, part.shortName, '1')
    component.addRole(part.soTerm)
    component.addType(part.typeUri)

    //console.log('uri is ' + uri)

    const droppable:SBOLDroppable = new SBOLDroppable(app, graph, [ component.uri ])
    app.dropOverlay.setFinalizeEvent(FinalizeEvent.MouseUp)
    app.dropOverlay.startDropping(droppable)

}

function clickSearch(data:any) {

    const app:BiocadApp = data.app
    const part = data.part


    const browseDialogOpts:BrowseSBHDialogOptions = new BrowseSBHDialogOptions()

    browseDialogOpts.query = new SearchQuery()
    browseDialogOpts.query.addRole(part.soTerm)

    
    const browseDialog:BrowseSBHDialog = new BrowseSBHDialog(app, browseDialogOpts)

    app.openDialog(browseDialog)


}

