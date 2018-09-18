
import { Vec2 } from 'jfw/geom';

import ContextMenu, { ContextMenuItem } from 'jfw/ui/ContextMenu';

import SequenceEditor from './SequenceEditor'

import BiocadApp from '../../BiocadApp'
import SequenceEditorOverlay from "biocad/mode/sequence/SequenceEditorOverlay";

import CreateAnnotationDialog from './CreateAnnotationDialog'
import { SXSequence, SXComponent } from "sbolgraph"
import { Specifiers } from "bioterms";

export default class SequenceEditorContextMenu extends ContextMenu {

    overlay:SequenceEditorOverlay

    constructor(overlay:SequenceEditorOverlay, pos:Vec2) {

        const sequenceEditor:SequenceEditor = overlay.sequenceEditor
        const component:SXComponent|null = sequenceEditor.component
        const sequence:SXSequence|null = sequenceEditor.sequence

        if(component === null)
            throw new Error('???')

        const app:BiocadApp = overlay.app as BiocadApp

        const items:ContextMenuItem[] = []

        items.push(new ContextMenuItem('span.fa.fa-undo', 'Undo', (pos:Vec2) => {

            //sequenceEditor.popUndoLevel()

            app.closeContextMenu()


        }))

        if(sequence !== null && overlay.selectionStart && overlay.selectionEnd) {

            const numBp:number = Math.abs(
                overlay.selectionEnd - overlay.selectionStart
            )

            var units:string = ''

            if(sequence.encoding === Specifiers.SBOL2.SequenceEncoding.NucleicAcid) {
                units = ' bp'
            } else if(sequence.encoding === Specifiers.SBOL2.SequenceEncoding.AminoAcid) {
                units = ' aa'
            }

            items.push(new ContextMenuItem('span.fa.fa-undo', 'Annotate ' + numBp + units, (pos: Vec2) => {

                //sequenceEditor.popUndoLevel()

                /*
                app.openDialog(new CreateAnnotationDialog(app, {
                    component:SXComponent,
                    sequence: sequence,
                    annoStart: overlay.selectionStart,
                    annoEnd: overlay.selectionEnd
                }))*/

                if(overlay.selectionStart === null || overlay.selectionEnd === null || SXComponent === null)
                    throw new Error('???')

                component.createFeatureWithRange(overlay.selectionStart + 1, overlay.selectionEnd, 'Untitled Feature')


                app.closeContextMenu()


            }))



        }


        super(pos, items)

    }

}

