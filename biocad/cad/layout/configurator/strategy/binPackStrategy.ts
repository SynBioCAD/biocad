import Depiction, { Orientation, Opacity } from 'biocad/cad/layout/Depiction';

import GrowingPacker from './binPack'


import { Vec2, LinearRange } from '@biocad/jfw/geom'
import InteractionDepiction from "biocad/cad/layout/InteractionDepiction";
import { LinearRangeSet } from "@biocad/jfw/geom";
import ComponentDepiction from "biocad/cad/layout/ComponentDepiction";
import BackboneDepiction from '../../BackboneDepiction'
import { reverse } from 'dns';
import LabelDepiction from 'biocad/cad/layout/LabelDepiction';
import { S3Interaction } from 'sbolgraph';
import { Specifiers } from 'bioterms';


const INTERACTION_HEIGHT:number = 1
const INTERACTION_OFFSET:number = 1


class Group {

    depictions:Set<Depiction>
    interactions:Set<InteractionDepiction>


    // for binpack
    w:number
    h:number

    fit:Vec2

    fixed:boolean
    
    constructor() {
        this.depictions = new Set()
        this.interactions = new Set()
        this.interactionLayers = new Map()
        this.w = 0
        this.h = 0
        this.fixed = false
    }

    mergeFrom(otherGroup:Group) {

        for(let d of otherGroup.depictions)
            this.depictions.add(d)

        for(let i of otherGroup.interactions)
            this.interactions.add(i)

        this.numInteractionsAbove += otherGroup.numInteractionsAbove
        this.numInteractionsBelow += otherGroup.numInteractionsBelow
    }

    interactionLayers:Map<number, LinearRangeSet>
    numInteractionsAbove:number
    numInteractionsBelow:number
}

export default function binPackStrategy(parent:Depiction|null, children:Depiction[], padding:number) {

    let groups = createInteractionGroups(parent, children)

    console.log('binPackStrategy: Created ' + groups.length + ' interaction group(s)')

    for(let group of groups) {
        console.log('Group has ' + group.depictions.size + ' depictions and ' + group.interactions.size + ' interactions')
    }

    horizontallyTileChildrenOfGroups(parent, groups, padding)

    const packer = new GrowingPacker()

    let interactionToLayer = createABInteractionLayers(parent, groups)

    // padding
    for(let group of groups) {
        group.h += padding
    }

    // binpack all groups

    groups.sort((a, b) => {
        return Math.max(b.w, b.h) - Math.max(a.w, a.h)
    })

    packer.fit(groups)

    if(parent) {
        parent.size = Vec2.fromXY(padding + packer.root.w, padding + packer.root.h).max(parent.minSize)
    }

    for(let group of groups) {

        let numAbove = 0
        let numBelow = 0

        for(let layerN of group.interactionLayers.keys()) {

            if(layerN < 0) {
                ++ numAbove
            } else {
                ++ numBelow
            }

        }

        group.numInteractionsAbove = numAbove
        group.numInteractionsBelow = numBelow
    }

    for(let group of groups) {

        if(!group.fit) {
            console.dir(group)
            throw new Error('binPackStrategy: group.fit not set')
        }

        let groupOffset = Vec2.fromXY(padding + group.fit.x, padding + group.fit.y)

        groupOffset = groupOffset.add(Vec2.fromXY(0, INTERACTION_HEIGHT * group.numInteractionsAbove))

        if(group.numInteractionsAbove > 0) {
            groupOffset = groupOffset.add(Vec2.fromXY(0, INTERACTION_OFFSET))
        }

        for(let child of group.depictions) {

            console.log('groupOffset', groupOffset, 'for depiction', child.debugName)

            if(!child.offsetExplicit) {
                child.offset = groupOffset.add(child.offset)

                if(child.label) {
                    if(!child.label.offsetExplicit)
                        child.label.offset = groupOffset.add(child.label.offset)
                }
            }
        }

    }

    routeABInteractions(parent, groups, interactionToLayer, padding)


    if(parent) {

        for(let child of parent.children) {
            parent.size = parent.size.max(child.offset.add(child.size).addScalar(padding))
        }

    }
}

