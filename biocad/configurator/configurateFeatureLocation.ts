
import FeatureLocationDepiction from "biocad/cad/FeatureLocationDepiction";
import Vec2 from "jfw/geom/Vec2";
import LabelDepiction from "biocad/cad/LabelDepiction";
import { Orientation } from "biocad/cad/Depiction";
import { shortNameFromTerm } from "data/parts";
import visbolite from 'visbolite'
import { SXSequenceFeature } from "sbolgraph"
import CircularBackboneDepiction from "biocad/cad/CircularBackboneDepiction";
import InstructionSet from "biocad/cad/layout-instruction/InstructionSet";

export default function configurateFeatureLocation(depiction:FeatureLocationDepiction, instructions:InstructionSet): void {

    if(CircularBackboneDepiction.ancestorOf(depiction)) {
        configurateSACircular(depiction)
    } else {
        configurateSALinear(depiction)
    }

    /*
    const label:LabelDepiction|undefined = depiction.label

    if(label !== undefined) {

        if (depiction.orientation === Orientation.Reverse) {
            label.offset = Vec2.fromXY(0, depiction.size.y)
            depiction.marginBottom = label.size.y
            depiction.size = depiction.size.add(Vec2.fromXY(0, label.size.y))
        } else {
            label.offset = Vec2.fromXY(0, - label.size.y)
            depiction.marginTop = label.size.y
            depiction.size = depiction.size.add(Vec2.fromXY(0, label.size.y))
        }

        const overflowRight:number = label.size.x - depiction.size.x

        if(overflowRight > 0) {
            depiction.marginRight = overflowRight
            depiction.size = depiction.size.add(Vec2.fromXY(overflowRight, 0))
        }
    }
    */
}

function configurateSALinear(depiction:FeatureLocationDepiction):void {

    var type = 'user-defined'

    const depictionOf:SXSequenceFeature = depiction.depictionOf as SXSequenceFeature

    const roles:Array<string> = depictionOf.roles

    roles.forEach((role:string) => {

        const shortName = shortNameFromTerm(role)

        if(shortName)
            type = shortName
    })

    var backbonePlacement = visbolite.backbonePlacement({
        type: type
    })

    if(depiction.orientation === Orientation.Reverse) {

        backbonePlacement = ({
            top: 'bottom',
            mid: 'mid',
            bottom: 'top'

        })[backbonePlacement]

    }



    const size = Vec2.fromXY(2, 2)

    depiction.size = size
    depiction.scale = visbolite.glyphScaleFromType(type)

    depiction.backbonePlacement = backbonePlacement



}

function configurateSACircular(depiction:FeatureLocationDepiction):void {

    depiction.size = Vec2.fromXY(2, 2)
}
