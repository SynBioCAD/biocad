
import LabelledDepiction from "biocad/cad/LabelledDepiction";
import InstructionSet from "biocad/cad/layout-instruction/InstructionSet";
import LabelDepiction from "../cad/LabelDepiction";
import Depiction, { Orientation } from "biocad/cad/Depiction";
import { Vec2 } from "jfw/geom";
import ComponentDepiction from "biocad/cad/ComponentDepiction";
import FeatureLocationDepiction from "biocad/cad/FeatureLocationDepiction";

export default function configurateLabelled(labelled:LabelledDepiction, instructions:InstructionSet) {


    let label = labelled.getLabel()
    let thing = labelled.getLabelled()


    let reverse:boolean = false

    if (thing instanceof ComponentDepiction || thing instanceof FeatureLocationDepiction) {
        if(thing.orientation === Orientation.Reverse) {
            reverse = true
        }
    }


    if(reverse) { 
        thing.offset = Vec2.fromXY(0, 0)
        label.offset = Vec2.fromXY(0, thing.height)
    } else {
        thing.offset = Vec2.fromXY(0, label.height)
        label.offset = Vec2.fromXY(0, 0)
    }

    labelled.size = Vec2.fromXY(
        Math.max(label.size.x, thing.size.x),
        label.size.y + thing.size.y
    ).max(labelled.minSize)
        

    /*
    const label:LabelDepiction|undefined = depiction.label

    if(label !== undefined) {

        if (depiction.orientation === Orientation.Reverse) {
            depiction.setMarginBottom(label.size.y)
            label.offset = Vec2.fromXY(0, depiction.innerSize.y)
        } else {
            label.offset = Vec2.fromXY(0, - label.size.y)
            depiction.setMarginTop(label.size.y)
        }

        const overflowRight:number = label.size.x - depiction.size.x

        if(overflowRight > 0) {
            depiction.marginRight = overflowRight

            const foo:Vec2 = depiction.size.add(Vec2.fromXY(overflowRight, 0))

            dogsole.warn('depiction ' + depiction.debugName + ' changing size from ' + depiction.size + ' to ' + foo + ' to accommodate for label')

            depiction.size = depiction.size.add(Vec2.fromXY(overflowRight, 0))
        }
    }
    */

}
 