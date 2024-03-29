
import FeatureLocationDepiction from "biocad/cad/layout/FeatureLocationDepiction";
import { Vec2 } from "@biocad/jfw/geom";
import LabelDepiction from "biocad/cad/layout/LabelDepiction";
import { Orientation } from "biocad/cad/layout/Depiction";
import { shortNameFromTerm } from "data/parts";
import { S3SequenceFeature, S3Range } from "sboljs"
import CircularBackboneDepiction from "biocad/cad/layout/CircularBackboneDepiction";
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

    let layout = depiction.layout

    var type = 'user-defined'

    const depictionOf:S3SequenceFeature = depiction.depictionOf as S3SequenceFeature

    const roles:Array<string> = depictionOf.roles

    for(let role of roles) {

        const shortName = shortNameFromTerm(role)

        if(shortName)
            type = shortName
    }

    var backbonePlacement = 'top'

    if(depiction.orientation === Orientation.Reverse) {
        backbonePlacement = 'mid'
    }



    let { proportionalWidth, displayWidth } = depiction.calcWidthFromLocation()

    // depiction.size = Vec2.fromXY(displayWidth, 2 * visbolite.glyphScaleFromType(type).y)
    depiction.size = Vec2.fromXY(displayWidth, 2)
    depiction.proportionalWidth = proportionalWidth

    depiction.backbonePlacement = backbonePlacement



}

function configurateSACircular(depiction:FeatureLocationDepiction):void {

    depiction.size = Vec2.fromXY(2, 2)
}
