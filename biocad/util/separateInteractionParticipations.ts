
import { S3Interaction, S3Participation } from "sboljs";
import { Prefixes, Specifiers } from "bioterms";

export interface SeparateResult {
    sources:S3Participation[]
    destinations:S3Participation[]
    others:S3Participation[]
}

let sourceRoles = [
    Specifiers.SBO.Inhibitor,
    Specifiers.SBO.Stimulator,
    Specifiers.SBO.Modifier,
    Prefixes.sbo + 'SBO:0000645', // template
    Specifiers.SBO.Control
]

let destRoles = [
    Specifiers.SBO.Inhibited,
    Specifiers.SBO.Stimulated,
    Specifiers.SBO.Promoter,
    Specifiers.SBO.Product,
    Prefixes.sbo + 'SBO:0000644', // modified
]

export default function separateInteractionParticipations(interaction:S3Interaction):SeparateResult {

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

        console.warn('unknown participation role: ' + roles)
        result.others.push(participation)
    }

    return result

}