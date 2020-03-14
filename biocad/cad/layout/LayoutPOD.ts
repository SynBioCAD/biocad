
import Layout from "biocad/cad/layout/Layout";
import Depiction from "biocad/cad/layout/Depiction";
import DepictionPOD from "biocad/cad/layout/DepictionPOD";
import { Graph, S3Interaction } from "sbolgraph";
import InteractionDepiction from "./InteractionDepiction";
import { Vec2 } from 'jfw/geom'

export default class LayoutPOD {

    static serialize(layout:Layout):any {

        const pod:any = {
            size: layout.size.toPOD(),
            depictions: []
        }

        for(let depiction of layout.depictions) {

            if(!depiction.parent) {
                pod.depictions.push(DepictionPOD.serialize(depiction))
            }

        }

        //console.error('**!******** LAYOT SERIALZUIEDDD')
        //console.dir(pod)

        return pod
    }

    static deserialize(graph:Graph, pod:any):Layout {

        const layout = new Layout(graph)

        layout.size = Vec2.fromPOD(pod.size)

        const depictions:Depiction[] = []

        let uidToDepiction = new Map()

        for(let depictionPod of pod.depictions) {
            if(depictionPod['class'] === 'LabelDepiction')
                continue
            if(depictionPod['class'] === 'InteractionDepiction')
                continue
            depictions.push(DepictionPOD.deserialize(layout, graph, undefined, depictionPod, uidToDepiction))
        }

        for(let depictionPod of pod.depictions) {
            if(depictionPod['class'] === 'InteractionDepiction')
                depictions.push(DepictionPOD.deserialize(layout, graph, undefined, depictionPod, uidToDepiction))
        }

        for(let depictionPod of pod.depictions) {
            if(depictionPod['class'] === 'LabelDepiction')
                depictions.push(DepictionPOD.deserialize(layout, graph, undefined, depictionPod, uidToDepiction))
        }

        for(let depiction of depictions) {
            addRecursive(depiction, undefined)
        }

        for(let depiction of layout.depictions) {
            if(depiction instanceof InteractionDepiction) {
                let dOf = depiction._depictionOf
                if(!dOf || ! (dOf instanceof S3Interaction)) {
                    throw new Error('bad depictionOf')
                }
            }
        }

        function addRecursive(depiction:Depiction, parent:Depiction|undefined) {

            layout.addDepiction(depiction, parent)

            for(let child of depiction.children) {
                addRecursive(child, depiction)
            }

        }

        return layout
    }

}

