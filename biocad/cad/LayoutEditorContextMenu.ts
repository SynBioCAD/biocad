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

    constructor(layoutEditor:LayoutEditor, pos:Vec2, depiction:Depiction|null) {

        const app:BiocadApp = layoutEditor.app as BiocadApp

        const items:ContextMenuItem[] = []

        items.push(new ContextMenuItem('span.fa.fa-undo', 'Undo', (pos:Vec2) => {

            layoutEditor.popUndoLevel()

            app.closeContextMenu()


        }))

        if(depiction !== null) {

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

                layoutEditor.startCreatingInteraction(depiction)

                app.closeContextMenu()

            }))


        }
        
        super(pos, items)

    }

}

