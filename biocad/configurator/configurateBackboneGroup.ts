
import BackboneGroupDepiction from '../cad/BackboneGroupDepiction'
import InstructionSet from '../cad/layout-instruction/InstructionSet'
import BackboneDepiction from 'biocad/cad/BackboneDepiction';
import { Vec2 } from 'jfw/geom'

export default function configurateBackboneGroup(depiction:BackboneGroupDepiction, instructions:InstructionSet): void {

    let min = 0

    for(let backbone of depiction.children) {

        if(! (backbone instanceof BackboneDepiction)) {
            throw new Error('backbone group child is not a backbone?')
        }

        min = Math.min(min, backbone.backboneIndex)
    }

    //let w = 0

    let y = 0

    for(let n = min;; ++ n) {

        let backbone = depiction.getBackboneForIndex(n)

        if(!backbone)
            break

        backbone.offset = Vec2.fromXY(BackboneGroupDepiction.extensionLength, y)

        y += backbone.size.y

        // actually, backbone.size.x should always be == the group width
        //w = Math.max(w, backbone.size.x)
    }

    depiction.size = Vec2.fromXY(depiction.backboneLength + BackboneGroupDepiction.extensionLength * 2, y)
}
