import Depiction, { Orientation, Opacity } from 'biocad/cad/Depiction';

import GrowingPacker from './binPack'

import assert from 'power-assert'

import { Vec2, LinearRange } from 'jfw/geom'
import ABInteractionDepiction from "biocad/cad/ABInteractionDepiction";
import LinearRangeSet from "jfw/geom/LinearRangeSet";
import ComponentDepiction from "biocad/cad/ComponentDepiction";


const INTERACTION_HEIGHT:number = 1
const INTERACTION_OFFSET:number = 1


class Group {

    depictions:Depiction[]
    interactions:ABInteractionDepiction[]


    // for binpack
    w:number
    h:number

    fit:Vec2

    fixed:boolean
    
    constructor() {
        this.depictions = []
        this.interactions = []
        this.interactionLayers = new Map()
        this.w = 0
        this.h = 0
        this.fixed = false
    }

    mergeFrom(otherGroup:Group) {
        // TODO
    }

    interactionLayers:Map<number, LinearRangeSet>

}

export default function binPackStrategy(parent:Depiction|null, children:Depiction[], padding:number) {

    const interactions:ABInteractionDepiction[] = children.filter(
        (depiction:Depiction) => depiction instanceof ABInteractionDepiction) as ABInteractionDepiction[]

    const groups:Set<Group> = new Set()
    const depictionUidToGroup:Map<number, Group> = new Map()

    interactions.forEach((interaction:ABInteractionDepiction) => {

        var existingGroupA:Group|undefined = depictionUidToGroup.get(interaction.a.uid)
        var existingGroupB:Group|undefined = depictionUidToGroup.get(interaction.b.uid)

        if(existingGroupA !== undefined && existingGroupB !== undefined) {

            if(existingGroupA === existingGroupB) {
                return
            }

            // Both sides of the interaction already have groups.

            groups.delete(existingGroupB)

            existingGroupA.mergeFrom(existingGroupB)

            existingGroupB.depictions.forEach((depiction:Depiction) => {
                depictionUidToGroup.set(depiction.uid, existingGroupA as Group)
            })

            existingGroupA.interactions.push(interaction)

            return
        }

        if(existingGroupA !== undefined) {

            // The A side of the interaction already has a group but B doesn't

            existingGroupA.depictions.push(interaction.b)
            depictionUidToGroup.set(interaction.b.uid, existingGroupA)
            existingGroupA.interactions.push(interaction)

            return
        }

        if(existingGroupB !== undefined) {

            // The B side of the interaction already has a group but A doesn't

            existingGroupB.depictions.push(interaction.a)
            depictionUidToGroup.set(interaction.a.uid, existingGroupB)
            existingGroupB.interactions.push(interaction)

            return
        }

        // Neither side of the interaction already has a group

        const newGroup:Group = new Group()
        newGroup.depictions.push(interaction.a)
        newGroup.depictions.push(interaction.b)
        newGroup.interactions.push(interaction)

        depictionUidToGroup.set(interaction.a.uid, newGroup)
        depictionUidToGroup.set(interaction.b.uid, newGroup)

        groups.add(newGroup)

    })


    children.forEach((child:Depiction) => {

        if(child instanceof ABInteractionDepiction)
            return

        if(depictionUidToGroup.get(child.uid) === undefined) {

            const orphanGroup = new Group()
            orphanGroup.depictions.push(child)
            groups.add(orphanGroup)

        }

    })







    const packer = new GrowingPacker()

    groups.forEach((group:Group) => {

        // horizontal tile
        //
        var offset = Vec2.fromXY(0, 0)
        var maxHeight = -99999

        group.depictions.forEach((child) => {

            child.offset = offset

            offset = offset.add(Vec2.fromXY(child.size.x + padding, 0))

            maxHeight = Math.max(maxHeight, child.size.y)

        })

        group.w = offset.x
        group.h = maxHeight
    })


    // interactions
    //
    groups.forEach((group:Group) => {

        let interactionToLayer:Map<ABInteractionDepiction, number> = new Map()

        group.interactions.forEach((interaction:ABInteractionDepiction) => {

            let { a, b } = interactionPoints(interaction)
            

            // TODO the -1 and a +1 are a hack because we don't have intersectsOrTouchesRange
            // fix it you lazy shit
            const range:LinearRange = new LinearRange(a.x - 1, b.x + 1)


            var layerDir:number

            if(interaction.a instanceof ComponentDepiction &&
                    interaction.a.orientation === Orientation.Reverse) {

                layerDir = 1

            } else {

                layerDir = -1

            }


            var layer

            let curLayer = 0 + layerDir

            for(;;) {

                layer = group.interactionLayers.get(curLayer)

                if(!layer) {
                    layer = new LinearRangeSet()
                    group.interactionLayers.set(curLayer, layer)
                }

                if (!layer.intersectsRange(range))
                    break

                curLayer += layerDir
            }

            //console.log('placing ' + interaction.debugName + ' in ' + curLayer)

            layer.push(range)

            interactionToLayer.set(interaction, curLayer)
        })

        let numAbove = 0
        let numBelow = 0

        for(let layerN of group.interactionLayers.keys()) {

            if(layerN < 0)
                ++ numAbove
            else
                ++ numBelow
        }

        group.h += (numAbove + numBelow) * INTERACTION_HEIGHT

        if(numAbove > 0) {
            group.h += INTERACTION_OFFSET
        }

        if(numBelow > 0) {
            group.h += INTERACTION_OFFSET
        }

        for(let [ interaction, layerN ] of interactionToLayer) {

            let { a, b } = interactionPoints(interaction)

            if(layerN < 0) {

                interaction.setWaypoints([
                    Vec2.fromXY(a.x, a.y),
                    Vec2.fromXY(a.x, a.y - INTERACTION_HEIGHT * (- layerN)),
                    Vec2.fromXY(b.x, b.y - INTERACTION_HEIGHT * (- layerN)),
                    Vec2.fromXY(b.x, b.y),
                ])

            } else {

                let y = numBelow - layerN

                interaction.setWaypoints([
                    Vec2.fromXY(a.x, group.h - y - INTERACTION_HEIGHT + 0.2),
                    Vec2.fromXY(a.x, group.h - y),
                    Vec2.fromXY(b.x, group.h - y),
                    Vec2.fromXY(b.x, group.h - y - INTERACTION_HEIGHT + 0.2),
                ])


            }

        }

    })

    // padding

    for(let group of groups) {
        group.h += padding
    }

    var groupsArr:Array<Group> = Array.from(groups)

    groupsArr.sort((a, b) => {
        return Math.max(b.w, b.h) - Math.max(a.w, a.h)
    })

    packer.fit(groupsArr)


    if(parent) {
        parent.size = Vec2.fromXY(padding + packer.root.w, padding + packer.root.h)
    }

    groupsArr.forEach((group:Group) => {

        assert(group.fit)

        var offset = Vec2.fromXY(padding + group.fit.x, padding + group.fit.y)

        let numAbove = 0
        let numBelow = 0

        for(let layerN of group.interactionLayers.keys()) {

            if(layerN < 0) {
                ++ numAbove
                offset = offset.add(Vec2.fromXY(0, INTERACTION_HEIGHT))
            }

        }

        if(numAbove > 0) {
            offset = offset.add(Vec2.fromXY(0, INTERACTION_OFFSET))
        }

        group.depictions.forEach((child:Depiction) => {

            if(!child.offsetExplicit)
                child.offset = offset.add(child.offset)

        })

        group.interactions.forEach((interaction:ABInteractionDepiction) => {
            interaction.offset = offset
        })


    })

}


