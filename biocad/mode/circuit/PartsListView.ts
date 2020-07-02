import { Graph, sbol3 } from "sbolgraph";

import { Vec2 } from 'jfw/geom'
import { View } from 'jfw/ui'
import { h, svg, VNode} from 'jfw/vdom'
import { click as clickEvent, contextMenu as contextMenuEvent } from 'jfw/event'

import visbolite from 'visbolite'

import App from "jfw/App";
import BiocadApp from "biocad/BiocadApp";
import { Specifiers, Predicates, Types } from "bioterms";

import { node as graphNode } from "sbolgraph"
import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import BrowseSBHDialog, { BrowseSBHDialogOptions } from "biocad/dialog/BrowseSBHDialog";
import { SearchQuery } from "sbolgraph"

import { FinalizeEvent } from 'biocad/DropOverlay'

export default class PartsListView extends View {

    app:App

    parts:any[]

    constructor(app:App, parts:any[]) {

        super(app)

        this.parts = parts

    }

    render():VNode {

        var rowHeight = 34
        var svgPadding = 4
        var boxSize = Vec2.fromXY(rowHeight * 0.7, rowHeight * 0.7)
        var app:App = this.app

        function renderPartEntry(part) {

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
                type: part.shortName,
                stroke: 'none',
                size: boxSize,
                thickness: 2,
                autoApplyScale: true
            }

            //var glyphSvgBW = visbolite.render(glyphInfoBW)
            var glyphSvgColor = visbolite.render(glyphInfoColor)

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
                    'viewBox': [
                        0,
                        0,
                        boxSize.x,
                        boxSize.y
                    ].join(' ')
                }, [
                    glyphSvgColor
                ]),

                h('div.sf-plv-entry-label', [
                    part.longName,

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

    let component = sbol3(graph).createComponent(app.defaultPrefix, part.shortName)
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

