import { View } from 'jfw/ui'
import { VNode, h } from 'jfw/vdom'
import { Vec2 } from 'jfw/geom'

import LayoutThumbnail from 'biocad/cad/LayoutThumbnail';
import BiocadApp from '../../BiocadApp';
import Layout from '../../cad/Layout';

import fileDialog = require('file-dialog')

import { click as clickEvent } from 'jfw/event'
import { SBOLXGraph } from 'sbolgraph';

export default class LoadSaveView extends View {

    layout:Layout|undefined
    thumb:LayoutThumbnail|undefined

    constructor(app) {

        super(app)
    }

    activate():void {

        let app = this.app as BiocadApp

        let graph = app.graph

        if(graph.graph.toArray().length > 0) {
            this.layout = new Layout(app.graph)
            this.layout.syncAllDepictions(5)
            this.layout.configurate([])

            this.layout.crop(Vec2.fromXY(3, 2))

            this.thumb = new LayoutThumbnail(app, this.layout)
        }

    }

    render():VNode {

        let elements:VNode[] = []

        if(this.thumb && this.layout) {
            let size = this.layout.getSize().multiply(this.layout.gridSize)

            elements.push(h('div', {
                style: {
                    display: 'inline-block'
                }
            }, [
                h('div.pictureframe', {
                    style: {
                        width: 'calc(8vmin + ' + size.x + 'px)',
                        height: 'calc(8vmin + ' + size.y + 'px)',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translateX(-50%) translateY(-50%)',
                    }
                }, [
                    this.thumb.render()
                ])
            ]))

            elements.push(h('br'))

            elements.push()
        } else {
            elements.push(h('div'))
        }

        return h('div.jfw-flow-grow.jfw-flow-ltr', {
        }, [
            h('div.sf-loadsaveview-icons', {
            }, [
                h('a', {
                }, [
                    h('span.fa.fa-plus', []),
                    h('span.icon-text', ' Create New')
                ]),
                h('br'),
                h('a', {
                    attributes: {
                        'data-balloon-pos': 'right',
                        'data-balloon': 'Load GenBank, FASTA, or SBOL2 files from your computer',
                    },
                    'ev-click': clickEvent(clickLoad, { view: this })
                }, [
                    h('span.fa.fa-folder-open', []),
                    h('span.icon-text', ' Load')
                ]),
                h('br'),
                h('a', {
                    attributes: {
                        'data-balloon-pos': 'right',
                        'data-balloon': 'Save your design to your computer as SBOL2 to load again later',
                    }
                }, [
                    h('span.fa.fa-save', []),
                    h('span.icon-text', ' Save')
                ]),
                h('br'),
                h('a', {
                    attributes: {
                        'data-balloon-pos': 'right',
                        'data-balloon': 'Export your design as Microsoft® PowerPoint or SVG',
                    }
                }, [
                    h('span.fa.fa-file-export', []),
                    h('span.icon-text', ' Export')
                ])
            ]),
            h('div.jfw-flow-grow', {
                style: {
                    'text-align': 'center',
                    'padding-top': '16px'
                }
            }, elements)
        ])

    }
}

async function clickLoad(data)  {

    let view:LoadSaveView = data.view

    let file = await fileDialog()

    if(file && file[0]) {

        let reader = new FileReader()

        reader.onload = async (ev) => {

            if(!ev.target)
                return

            let app = view.app as BiocadApp

            let g = await SBOLXGraph.loadString(reader.result + '', file[0].type)
            app.loadGraph(g)
        }

        reader.readAsText(file[0])
    }



}