function interactionPoints(interaction:ABInteractionDepiction) {

    let bboxA = interaction.a.boundingBox
    let bboxB = interaction.b.boundingBox

    var xA, xB

    if (bboxA.center().x > bboxB.center().x) {

        // A right of B

        if(interaction.a.opacity === Opacity.Blackbox) {
            xA = bboxA.topLeft.x + (bboxA.width() / 2)
        } else {
            xA = bboxA.topLeft.x + (bboxA.width() / 4) * 1
        }

        if(interaction.b.opacity === Opacity.Blackbox) {
            xB = bboxB.topLeft.x + (bboxB.width() / 2)
        } else {
            xB = bboxB.topLeft.x + (bboxB.width() / 4) * 3
        }

    } else {

        // A left of B

        if(interaction.a.opacity === Opacity.Blackbox) {
            xA = bboxA.topLeft.x + (bboxA.width() / 2)
        } else {
            xA = bboxA.topLeft.x + (bboxA.width() / 4) * 3
        }

        if(interaction.b.opacity === Opacity.Blackbox) {
            xB = bboxB.topLeft.x + (bboxB.width() / 2)
        } else {
            xB = bboxB.topLeft.x + (bboxB.width() / 4) * 1
        }
    }


    var yA = interaction.a.boundingBox.topLeft.y - INTERACTION_OFFSET
    var yB = interaction.b.boundingBox.topLeft.y - INTERACTION_OFFSET
    //var yA = bboxA.topLeft.y
    //var yB = bboxB.topLeft.y

    return { a: Vec2.fromXY(xA, yA), b: Vec2.fromXY(xB, yB) }
}

