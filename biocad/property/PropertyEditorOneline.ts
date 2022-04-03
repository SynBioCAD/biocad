
import { VNode, h } from '@biocad/jfw/vdom'
import { Graph, triple, node } from "sbolgraph";
import PropertyEditor from "./PropertyEditor";
import { keyupChange } from '@biocad/jfw/event'
import PropertyAccessor from './PropertyAccessor';

export default class PropertyEditorOneline extends PropertyEditor {

    title:string
    accessor:PropertyAccessor<string>

    constructor(title:string, accessor:PropertyAccessor<string>) {

        super()

        this.title = title
        this.accessor = accessor

    }

    render(graph:Graph):VNode {

        let value:string|undefined = this.accessor.get(graph)

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
    let graph:Graph = data.graph

    console.log(data.value)

    editor.accessor.set(graph, data.value)

}
