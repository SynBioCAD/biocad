
import { VNode, h } from 'jfw/vdom'
import { SBOLXGraph, triple, node } from "sbolgraph";
import PropertyEditor from "./PropertyEditor";
import { change as changeEvent } from 'jfw/event'
import PropertyAccessor from './PropertyAccessor';

export default class PropertyEditorCombo extends PropertyEditor {

    title:string
    options:{name:string, uri:string}[]
    accessor:PropertyAccessor

    constructor(title:string, accessor:PropertyAccessor, options:{name:string, uri:string}[]) {

        super()

        this.title = title
        this.options = options
        this.accessor = accessor

    }

    render(graph:SBOLXGraph):VNode {

        let value:string|undefined = this.accessor.get(graph)

        return h('tr.sf-inspector-oneline', [
            h('td', this.title),
            h('td', [
                h('select.jfw-select', {
                    value: value || '',
                    'ev-change': changeEvent(onChange, { graph: graph, editor: this }),
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

    editor.accessor.set(data.graph, data.value)

}
