import { View } from 'jfw/ui'
import { VNode, h } from 'jfw/vdom'
import { Vec2 } from 'jfw/geom'

import LayoutThumbnail from 'biocad/cad/LayoutThumbnail';
import BiocadApp from '../../BiocadApp';
import Layout from '../../cad/Layout';

import fileDialog = require('file-dialog')

import { click as clickEvent } from 'jfw/event'
import { SBOLXGraph, SBOL2Graph } from 'sbolgraph';

import ImageRenderer from 'biocad/cad/ImageRenderer'

import SBOLConverterValidator from 'biocad/util/SBOLConverterValidator'

export default class LoadSaveView extends View {

    layout:Layout|undefined
    thumb:LayoutThumbnail|undefined
    section:string

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

        if(this.thumb && this.layout) {
            this.section = 'picture'
        }

    }

    render():VNode {

        let elements:VNode[] = []

        switch(this.section) {
            case 'picture':
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
                break

            case 'export':

                elements.push(h('div.sf-loadsaveview-exportoption', {
                }, [
                    h('a', {
                    'ev-click': clickEvent(clickExportBiocad, { view: this })
                    }, [
                        h('span.fa.fa-download'),
                        ' Save as a .biocad file'
                    ]),
                    h('div.spacer'),
                    h('div.good', [
                        h('span.fa.fa-check'),
                        ' Sequences, annotations, hierarchy, and interactions will be saved'
                    ]),
                    h('div.warn', [
                        h('span.fa.fa-exclamation-triangle'),
                        ' Will not be compatible with software other than biocad.io'
                    ])

                ]))

                elements.push(h('div.sf-loadsaveview-exportoption', {
                }, [
                    h('a', {
                    'ev-click': clickEvent(clickExportSBOL2, { view: this })
                    }, [
                        h('span.fa.fa-download'),
                        ' Export as SBOL2'
                    ]),
                    h('div.spacer'),
                    h('div.good', [
                        h('span.fa.fa-check'),
                        ' Sequences, annotations, hierarchy, and interactions will be saved'
                    ]),
                    h('div.warn', [
                        h('span.fa.fa-exclamation-triangle'),
                        ' May differ visually if re-imported to biocad.io'
                    ])

                ]))

                elements.push(h('div.sf-loadsaveview-exportoption', {
                }, [
                    h('a', {
                    'ev-click': clickEvent(clickExportGenBank, { view: this })
                    }, [
                        h('span.fa.fa-download'),
                        ' Export as GenBank'
                    ]),
                    h('div.spacer'),
                    h('div.good', [
                        h('span.fa.fa-check'),
                        ' Sequences and annotations will be saved'
                    ]),
                    h('div.bad', [
                        h('span.fa.fa-times'),
                        ' Hierarchy and interactions will be lost'
                    ])
                ]))

                elements.push(h('div.sf-loadsaveview-exportoption', {
                }, [
                    h('a', {
                    'ev-click': clickEvent(clickExportFASTA, { view: this })
                    }, [
                        h('span.fa.fa-download'),
                        ' Export as FASTA'
                    ]),
                    h('div.spacer'),
                    h('div.good', [
                        h('span.fa.fa-check'),
                        ' Sequences will be saved'
                    ]),
                    h('div.bad', [
                        h('span.fa.fa-times'),
                        ' Annotations, hierarchy, and interactions will be lost'
                    ])
                ]))


                break
        }


        return h('div.jfw-flow-grow.jfw-flow-ltr', {
        }, [
            h('div.sf-loadsaveview-icons', {
            }, [
                h('a' + (this.section === 'picture' ? '.active' : ''), {
                    'ev-click': clickEvent(clickTakePicture, { view: this })
                }, [
                    h('span.fa.fa-image', []),
                    h('span.icon-text', 'Take a Picture')
                ]),
                h('br'),
                h('a', {
                }, [
                    h('span.fa.fa-plus', []),
                    h('span.icon-text', ' Create New')
                ]),
                h('br'),
                h('a', {
                    attributes: {
                        'data-balloon-pos': 'right',
                        'data-balloon': 'Import GenBank, FASTA, or SBOL2 files from your computer',
                    },
                    'ev-click': clickEvent(clickImport, { view: this })
                }, [
                    h('span.fa.fa-folder-open', []),
                    h('span.icon-text', ' Import')
                ]),
                h('br'),
                h('a' + (this.section === 'export' ? '.active' : ''), {
                    attributes: {
                        'data-balloon-pos': 'right',
                        'data-balloon': 'Export your design to load later, or to use in other software',
                    },
                    'ev-click': clickEvent(clickExport, { view: this })
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

async function clickTakePicture(data)  {

    let view:LoadSaveView = data.view

    view.section = 'picture'
    view.update()
}

async function clickImport(data)  {

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

async function clickExport(data)  {

    let view:LoadSaveView = data.view

    view.section = 'export'
    view.update()

    /*
    let graph = (view.app as BiocadApp).graph

    let graph2 = new SBOL2Graph()
    
    await graph2.loadString(graph.serializeXML())

    let xml = graph2.serializeXML()

    let blob = new Blob([ xml ], {
        type: 'application/rdf+xml'
    })

    downloadBlob('biocad_sbol2.xml', blob)*/

}

async function clickExportBiocad(data)  {

    console.log('click save')

    let view:LoadSaveView = data.view

    let graph = (view.app as BiocadApp).graph

    let xml = graph.serializeXML()

    let blob = new Blob([ xml ], {
        type: 'application/rdf+xml'
    })

    downloadBlob('export.biocad', blob)
}


async function clickExportSBOL2(data)  {

    let view:LoadSaveView = data.view

    let graph = (view.app as BiocadApp).graph

    let graph2 = new SBOL2Graph()
    
    await graph2.loadString(graph.serializeXML())

    let xml = graph2.serializeXML()

    let blob = new Blob([ xml ], {
        type: 'application/rdf+xml'
    })

    downloadBlob('biocad_sbol2.xml', blob)
}

async function clickExportGenBank(data)  {

    let view:LoadSaveView = data.view

    let graph = (view.app as BiocadApp).graph

    try {
        let gb = await SBOLConverterValidator.sxToGenbank(graph)
        let blob = new Blob([ gb ], {
            type: 'text/plain'
        })

        downloadBlob('biocad.gb', blob)
    } catch(e) {
        (view.app as BiocadApp).popupMessage('GenBank conversion failed', e)
    }

}

async function clickExportFASTA(data)  {

    let view:LoadSaveView = data.view

    let graph = (view.app as BiocadApp).graph

    try {
        let gb = await SBOLConverterValidator.sxToFASTA(graph)
        let blob = new Blob([ gb ], {
            type: 'text/plain'
        })

        downloadBlob('biocad.fasta', blob)
    } catch(e) {
        (view.app as BiocadApp).popupMessage('FASTA conversion failed', e)
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


