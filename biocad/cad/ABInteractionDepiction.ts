

import InteractionDepiction from './InteractionDepiction'
import Depiction from "biocad/cad/Depiction";
import Layout from "biocad/cad/Layout";
import { svg, VNode } from "jfw/vdom";
import { SXInteraction, SXParticipation, SXSubComponent } from "sbolgraph";
import { Specifiers } from 'bioterms'
import { assert } from 'power-assert'
import Vec2 from "jfw/geom/Vec2";
import RenderContext from './RenderContext'
import IdentifiedChain from 'biocad/IdentifiedChain';
import drawArrow, { ArrowheadType } from '../util/drawArrow';

export default class ABInteractionDepiction extends InteractionDepiction {

    a:Depiction
    b:Depiction

    private waypoints:Vec2[]


    constructor(layout:Layout, depictionOf:SXInteraction, identifiedChain:IdentifiedChain, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)
        
        this.waypoints = []

        if(depictionOf.participants.length !== 2) {
            throw new Error('Need exactly two participants for ABInteractionDepiction')
        }

        const { a, b } = this.mapParticipationsToDepictions(depictionOf)

        this.a = a
        this.b = b


    }

    private mapParticipationsToDepictions(interaction:SXInteraction):{ a:Depiction, b:Depiction } {

        if(interaction.participants.length !== 2) {
            throw new Error('Need exactly two participants for ABInteractionDepiction')
        }

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
                throw new Error('cant map participation roles to anything i can work with')
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

        return { a: depictionA, b: depictionB }
    }



    render(renderContext:RenderContext):VNode {

        let absOffset = this.absoluteOffset

        var arrowhead = ArrowheadType.Fork
        var color = 'green'

        /*
        if(this.depictionOf) {

            let interaction = this.depictionOf as SXInteraction

            if(interaction.hasType(Specifiers.SBO.Inhibition)) {
                arrowhead = 'url(#sfRepressionArrowhead)'
                color = 'red'
            } else if(interaction.hasType(Specifiers.SBO.Stimulation)) {
                arrowhead = 'url(#sfInductionArrowhead)'
                color = 'green'
            } else if(interaction.hasType(Specifiers.SBO.GeneticProduction)) {
                arrowhead = 'url(#sfProductionArrowhead)'
                color = 'green'
            }
        }
*/
        return drawArrow(this.waypoints.map((waypoint) => {
            return waypoint.add(absOffset).multiply(this.layout.gridSize)
        }), arrowhead, color, '2px')
    }

    renderThumb(size:Vec2):VNode {

        return svg('g')

    }

    setWaypoints(waypoints:Vec2[]) {

        this.waypoints = waypoints

    }

}






