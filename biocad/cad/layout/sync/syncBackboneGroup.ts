import { Specifiers } from "bioterms"
import { S3Identified, S3SubComponent, S3Location } from "sboljs"
import S3ComponentReference from "sboljs/dist/sbol3/S3ComponentReference"
import IdentifiedChain from "../../../IdentifiedChain"
import DetailPreset from "../../detail-preset/DetailPreset"
import BackboneDepiction from "../BackboneDepiction"
import ComponentDepiction from "../ComponentDepiction"
import Depiction, { Orientation } from "../Depiction"
import Layout from "../Layout"
import syncComponentDepiction from "./syncComponentDepiction"
import syncComponentReferenceDepiction from "./syncComponentReferenceDepiction"
import syncLabel from "./syncLabel"
import syncLocationDepiction from "./syncLocationDepiction"

export default function syncBackboneGroup(layout:Layout, preset:DetailPreset, dlGroup:Array<S3Identified>, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation):void {

        // parent is a depiction of an S3Component or S3SubComponent (i.e., a ComponentDepiction)

        if(! (parent instanceof ComponentDepiction)) {
            throw new Error('???')
        }

        let backbone:BackboneDepiction|null = null

        for(let child of parent.children) {
            if(child instanceof BackboneDepiction) {
                backbone = child
                break
            }
        }

        if(!backbone) {
            backbone = new BackboneDepiction(layout, parent)
            backbone.setSameVersionAs(layout)
            layout.addDepiction(backbone, parent)
        }

        backbone.stamp = Layout.nextStamp

        var c:ComponentDepiction = parent as ComponentDepiction

        let circular:boolean = c.getDefinition().hasType(Specifiers.SBOL2.Type.Circular)

        for(let child of dlGroup) {

            /*
            if(!forward) {
                orientation = reverse(orientation)
            }*/

            let newChain = chain.extend(child)

            var obj

            if(child instanceof S3SubComponent) {
                obj = syncComponentDepiction(layout, preset, child, child.instanceOf, newChain, backbone, nestDepth + 1, orientation)
            } else if (child instanceof S3Location) {
                obj = syncLocationDepiction(layout, preset, child, newChain, backbone, nestDepth + 1, orientation)
            } else if (child instanceof S3ComponentReference) {
                obj = syncComponentReferenceDepiction(layout, preset, child, newChain, backbone, nestDepth + 1, orientation)
            } else {
                throw new Error('???')
            }

            syncLabel(layout, preset, backbone, obj, nestDepth)
        }

    }