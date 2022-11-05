
import { VNode, h } from '@biocad/jfw/vdom'
import { Graph, triple } from "sboljs";
import PropertyEditor from "./PropertyEditor";
import OntologyTermSelectorDialog from 'biocad/dialog/OntologyTermSelectorDialog'
import BiocadApp from 'biocad/BiocadApp'
import PropertyAccessor from './PropertyAccessor'
import { click as clickEvent } from '@biocad/jfw/event'

export default class PropertyEditorTermSet extends PropertyEditor {


    title:string

    project:BiocadProject

    ontology:any
    ontologyNamespace:string
    rootTermURI:string|null
    accessor:PropertyAccessor<string[]>

    constructor(project:BiocadProject, title:string, accessor:PropertyAccessor<string[]>, ontologyNamespace:string, ontology:any, rootTermURI:string) {

        super()

        this.accessor = accessor
        this.title = title
        this.project = project
        this.ontology = ontology
        this.rootTermURI = rootTermURI
        this.ontologyNamespace = ontologyNamespace
    }

    render(graph:Graph):VNode {

        let uris = this.accessor.get(graph)

        return h('tr.sf-inspector-oneline', [
            h('td', this.title),
            h('span.addremove', uris.map((uri) => {
                return h('span.addremove-item', {
                    'ev-click': clickEvent(clickRemove, { editor: this, graph, uri })
                }, [
                    h('span.addremove-remove.fa.fa-times-circle'),
                    ' ' + (this.ontology[this.uriToTerm(uri)] || { 'name': 'unknown' }).name
                ])
            }).concat([
                h('span.addremove-add', {
                    'ev-click': clickEvent(clickChoose, { editor: this, graph })
                }, [
                    h('span.fa.fa-plus')
                ])
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

    let graph:Graph = data.graph

    let project = editor.project

    let term:string|null = await OntologyTermSelectorDialog.selectTerm(project, 'Choose role', null, editor.ontology, editor.rootTermURI)

    if(term !== null) {

        let cur = editor.accessor.get(graph)

        if(cur.indexOf(term) === -1)
            cur.push(editor.termToURI(term))

        editor.accessor.set(graph, cur)
    }

}

function clickRemove(data) {

    let editor:PropertyEditorTermSet = data.editor
    let uri:string = data.uri

    let graph:Graph = data.graph

    let cur = editor.accessor.get(graph)

    let idx = cur.indexOf(uri)

    if(idx !== -1) {
        cur.splice(idx, 1)
    } else {
        console.warn('term ' + uri + ' not found in set ' + JSON.stringify(cur))
    }

    editor.accessor.set(graph, cur)
}

