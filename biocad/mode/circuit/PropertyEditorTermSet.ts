
import { VNode, h } from 'jfw/vdom'
import { SBOLXGraph, triple } from "sbolgraph";
import PropertyEditor from "./PropertyEditor";
import OntologyTermSelectorDialog from 'biocad/dialog/OntologyTermSelectorDialog'
import BiocadApp from 'biocad/BiocadApp'
import PropertyAccessor from './PropertyAccessor'
import { click as clickEvent } from 'jfw/event'

export default class PropertyEditorTermSet extends PropertyEditor {


    title:string

    app:BiocadApp

    ontology:any
    ontologyNamespace:string
    rootTermURI:string|null
    accessor:PropertyAccessor<string[]>

    constructor(app:BiocadApp, title:string, accessor:PropertyAccessor<string[]>, ontologyNamespace:string, ontology:any, rootTermURI:string) {

        super()

        this.accessor = accessor
        this.title = title
        this.app = app
        this.ontology = ontology
        this.rootTermURI = rootTermURI
        this.ontologyNamespace = ontologyNamespace
    }

    render(graph:SBOLXGraph):VNode {

        let uris = this.accessor.get(graph)

        return h('tr.sf-inspector-oneline', [
            h('td', this.title),
            h('span.addremove', uris.map((uri) => {
                return h('span.addremove-item', [
                    h('span.addremove-remove.fa.fa-times-circle', {
                        'ev-click': clickEvent(clickRemove, { editor: this, graph, uri })
                    }),
                    this.ontology[this.uriToTerm(uri)].name
                ])
            }).concat([
                h('span.addremove-add.fa.fa-plus-circle', {
                    'ev-click': clickEvent(clickChoose, { editor: this, graph })
                })
            ]))
        ])
    }

    uriToTerm(uri:string):string {
        return uri.slice(this.ontologyNamespace.length)
    }

    termToURI(term:string):string {
        return this.ontologyNamespace + term
    }

}

async function clickChoose(data) {

    let editor:PropertyEditorTermSet = data.editor

    let graph:SBOLXGraph = data.graph

    let app = editor.app

    let term:string|null = await OntologyTermSelectorDialog.selectTerm(app, 'Choose role', null, editor.ontology, editor.rootTermURI)

    if(term !== null) {

        let cur = editor.accessor.get(graph)

        if(cur.indexOf(term) === -1)
            cur.push(editor.termToURI(term))

        editor.accessor.set(graph, cur)
    }

}

function clickRemove(data) {

    let editor:PropertyEditorTermSet = data.editor
    let uri:string = data.role

    let graph:SBOLXGraph = data.graph

    let cur = editor.accessor.get(graph)

    let idx = cur.indexOf(uri)

    if(idx !== -1) {
        cur.splice(idx, 1)
    }

    editor.accessor.set(graph, cur)
}

