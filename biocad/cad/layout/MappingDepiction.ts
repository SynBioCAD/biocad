
import InteractionDepiction from './InteractionDepiction'
import Depiction from "biocad/cad/layout/Depiction";
import Layout from "biocad/cad/layout/Layout";
import { svg, VNode } from "@biocad/jfw/vdom";
import { S3Interaction, S3Participation, S3SubComponent, S3MapsTo } from "sbolgraph";
import { Specifiers } from 'bioterms'
import { assert } from 'power-assert'
import { Vec2 } from "@biocad/jfw/geom";
import RenderContext from '../RenderContext'
import IdentifiedChain from 'biocad/IdentifiedChain';

export default class MappingDepiction extends Depiction {

    a:Depiction
    b:Depiction

    private waypoints:Vec2[]


    constructor(layout:Layout, depictionOf:S3MapsTo, identifiedChain:IdentifiedChain, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)
        
        this.waypoints = []

    }



    render(renderContext:RenderContext):VNode {

        return svg('g')

    }

    renderThumb(size:Vec2):VNode {

        return svg('g')

    }

    setWaypoints(waypoints:Vec2[]) {

        this.waypoints = waypoints

    }

}






