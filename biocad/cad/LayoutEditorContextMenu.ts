import  LayoutEditor  from 'biocad/cad/LayoutEditor';
import { Specifiers } from 'bioterms';
import { SBOLXCompliantURIs, SXComponent } from "sbolgraph"
import { Predicates, Types } from 'bioterms';
import BiocadApp from 'biocad/BiocadApp';

import { Vec2, Matrix } from 'jfw/geom';

import ContextMenu, { ContextMenuItem } from 'jfw/ui/ContextMenu';

import { node as graphNode } from "sbolgraph"
import { SBOLXGraph } from "sbolgraph"
import Depiction, { Opacity } from "biocad/cad/Depiction";

import SequenceMode from 'biocad/mode/sequence/SequenceMode'
import ComponentDepiction from 'biocad/cad/ComponentDepiction';

export default class LayoutEditorContextMenu extends ContextMenu {

    constructor(layoutEditor:LayoutEditor, pos:Vec2, depictions:Depiction[]) {

        const app:BiocadApp = layoutEditor.app as BiocadApp

        const items:ContextMenuItem[] = []

        items.push(new ContextMenuItem('span.fa.fa-undo', 'Undo', (pos:Vec2) => {

            layoutEditor.popUndoLevel()

            app.closeContextMenu()


        }))


        if(depictions.length === 0) {

        } else if(depictions.length === 1) {

            let depiction = depictions[0]

            items.push(new ContextMenuItem('span.fa.fa-align-justify', 'Edit Sequence', (pos:Vec2) => {

                const seqMode:SequenceMode = app.modes.filter((mode) => mode instanceof SequenceMode)[0] as SequenceMode

                const dOf = depiction.depictionOf

                if(dOf instanceof SXComponent) {
                    seqMode.seqView.sequenceEditor.setComponent(dOf)
                    app.setMode(seqMode)
                }

                app.closeContextMenu()


            }))


            if(depiction.opacity === Opacity.Blackbox) {

                items.push(new ContextMenuItem('span.fa.fa-eye', 'Show Subcomponents', (pos:Vec2) => {

                    depiction.opacity = Opacity.Whitebox
                    depiction.touchRecursive()


                    app.closeContextMenu()


                }))

            } else {

                items.push(new ContextMenuItem('span.fa.fa-eye-slash', 'Hide Subcomponents', (pos:Vec2) => {

                    depiction.opacity = Opacity.Blackbox
                    depiction.touchRecursive()


                    app.closeContextMenu()


                }))

            }

            items.push(new ContextMenuItem('span.fa.fa-link', 'Create Interaction', (pos:Vec2) => {

                layoutEditor.overlay.proposingConnectionFrom = depiction
                layoutEditor.overlay.update()

                app.closeContextMenu()

            }))


        } else {
            
            // selection

            items.push(new ContextMenuItem('span.fa.fa-object-group', 'Group as Module', (pos:Vec2) => {

                layoutEditor.deselectAll()

                let roots = depictions.filter((depiction) => {
                    for(let otherDepiction of depictions) {
                        if(depiction !== otherDepiction && depiction.isDescendentOf(otherDepiction)) {
                            return false
                        }
                    }
                    return true
                })

                let dOf = roots.map((d) => {
                    return d.depictionOf
                }).filter((dOf) => {
                    return dOf && dOf instanceof SXComponent
                }).map((dOf) => {
                    return dOf as SXComponent
                })

                if(dOf.length > 0) {

                    let wrapper = dOf[0].wrap()

                    for(let i = 1; i < dOf.length; ++ i) {
                        wrapper.createSubComponent(dOf[i])
                    }

                    layoutEditor.layout.syncAllDepictions(5)

                    let bbox = roots[0].boundingBox

                    for(let i = 1; i < roots.length; ++ i) {
                        bbox = bbox.surround(roots[i].boundingBox)
                    }

                    let dInNewLayout = layoutEditor.layout.getDepictionsForUri(wrapper.uri)[0]
                    dInNewLayout.offsetExplicit = true
                    dInNewLayout.offset = bbox.topLeft

                    layoutEditor.layout.configurate([])

                }

                app.closeContextMenu()

            }))

        }
        
        super(pos, items)

    }

}
