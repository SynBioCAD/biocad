import { View } from 'jfw/ui'
import { VNode, h } from 'jfw/vdom'
import { Vec2 } from 'jfw/geom'

import LayoutThumbnail from 'biocad/cad/LayoutThumbnail';
import BiocadApp from '../../BiocadApp';
import Layout from '../../cad/Layout';

import fileDialog = require('file-dialog')

import { click as clickEvent } from 'jfw/event'
import { SBOLXGraph } from 'sbolgraph';

import ImageRenderer from 'biocad/cad/ImageRenderer'

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
                    'display': 'inline-block',
                    'padding-top': '16px'
                }
            }, [
                h('div.pictureframe', {
                    style: {
                        width: 'calc(8vmin + ' + size.x + 'px)',
                        height: 'calc(8vmin + ' + size.y + 'px)'
                    }
                }, [
                    this.thumb.render()
                ]),
                h('div.sf-loadsaveview-links', [
                    h('br'),
                    h('a', {
                        'ev-click': clickEvent(clickDownloadSVG, { view: this })
                    }, 'Download image as SVG'),
                    h('br'),
                    h('a', {
                        'ev-click': clickEvent(clickDownloadPPTX, { view: this })
                    }, 'Download image as PowerPoint')
                ])
            ]))

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

async function clickDownloadSVG(data) {

    let view:LoadSaveView = data.view

    if(!view.layout)    
        return

    let renderer = new ImageRenderer(view.layout)

    let svg = renderer.renderToSVGString()

    let blob = new Blob([ svg ], {
        type: 'image/svg+xml'
    })

    downloadBlob('biocad.svg', blob)

}

async function clickDownloadPPTX(data) {

    let view:LoadSaveView = data.view

    if(!view.layout)    
        return

    let renderer = new ImageRenderer(view.layout)

    let pptx:ArrayBuffer = await renderer.renderToPPTX()

    let blob = new Blob([ new Uint8Array(pptx) ], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    })

    downloadBlob('biocad.pptx', blob)


}

function downloadBlob(name:string, blob:Blob) {

    let url = window.URL.createObjectURL(blob)

    let a = document.createElement('a')
    a.style.display = 'none'

    document.body.appendChild(a)

    a.href = url
    a.download = name
    a.click()

    window.URL.revokeObjectURL(url)

    document.body.removeChild(a)
}


