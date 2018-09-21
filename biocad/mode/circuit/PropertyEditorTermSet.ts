
import { VNode, h } from 'jfw/vdom'
import { SBOLXGraph, triple } from "sbolgraph";
import PropertyEditor from "./PropertyEditor";

export default class PropertyEditorTermSet extends PropertyEditor {

    title:string

    objectURI:string
    predicate:string

    constructor(title:string, objectURI:string, predicate:string, options:{name:string, uri:string}[]) {

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
                    value: value || ''
                })
            ])
        ])
    }




}
