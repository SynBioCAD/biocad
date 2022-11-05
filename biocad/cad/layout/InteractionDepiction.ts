

import Depiction from "biocad/cad/layout/Depiction";
import Layout from "biocad/cad/layout/Layout";
import { svg, VNode } from "@biocad/jfw/vdom";
import { S3Interaction, S3Participation, S3SubComponent } from "sboljs";
import { Specifiers, Prefixes } from 'bioterms'
import { Vec2, Rect } from "@biocad/jfw/geom";
import RenderContext from '../RenderContext'
import IdentifiedChain from 'biocad/IdentifiedChain';
import drawArrow, { ArrowheadType } from '../../util/drawArrow';
import separateInteractionParticipations from '../../util/separateInteractionParticipations'
import drawDegradationBin from "../drawDegradationBin";

export default class InteractionDepiction extends Depiction {

    sourceDepictions:Array<Depiction>
    destDepictions:Array<Depiction>
    otherDepictions:Array<Depiction>

    ambiguousDirection:boolean

    waypoints:Vec2[]


    constructor(layout:Layout, depictionOf:S3Interaction, identifiedChain:IdentifiedChain, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)
        
        this.waypoints = []

    }

    mapParticipationsToDepictions() {

        let layout = this.layout

        let interaction = this.depictionOf

        if(! (interaction instanceof S3Interaction)) {
            throw new Error('no interaction dOf?')
        }

        let separatedParticipants = separateInteractionParticipations(interaction)

        this.sourceDepictions = separatedParticipants.sources.map(participationToDepiction)
        this.destDepictions = separatedParticipants.destinations.map(participationToDepiction)
        this.otherDepictions = separatedParticipants.others.map(participationToDepiction)

        function participationToDepiction(participation) {
            let depiction:Depiction|undefined = layout.getDepictionsForUri(participation.participant.uri)[0]
            if(!depiction) {
                throw new Error('missing depiction')
            }
            return depiction
        }
    }

    getAllIncludedDepictions():Depiction[] {
        return this.sourceDepictions.concat(this.destDepictions).concat(this.otherDepictions)

    }



    render(renderContext:RenderContext):VNode {

        let absOffset = this.absoluteOffset

        if(this.sourceDepictions.length === 0 && this.destDepictions.length === 0 && this.otherDepictions.length === 1) {

            if(this.waypoints.length !== 2) {
                return svg('g')
            }

            let dOf = this.depictionOf

            if(!dOf || !(dOf instanceof S3Interaction)) {
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

        } else {

            if(this.waypoints.length === 0) {
                return svg('g')
            }

            var arrowhead = ArrowheadType.None

            if(!this.ambiguousDirection) {
                let dOf = this.depictionOf

                if(dOf instanceof S3Interaction) {

                    let types = dOf.types

                    if(types.indexOf(Specifiers.SBO.Inhibition) !== -1) {
                        arrowhead = ArrowheadType.Line
                    } else if(types.indexOf(Specifiers.SBO.Stimulation) !== -1) {
                        arrowhead = ArrowheadType.Fork
                    } else if(types.indexOf(Specifiers.SBO.Control) !== -1) {
                        arrowhead = ArrowheadType.Diamond
                    } else if(types.indexOf(Specifiers.SBO.GeneticProduction) !== -1) {
                        arrowhead = ArrowheadType.FilledTriangle
                    } else if(types.indexOf(Prefixes.sbo + 'SBO:0000183') !== -1) { // transcription
                        arrowhead = ArrowheadType.FilledTriangle
                    } else if(types.indexOf(Prefixes.sbo + 'SBO:0000184') !== -1) { // translation
                        arrowhead = ArrowheadType.FilledTriangle
                    }
                }
            }

            var color = 'green'

            return svg('g', [

                drawArrow(this.waypoints.map((waypoint) => {
                    return waypoint.add(absOffset).multiply(this.layout.gridSize)
                }), arrowhead, color, '2px')

            ])

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








