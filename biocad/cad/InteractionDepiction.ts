

import Depiction from "biocad/cad/Depiction";
import Layout from "biocad/cad/Layout";
import { svg, VNode } from "jfw/vdom";
import { SXInteraction, SXParticipation, SXSubComponent } from "sbolgraph";
import { Specifiers } from 'bioterms'
import { assert } from 'power-assert'
import { Vec2, Rect } from "jfw/geom";
import RenderContext from './RenderContext'
import IdentifiedChain from 'biocad/IdentifiedChain';
import drawArrow, { ArrowheadType } from '../util/drawArrow';
import drawDegradationBin from "./drawDegradationBin";

export default class InteractionDepiction extends Depiction {

    participantDepictions:Array<Depiction>
    ambiguousDirection:boolean

    private waypoints:Vec2[]


    constructor(layout:Layout, depictionOf:SXInteraction, identifiedChain:IdentifiedChain, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)
        
        this.waypoints = []

    }

    mapParticipationsToDepictions() {

        this.participantDepictions = []

        let interaction = this.depictionOf

        if(! (interaction instanceof SXInteraction)) {
            throw new Error('no interaction dOf?')
        }

        let numParticipants = interaction.participants.length

        if(numParticipants === 2) {

            // AB interaction

            const participations:Array<SXParticipation> = interaction.participations

            let a:SXParticipation = participations[0]
            let b:SXParticipation = participations[1]

            for(var i = 0 ;; ++ i) {

                //console.log('a roles ' + a.roles)
                //console.log('b roles ' + b.roles)

                if (a.hasRole(Specifiers.SBO.Inhibitor) && b.hasRole(Specifiers.SBO.Inhibited)) {
                    break
                } else if (a.hasRole(Specifiers.SBO.Stimulator) && b.hasRole(Specifiers.SBO.Stimulated)) {
                    break
                } else if (a.hasRole(Specifiers.SBO.Inhibitor) && b.hasRole(Specifiers.SBO.Promoter)) {
                    break
                } else if (a.hasRole(Specifiers.SBO.Stimulator) && b.hasRole(Specifiers.SBO.Promoter)) {
                    break
                } else if (b.hasRole(Specifiers.SBO.Product)) {
                    break
                }

                if(i == 2) {
                    console.warn('cant map participation roles to anything i can work with')
                    this.ambiguousDirection = true
                    break
                }

                // try the other way around
                //
                let tmp:SXParticipation = b
                b = a
                a = tmp
            }

            const participantA:SXSubComponent|undefined = a.participant
            const participantB:SXSubComponent|undefined = b.participant

            if(participantA === undefined || participantB === undefined) {
                throw new Error('missing participant??')
            }

            if(participantA.uri === participantB.uri) {
                throw new Error('participants are the same thing? ' + participantA.uri)
            }

            const depictionA:Depiction|undefined = this.layout.getDepictionsForUri(participantA.uri)[0]
            const depictionB:Depiction|undefined = this.layout.getDepictionsForUri(participantB.uri)[0]
            
            if(depictionA === undefined) {
                throw new Error('missing depiction: ' + a.uri)
            }

            if(depictionB === undefined) {
                throw new Error('missing depiction: ' + b.uri)
            }

            this.participantDepictions = [ depictionA, depictionB ]

        } else if(numParticipants === 1) {

            const participations:Array<SXParticipation> = interaction.participations

            let a:SXParticipation = participations[0]

            const participantA:SXSubComponent|undefined = a.participant

            if(participantA === undefined) {
                throw new Error('missing participant??')
            }

            const depictionA:Depiction|undefined = this.layout.getDepictionsForUri(participantA.uri)[0]

            if(depictionA === undefined) {
                throw new Error('missing depiction: ' + a.uri)
            }

            this.participantDepictions = [ depictionA ]

        } else {

            console.warn('cannot render this number of participants: ' + interaction.participants.length)

        }

    }



    render(renderContext:RenderContext):VNode {

        let absOffset = this.absoluteOffset

        if(this.participantDepictions.length === 2) {

            if(this.waypoints.length === 0) {
                return svg('g')
            }

            var arrowhead = ArrowheadType.None

            if(!this.ambiguousDirection) {
                let dOf = this.depictionOf

                if(dOf instanceof SXInteraction) {

                    let types = dOf.types

                    if(types.indexOf(Specifiers.SBO.Inhibition) !== -1) {
                        arrowhead = ArrowheadType.Line
                    } else if(types.indexOf(Specifiers.SBO.Stimulation) !== -1) {
                        arrowhead = ArrowheadType.Fork
                    }
                }
            }

            var color = 'green'

            return svg('g', [

                drawArrow(this.waypoints.map((waypoint) => {
                    return waypoint.add(absOffset).multiply(this.layout.gridSize)
                }), arrowhead, color, '2px')

            ])

        } else if(this.participantDepictions.length === 1) {

            if(this.waypoints.length !== 2) {
                return svg('g')
            }

            let dOf = this.depictionOf

            if(!dOf || !(dOf instanceof SXInteraction)) {
                return svg('g')
            }

            if(dOf.hasType('http://identifiers.org/biomodels.sbo/SBO:0000179') /* degradation */) {

                var color = 'red'

                let binPos = this.waypoints[this.waypoints.length - 1]
                let binRect = Rect.fromPosAndSize(binPos, Vec2.fromXY(0, 0)).expand(5)

                return svg('g', [

                    drawArrow(this.waypoints.map((waypoint) => {
                        return waypoint.add(absOffset).multiply(this.layout.gridSize)
                    }), ArrowheadType.Fork, color, '2px'),

                    drawDegradationBin(binRect.multiply(this.layout.gridSize), '2px', color)
                ])
            }
        }

        return svg('g')
    }

    renderThumb(size:Vec2):VNode {

        return svg('g')

    }

    setWaypoints(waypoints:Vec2[]) {

        let bbox = Rect.surroundingPoints(waypoints)

        this.offset = bbox.topLeft
        this.size = bbox.size()

        this.waypoints = waypoints.map((waypoint) => {
            return waypoint.subtract(this.offset)
        })

    }

}








