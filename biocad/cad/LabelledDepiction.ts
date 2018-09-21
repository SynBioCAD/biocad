
import Depiction from "biocad/cad/Depiction";
import LabelDepiction from "./LabelDepiction";
import { svg, VNode } from "jfw/vdom";
import RenderContext from "biocad/cad/RenderContext";
import { Vec2, Matrix } from "jfw/geom";
import Layout from "biocad/cad/Layout";
import { SXIdentified } from "sbolgraph";
import IdentifiedChain from "../IdentifiedChain";

export default class LabelledDepiction extends Depiction {

    constructor(layout:Layout, depictionOf:SXIdentified|undefined, identifiedChain:IdentifiedChain, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

    }

    render(renderContext:RenderContext):VNode {

        /*
        const offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        const transform = Matrix.translation(offset)

        return svg('rect', {
            transform: transform.toSVGString(),
            width: size.x,
            height: size.y,
            fill: 'none',
            stroke: 'green',
            rx: '4px',
            ry: '4px',
            'stroke-width': '2px'
        })*/

        return []

    }

    getLabel():LabelDepiction {

        for(let child of this.children) {
            if(child instanceof LabelDepiction) {
                return child
            }
        }

        throw new Error('???')
    }

    getLabelled():Depiction {

        for(let child of this.children) {
            if(! (child instanceof LabelDepiction)) {
                return child
            }
        }

        throw new Error('???')
    }

    renderThumb(size:Vec2):VNode {
        return this.getLabelled().renderThumb(size)
    }

    getAnchorY():number {

        let labelled = this.getLabelled()

        return labelled.offset.y + labelled.getAnchorY()


    }

}