function createInteractionGroups(parent:Depiction|null, children:Depiction[]):Group[] {

    const interactions:InteractionDepiction[] = children.filter(
        (depiction:Depiction) => depiction instanceof InteractionDepiction) as InteractionDepiction[]

    const groups:Set<Group> = new Set()
    const depictionUidToGroup:Map<number, Group> = new Map()

    // Any two things that interact with each other must be in the same group
    for(let interaction of interactions) {

        console.log('binPackStrategy: Processing interaction, ' + groups.size + ' groups so far')

        interaction.mapParticipationsToDepictions()

        // if the depiction is in a backbone, it's the backbone we need to position
        // (we can't move the backbone's children because they are laid out as part of the
        // backbone and don't belong to us)
        let effectiveParticipantDepictions = interaction.getAllIncludedDepictions().map((d) => {
            if(d.parent instanceof BackboneDepiction) {
                return d.parent
            } else {
                return d
            }
        })

        // are any of the depictions in this interaction already in groups?
        //
        let participantGroups:Group[] = []

        for(let participantDepiction of effectiveParticipantDepictions) {

            let existingGroup:Group|undefined = depictionUidToGroup.get(participantDepiction.uid)

            if(existingGroup && participantGroups.indexOf(existingGroup) === -1) {
                participantGroups.push(existingGroup)
            }
        }

        if(participantGroups.length === 0) {

            // None of our participants has a group yet. let's make one and place
            // all of our participants in it.
            //
            let newGroup:Group = new Group()

            for (let participantDepiction of effectiveParticipantDepictions) {
                newGroup.depictions.add(participantDepiction)
                depictionUidToGroup.set(participantDepiction.uid, newGroup)
            }

            newGroup.interactions.add(interaction)

            groups.add(newGroup)

        } else {

            // One or more of our participants already had a group.
            // 1) merge all the groups together (if there are more than one)
            // 2) put all of our participants in it
            //
            let destGroup = participantGroups[0]

            for(let n:number = 1; n < participantGroups.length; ++ n) {

                let otherGroup = participantGroups[n]

                for(let d of otherGroup.depictions)
                    depictionUidToGroup.set(d.uid, destGroup)

                destGroup.mergeFrom(otherGroup)
            }

            destGroup.interactions.add(interaction)

            for (let participantDepiction of effectiveParticipantDepictions) {
                destGroup.depictions.add(participantDepiction)
                depictionUidToGroup.set(participantDepiction.uid, destGroup)
            }
        }

    }


    // finally, there may be depictions that didn't get placed into a group
    // because they weren't involved in any interactions.
    // put each of these into its own group.
    //
    for(let child of children) {

        if(child instanceof InteractionDepiction)
            continue
        if(child instanceof LabelDepiction)
            continue

        let effectiveChild = child

        if(child.parent instanceof BackboneDepiction) {
            effectiveChild = child.parent
        }

        if(depictionUidToGroup.get(effectiveChild.uid) === undefined) {

            console.log('binPackStrategy: ' + child.debugName + ' is orphaned')

            const orphanGroup = new Group()
            orphanGroup.depictions.add(child)
            groups.add(orphanGroup)

            depictionUidToGroup.set(effectiveChild.uid, orphanGroup)

        }

    }

    console.log('binPackStrategy: created ' + groups.size + ' group(s) for ' + (parent ? parent.debugName : '<anonymous>'))

    return Array.from(groups)
}

