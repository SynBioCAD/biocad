
import Layout from "biocad/cad/Layout";
import Depiction from "biocad/cad/Depiction";
import DepictionPOD from "biocad/cad/DepictionPOD";
import { SBOLXGraph, SXInteraction } from "sbolgraph";
import InteractionDepiction from "./InteractionDepiction";

export default class LayoutPOD {

    static serialize(layout:Layout):any {

        const pod:any = {
            size: layout.size,
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

    static deserialize(graph:SBOLXGraph, pod:any):Layout {

        const layout = new Layout(graph)

        layout.size = pod.size

        const depictions:Depiction[] = []

        for(let depictionPod of pod.depictions) {
            depictions.push(DepictionPOD.deserialize(layout, graph, undefined, depictionPod))
        }

        for(let depiction of depictions) {
            addRecursive(depiction, undefined)
        }

        for(let depiction of layout.depictions) {
            if(depiction instanceof InteractionDepiction) {
                let dOf = depiction._depictionOf
                if(!dOf || ! (dOf instanceof SXInteraction)) {
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

