
import PropertyEditor from "./PropertyEditor";
import { Graph } from "sbolgraph";
import Depiction from "biocad/cad/layout/Depiction";
import { h } from "jfw/vdom";
import LocationableDepiction from "biocad/cad/layout/LocationableDepiction";
import LabelDepiction from "biocad/cad/layout/LabelDepiction";

export default class PropertyEditorDebug extends PropertyEditor {

    d:Depiction

    constructor(d:Depiction) {
        super()
        this.d = d
    }

    render(graph:Graph) {

        let parent = this.d.parent

        let label = this.d.label

        let props = [
            h('span', 'uid ' + this.d.uid),
            h('br'),
            h('span', 'offsetExplicit ' + this.d.offsetExplicit),
            h('br'),
            h('span', 'offset ' + this.d.offset),
            h('br'),
            h('span', 'size ' + this.d.size),
            h('br'),
            h('span', 'parent ' + (parent ? parent.debugName : 'none')),
            h('br'),
            h('span', 'label ' + (label ? label.debugName : 'none')),
        ]

        if(this.d instanceof LocationableDepiction) {
            props.push(
                h('br'),
                h('span', 'proportionalWidth ' + this.d.proportionalWidth || 'none')
            )
        }

        if(this.d instanceof LabelDepiction) {
            props.push(
                h('br'),
                h('span', 'labelFor ' + this.d.labelFor || 'none')
            )
        }

        return h('tr', [
            h('td', {
                colSpan: '2',
                style: {
                    'backgroundColor': 'white',
                    'color': 'black',
                    'font-size': '8pt'
                }
            }, props)
        ])

    }
}
