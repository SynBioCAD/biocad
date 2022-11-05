import PropertyEditor from "./PropertyEditor";
import { Graph, triple, node, S3Component, S3SubComponent, sbol3 } from "sboljs";
import { VNode, h } from '@biocad/jfw/vdom'
import PropertyEditorCombo from "./PropertyEditorCombo";
import { change as changeEvent } from '@biocad/jfw/event'

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
    
    render(graph:Graph):VNode {

        let value:string|undefined = triple.objectUri(
            graph.matchOne(node.createUriNode(this.objectURI), this.predicate, null)
        )

        let parentComponent = sbol3(graph).uriToFacade(this.componentURI)
        let subComponent = value ? sbol3(graph).uriToFacade(value) : undefined
        
        if(! (parentComponent instanceof S3Component) || ! (subComponent instanceof S3SubComponent)) {
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

    let editor:PropertyEditorSubComponent = data.editor
    let graph:Graph = data.graph

    console.log(data.value)

    graph.removeMatches(node.createUriNode(editor.objectURI), editor.predicate, null)
    graph.insertTriple(node.createUriNode(editor.objectURI), editor.predicate, node.createUriNode(data.value))

}
