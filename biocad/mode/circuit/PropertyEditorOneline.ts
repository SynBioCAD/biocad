
import { VNode, h } from 'jfw/vdom'
import { SBOLXGraph, triple, node } from "sbolgraph";
import PropertyEditor from "./PropertyEditor";
import { keyupChange } from 'jfw/event'

export default class PropertyEditorOneline extends PropertyEditor {

    title:string

    objectURI:string
    predicate:string

    constructor(title:string, objectURI:string, predicate:string) {

        super()

        this.title = title
        this.objectURI = objectURI
        this.predicate = predicate

    }

    render(graph:SBOLXGraph):VNode {

        let value:string|undefined = triple.objectString(
            graph.matchOne(this.objectURI, this.predicate, null)
        )

        return h('tr.sf-inspector-oneline', [
            h('td', this.title),
            h('td', [
                h('input', {
                    value: value || '',
                    'ev-keyup': keyupChange(onChange, { editor: this, graph: graph })
                })
            ])
        ])
    }
}

function onChange(data:any) {

    let editor:PropertyEditorOneline = data.editor
    let graph:SBOLXGraph = data.graph

    console.log(data.value)

    graph.removeMatches(editor.objectURI, editor.predicate, null)
    graph.insert(editor.objectURI, editor.predicate, node.createStringNode(data.value))

}
