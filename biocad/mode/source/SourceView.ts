
import { View } from '@biocad/jfw/ui'
import { CodeMirrorWidget } from '@biocad/jfw/ui';
import { h, VNode } from '@biocad/jfw/vdom';
import BiocadApp from "biocad/BiocadApp";
import LayoutPOD from "biocad/cad/layout/LayoutPOD";
import EncodingSelector, { Encoding } from './EncodingSelector';
import { SBOL2GraphView, Graph, sbol3 } from 'sboljs';
import CytoscapeRDFWidget from 'biocad/view/CytoscapeRDFWidget'
import CircuitViewMode from '../circuit/CircuitMode';
import CircuitView from '../circuit/CircuitView';
import BiocadProject from '../../BiocadProject';

export default class SourceView extends View {

	project:BiocadProject

    encodingSelector:EncodingSelector
    source:string
    editorMode:string
    graph:Graph|undefined

    constructor(project) {

        super(project)
	this.project = project

        this.source = ''
        this.editorMode = 'xml'
        this.encodingSelector = new EncodingSelector(project)

        this.encodingSelector.onChangeEncoding = (encoding:Encoding) => {
            this.updateSerialization()
        }
    }

    async updateSerialization() {

        const project:BiocadProject = this.project

        const graph = project.graph

	try {
        var sbol2Graph = new SBOL2GraphView(new Graph())
        await sbol2Graph.loadString(sbol3(graph).serializeXML())
	var sbol2xml:any = sbol2Graph.serializeXML()
	} catch(e) {
		var sbol2xml = e.toString()
	}

        switch(this.encodingSelector.currentEncoding) {
            case Encoding.SBOL3:
                this.source = sbol3(graph).serializeXML()
                this.editorMode = 'xml'
                break
            case Encoding.SBOL2:
                this.source = sbol2xml
                this.editorMode = 'xml'
                break
            case Encoding.Graph:
                this.source = ''
                this.graph = graph
                break
            case Encoding.SBOL2Graph:
                this.source = ''
                this.graph = sbol2Graph.graph
                break
            case Encoding.Layout:
                for(let mode of (this.project).modes) {
                    if(mode instanceof CircuitViewMode) {
                        this.source = JSON.stringify(
                            LayoutPOD.serialize((mode.view as CircuitView).layoutEditor.layout),
                            null,
                            2
                        )
                        this.editorMode = 'javascript'
                    }
                }
                break
        }

        this.update()

    }

    activate() {

        this.updateSerialization()

    }

    render() {

        const project = this.project
        const graph = project.graph

        var widget:any

        if(this.graph) {

            widget = new CytoscapeRDFWidget(this.graph)

        } else {

         widget = 
            new CodeMirrorWidget({

                lineNumbers: true,
                //viewportMargin: Infinity,
                mode: this.editorMode,
                value: this.source,
                readOnly: true
                                
            }, {

                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
            })
        }

        return h('div.jfw-main-view-no-sidebar', {
            style: {
                width: '100%',
                height: '100%'
            }
        }, [
            this.encodingSelector.render(),
            h('div', {
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }
            }, [
                widget
            ])
        ])

    }


}


