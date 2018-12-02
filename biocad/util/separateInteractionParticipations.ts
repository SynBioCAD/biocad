
import { SXInteraction, SXParticipation } from "sbolgraph";
import { Prefixes, Specifiers } from "bioterms";

export interface SeparateResult {
    sources:SXParticipation[]
    destinations:SXParticipation[]
    others:SXParticipation[]
}

let sourceRoles = [
    Specifiers.SBO.Inhibitor,
    Specifiers.SBO.Stimulator,
    Specifiers.SBO.Modifier,
    Prefixes.sbo + 'SBO:0000645' // template
]

let destRoles = [
    Specifiers.SBO.Inhibited,
    Specifiers.SBO.Stimulated,
    Specifiers.SBO.Promoter,
    Specifiers.SBO.Product
]

export default function separateInteractionParticipations(interaction:SXInteraction):SeparateResult {

    let types = interaction.types

    let result:SeparateResult = { sources: [], destinations: [], others: [] }

    for(let participation of interaction.participations) {

        let roles = participation.roles

        let done = false

        for(let role of roles) {
            for(let srcRole of sourceRoles) {
                if(role === srcRole) {
                    result.sources.push(participation)
                    done = true
                    break
                }
            }
            if(done)
                break
        }

        if(done)
            continue

        for(let role of roles) {
            for(let destRole of destRoles) {
                if(role === destRole) {
                    result.destinations.push(participation)
                    done = true
                    break
                }
            }
            if(done)
                break
        }

        if(done)
            continue

        result.others.push(participation)
    }

    return result

}