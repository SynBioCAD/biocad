
import Depiction from "biocad/cad/Depiction";
import { SXIdentified, SXInteraction } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import { VNode } from "jfw/vdom";
import RenderContext from './RenderContext'
import { svg } from 'jfw/vdom'
import Vec2 from "jfw/geom/Vec2";
import IdentifiedChain from "../IdentifiedChain";

export default abstract class InteractionDepiction extends Depiction {

    protected constructor(layout:Layout, depictionOf:SXInteraction, identifiedChain:IdentifiedChain, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

    }

    isResizeable() {
        return false
    }

}
