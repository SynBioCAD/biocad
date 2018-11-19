import Depiction from "./Depiction";
import { Specifiers } from "bioterms";
import { SXComponent, SXSubComponent, SXInteraction } from "sbolgraph";
import LayoutEditor from "./LayoutEditor";

export default function createInteraction(layoutEditor:LayoutEditor, from:Depiction, to:Depiction) {

    let fOf = from.depictionOf
    let tOf = to.depictionOf
    let id = 'someinteraction'
    let type = Specifiers.SBO.Stimulation
    let ourrole = Specifiers.SBO.Stimulator
    let theirrole = Specifiers.SBO.Stimulated
    let interaction:SXInteraction|null = null
    let wrapper:SXComponent|null = null

    if(fOf instanceof SXComponent) {
        if(tOf instanceof SXComponent) {
            // from component to component
            wrapper = fOf.wrap('untitled')
            wrapper.setBoolProperty('http://biocad.io/terms/untitled', true)
            wrapper.createSubComponent(tOf)
            let scA = wrapper.subComponents[0]
            let scB = wrapper.subComponents[1]
            interaction = scA.createInteractionWith(scB, id, type, ourrole, theirrole)
        } else if(tOf instanceof SXSubComponent) {
            // from component to subcomponent
            let scA = tOf.containingComponent.createSubComponent(fOf)
            interaction = scA.createInteractionWith(tOf, id, type, ourrole, theirrole)
        } else {
            throw new Error('???')
        }
    } else if(fOf instanceof SXSubComponent) {
        if(tOf instanceof SXComponent) {
            // from subcomponent to component
            let scB = fOf.containingComponent.createSubComponent(tOf)
            interaction = fOf.createInteractionWith(scB, id, type, ourrole, theirrole)
        } else if(tOf instanceof SXSubComponent) {
            // from subcomponent to subcomponent
            if(tOf.containingComponent.uri === fOf.containingComponent.uri) {
                interaction = fOf.createInteractionWith(tOf,id, type, ourrole, theirrole)
            }
        } else {
            throw new Error('???')
        }
    } else {
        throw new Error('???')
    }

    layoutEditor.deselectAll()

    if(interaction) {
        layoutEditor.layout.syncAllDepictions(5)

        if(wrapper) {
            let wrapperD = layoutEditor.layout.getDepictionsForUri(wrapper.uri)[0]

            if(!wrapperD) {
                throw new Error('???')
            }

            wrapperD.offsetExplicit = from.offsetExplicit
            wrapperD.offset = from.offset
        }
        layoutEditor.layout.configurate([])
    }

}
