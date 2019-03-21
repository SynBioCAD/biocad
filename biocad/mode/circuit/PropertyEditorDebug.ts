
import PropertyEditor from "./PropertyEditor";
import { SBOLXGraph } from "sbolgraph";
import Depiction from "biocad/cad/Depiction";
import { h } from "@biocad/jfw/dist/jfw/vdom";

export default class PropertyEditorDebug extends PropertyEditor {

    d:Depiction

    constructor(d:Depiction) {
        super()
        this.d = d
    }

    render(graph:SBOLXGraph) {

        let parent = this.d.parent

        return h('div', {
            style: {
                'backgroundColor': 'white',
                'color': 'black',
            }

        }, [
            h('span', 'uid ' + this.d.uid),
            h('br'),
            h('span', 'offsetExplicit ' + this.d.offsetExplicit),
            h('br'),
            h('span', 'offset ' + this.d.offset),
            h('br'),
            h('span', 'size ' + this.d.size),
            h('br'),
            h('span', 'parent ' + (parent ? parent.debugName : 'none')),
        ])

    }
}
