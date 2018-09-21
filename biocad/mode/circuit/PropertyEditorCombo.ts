
import { VNode, h } from 'jfw/vdom'
import { SBOLXGraph, triple, node } from "sbolgraph";
import PropertyEditor from "./PropertyEditor";
import { change as changeEvent } from 'jfw/event'

export default class PropertyEditorCombo extends PropertyEditor {

    title:string

    objectURI:string
    predicate:string
    options:{name:string, uri:string}[]

    constructor(title:string, objectURI:string, predicate:string, options:{name:string, uri:string}[]) {

        super()

        this.title = title
        this.objectURI = objectURI
        this.predicate = predicate
        this.options = options

    }

    render(graph:SBOLXGraph):VNode {

        let value:string|undefined = triple.objectUri(
            graph.matchOne(this.objectURI, this.predicate, null)
        )

        return h('tr.sf-inspector-oneline', [
            h('td', this.title),
            h('td', [
                h('select.jfw-select', {
                    value: value || '',
                    'ev-change': changeEvent(onChange, { editor: this, graph: graph }),
                }, this.options.map((option) => {
                    return h('option', {
                        value: option.uri,
                        selected: value === option.uri
                    }, option.name)
                }))
            ])
        ])
    }
}

function onChange(data:any) {

    let editor:PropertyEditorCombo = data.editor
    let graph:SBOLXGraph = data.graph

    console.log(data.value)

    graph.removeMatches(editor.objectURI, editor.predicate, null)
    graph.insert(editor.objectURI, editor.predicate, node.createUriNode(data.value))

}