function horizontallyTileChildrenOfGroups(parent:Depiction|null, groups:Group[], padding:number) {

    for(let group of groups) {

        // horizontal tile
        //
        var offset = Vec2.fromXY(0, 0)

        var maxHeight = -99999
        var maxWidth = -99999

        for(let child of group.depictions) {

            if(child instanceof LabelDepiction)
                continue // (shouldn't be in the group anyway)

            let label = child.label

            if(child.offsetExplicit) {

                if(label) {
                    if(!label.offsetExplicit) {
                        console.log('explicit child', child.debugName, 'has non-explicit label; positioning at child pos', child.offset)
                        label.offset = child.offset.subtract(Vec2.fromXY(0, label.size.y))
                    } else {
                        console.log('explicit child has explicit label; do nothing to label pos')
                    }
                } else {
                    console.log('child has no label')
                }

            } else {

                console.log('child not explicitly positioned; use tiling offset')

                child.offset = offset

                let widthOfThisD = child.size.x

                if (label) {
                    if(!label.offsetExplicit) {
                        console.log('non-explicit child has non-explicit label; positioning at child offset', offset)
                        label.offset = offset
                        child.offset = child.offset.add(Vec2.fromXY(0, label.size.y))

                        widthOfThisD = Math.max(widthOfThisD, label.size.x)

                        maxWidth = Math.max(maxWidth, label.offset.x + label.size.x)
                        maxHeight = Math.max(maxHeight, label.offset.y + label.size.y)

                    } else {
                        console.log('non-explicit child has explicit label; do nothing to label pos')
                    }
                } else {
                    console.log('non-explicit child has no label')
                }

                offset = offset.add(Vec2.fromXY(widthOfThisD + padding, 0))

                maxWidth = Math.max(maxWidth, child.offset.x + child.size.x)
                maxHeight = Math.max(maxHeight, child.offset.y + child.size.y)
            }
        }

        group.w = maxWidth
        group.h = maxHeight

        console.log('final group w/h after tiling children', group.w, group.h)

        /*
        for(let child of group.depictions) {

            if(!child.offsetExplicit)
                continue

            group.w = Math.max(group.w, child.offset.add(child.size).x)
            group.h = Math.max(group.h, child.offset.add(child.size).y)
        }*/

    }
}


