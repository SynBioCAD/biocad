
import Layout from "biocad/cad/Layout";
import Depiction from "biocad/cad/Depiction";
import DepictionPOD from "biocad/cad/DepictionPOD";
import { SBOLXGraph } from "sbolgraph";
import ABInteractionDepiction from "./ABInteractionDepiction";

export default class LayoutPOD {

    static serialize(layout:Layout):any {

        const pod:any = {
            size: layout.size,
            depictions: []
        }

        layout.depictions.forEach((depiction:Depiction) => {

            if(!depiction.parent) {
                pod.depictions.push(DepictionPOD.serialize(depiction))
            }

        })

        //console.error('**!******** LAYOT SERIALZUIEDDD')
        //console.dir(pod)

        return pod
    }

    static deserialize(graph:SBOLXGraph, pod:any):Layout {

        const layout = new Layout(graph)

        layout.size = pod.size

        const depictions:Depiction[] = []

        pod.depictions.forEach((depictionPod:any) => {
            depictions.push(DepictionPOD.deserialize(layout, graph, undefined, depictionPod))
        })

        depictions.forEach((depiction:Depiction) => {
            addRecursive(depiction, undefined)

        })

        for(let depiction of layout.depictions) {
            if(depiction instanceof ABInteractionDepiction) {
                let dOf = depiction._depictionOf
                if(!dOf) {
                    throw new Error('depictionOf undefined')
                }
                depiction.mapParticipationsToDepictions(dOf)
            }
        }

        function addRecursive(depiction:Depiction, parent:Depiction|undefined) {

            layout.addDepiction(depiction, parent)

            depiction.children.forEach((child:Depiction) => {
                addRecursive(child, depiction)
            })

        }

        return layout
    }

}

