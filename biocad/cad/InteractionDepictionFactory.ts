
import InteractionDepiction from "./ABInteractionDepiction";
import ABInteractionDepiction from "./ABInteractionDepiction";
import Layout from "biocad/cad/Layout";
import { SXInteraction } from "sbolgraph"
import Depiction from "biocad/cad/Depiction";
import IdentifiedChain from "../IdentifiedChain";

export default class InteractionDepictionFactory {

    static fromInteraction(layout:Layout, interaction:SXInteraction, chain:IdentifiedChain, parent?:Depiction):InteractionDepiction|null {

        if(interaction.participations.length === 2) {

            return new ABInteractionDepiction(layout, interaction, chain, parent)

        }

        if(interaction.participations.length === 3) {


        }

            
        console.error('dont understand this interaction; it has ' + interaction.participations.length + ' participations')
        console.error(interaction.uri)

        return null
    }

}