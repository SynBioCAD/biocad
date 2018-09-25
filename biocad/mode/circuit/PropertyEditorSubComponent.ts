import PropertyEditor from "./PropertyEditor";
import { SBOLXGraph, triple, node, SXComponent, SXSubComponent } from "sbolgraph";
import { VNode, h } from 'jfw/vdom'
import PropertyEditorCombo from "./PropertyEditorCombo";
import { change as changeEvent } from 'jfw/event'

export default class PropertyEditorSubComponent extends PropertyEditor {

    title:string
    componentURI:string
    objectURI:string
    predicate:string

    constructor(title:string, componentURI:string, objectURI:string, predicate:string) {

        super()

        this.title = title
        this.componentURI = componentURI
        this.objectURI = objectURI
        this.predicate = predicate

    }
    
    render(graph:SBOLXGraph):VNode {

        let value:string|undefined = triple.objectUri(
            graph.matchOne(this.objectURI, this.predicate, null)
        )

        let parentComponent = graph.uriToFacade(this.componentURI)
        let subComponent = value ? graph.uriToFacade(value) : undefined
        
        if(! (parentComponent instanceof SXComponent) || ! (subComponent instanceof SXSubComponent)) {
            throw new Error('not subcomponent?')
        }

        let otherSubComponents = parentComponent.subComponents

        return h('tr.sf-inspector-oneline', [
            h('td', this.title),
            h('td', [
                h('select.jfw-select', {
                    value: value || '',
                    'ev-change': changeEvent(onChange, { editor: this, graph: graph }),
                }, otherSubComponents.map((subComponent) => {
                    return h('option', {
                        value: subComponent.uri,
                        selected: value === subComponent.uri
                    }, subComponent.displayName)
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