// Make space for the layers of A->B interactions in each group
//
function createABInteractionLayers(parent:Depiction|null, groups:Group[]):Map<InteractionDepiction, number> {

    let takenPoints:Map<Depiction, LinearRangeSet> = new Map() // for horizPoints

    let interactionToLayer:Map<InteractionDepiction, number> = new Map()

    for(let group of groups) {

        for(let interaction of group.interactions) {

            // only interested in simple A->B interactions
            //
            if(! (
                interaction.sourceDepictions.length === 1 &&
                interaction.destDepictions.length === 1 &&
                interaction.otherDepictions.length === 0
            )) {
                console.log('skipping interaction ' + interaction.debugName + ' because I only process simple A->B interactions')
                console.log('this one had ' + interaction.sourceDepictions.length + ' source depiction(s), ' + interaction.destDepictions.length + ' dest depiction(s) and '  + interaction.otherDepictions.length + ' other depiction(s)')
                continue
            }

            let { xA, xB } = horizPoints(parent, takenPoints, interaction.sourceDepictions[0], interaction.destDepictions[0])
            

            // TODO the -1 and a +1 are a hack because we don't have intersectsOrTouchesRange
            const range:LinearRange = new LinearRange(xA - 1, xB + 1)


            var layerDir:number

            if(shouldReverse(interaction)) {
                console.log('placing interaction ' + interaction.debugName + ' below')
                layerDir = 1
            } else {
                console.log('placing interaction ' + interaction.debugName + ' above')
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
        }

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
    }

    return interactionToLayer

    function shouldReverse(interaction:InteractionDepiction) {

        let dOf = interaction.depictionOf
        
        if(dOf instanceof S3Interaction) {
            if(! (dOf.hasType(Specifiers.SBO.GeneticProduction))) {
                return true
            }
        }

        for(let participant of interaction.getAllIncludedDepictions()) {

            if(participant instanceof ComponentDepiction) {
                if(participant.orientation === Orientation.Reverse) {
                    return true
                }
            }

        }

        return false
    }
}

function routeABInteractions(parent:Depiction|null, groups:Group[], interactionToLayer:Map<InteractionDepiction,number>, padding:number) {

    let takenPoints:Map<Depiction, LinearRangeSet> = new Map() // for horizPoints

    for(let group of groups) {

        for(let interaction of group.interactions) {

            // only interested in simple A->B interactions
            //
            if(! (
                interaction.sourceDepictions.length === 1 &&
                interaction.destDepictions.length === 1 &&
                interaction.otherDepictions.length === 0
            )) {
                continue
            }

            interaction.offset = Vec2.fromXY(0, 0) // setWaypoints will update this

            let layerN:number|undefined = interactionToLayer.get(interaction)

            if(layerN === undefined) {
                throw new Error('???')
            }

            let a = interaction.sourceDepictions[0]
            let b = interaction.destDepictions[0]

            let { xA, xB } = horizPoints(parent, takenPoints, a, b)

            if(layerN < 0) {

                let yA = a.getBoundingBoxWithLabelRelativeTo(parent).topLeft.y - INTERACTION_OFFSET
                let yB = b.getBoundingBoxWithLabelRelativeTo(parent).topLeft.y - INTERACTION_OFFSET

                let yTop = Math.min(
                    yA - INTERACTION_HEIGHT * (- layerN),
                    yB - INTERACTION_HEIGHT * (- layerN)
                )

                interaction.setWaypoints([
                    Vec2.fromXY(xA, yA),
                    Vec2.fromXY(xA, yTop),
                    Vec2.fromXY(xB, yTop),
                    Vec2.fromXY(xB, yB),
                ])

            } else {


                let yA = a.getBoundingBoxWithLabelRelativeTo(parent).bottomRight.y + INTERACTION_OFFSET
                let yB = b.getBoundingBoxWithLabelRelativeTo(parent).bottomRight.y + INTERACTION_OFFSET

                let yBottom = group.h - INTERACTION_OFFSET - (group.numInteractionsBelow * INTERACTION_HEIGHT) + (layerN * INTERACTION_HEIGHT)

                interaction.setWaypoints([
                    Vec2.fromXY(xA, yA),
                    Vec2.fromXY(xA, yBottom),
                    Vec2.fromXY(xB, yBottom),
                    Vec2.fromXY(xB, yB)
                ])


            }
        }
    }

}

function horizPoints(parent:Depiction|null, takenPoints:Map<Depiction, LinearRangeSet>, a:Depiction, b:Depiction) {

    let takenA = takenPoints.get(a)

    if(!takenA) {
        takenA = new LinearRangeSet()
        takenPoints.set(a, takenA)
    }

    let takenB = takenPoints.get(b)

    if(!takenB) {
        takenB = new LinearRangeSet()
        takenPoints.set(b, takenA)
    }

    let bboxA = a.getBoundingBoxWithLabelRelativeTo(parent)
    let bboxB = b.getBoundingBoxWithLabelRelativeTo(parent)

    var xA, xB

    if (bboxA.center().x > bboxB.center().x) {

        // A right of B

        if(a.opacity === Opacity.Blackbox) {
            xA = bboxA.topLeft.x + (bboxA.width() / 2)
        } else {
            xA = bboxA.topLeft.x + (bboxA.width() / 4) * 1
        }

        if(b.opacity === Opacity.Blackbox) {
            xB = bboxB.topLeft.x + (bboxB.width() / 2)
        } else {
            xB = bboxB.topLeft.x + (bboxB.width() / 4) * 3
        }

        /*
        while(takenA.intersectsRange(new LinearRange(xA - 0.5, xA + 0.5))) {
            ++ xA
        }
        */

        while(takenB.intersectsRange(new LinearRange(xB - 0.5, xB + 0.5))) {
            -- xB
        }

    } else {

        // A left of B

        if(a.opacity === Opacity.Blackbox) {
            xA = bboxA.topLeft.x + (bboxA.width() / 2)
        } else {
            xA = bboxA.topLeft.x + (bboxA.width() / 4) * 3
        }

        if(b.opacity === Opacity.Blackbox) {
            xB = bboxB.topLeft.x + (bboxB.width() / 2)
        } else {
            xB = bboxB.topLeft.x + (bboxB.width() / 4) * 1
        }

        /*
        while(takenA.intersectsRange(new LinearRange(xA - 0.5, xA + 0.5))) {
            -- xA
        }
        */

        while(takenB.intersectsRange(new LinearRange(xB - 0.5, xB + 0.5))) {
            ++ xB
        }
    }

    takenA.push(new LinearRange(xA - 0.5, xA + 0.5))
    takenB.push(new LinearRange(xB - 0.5, xB + 0.5))

    return { xA, xB }
}

