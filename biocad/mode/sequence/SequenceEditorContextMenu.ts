
import { Vec2 } from '@biocad/jfw/geom';

import { ContextMenu, ContextMenuItem } from '@biocad/jfw/ui';

import SequenceEditor from './SequenceEditor'

import BiocadApp from '../../BiocadApp'
import SequenceEditorOverlay from "biocad/mode/sequence/SequenceEditorOverlay";

import CreateAnnotationDialog from './CreateAnnotationDialog'
import { S3Sequence, S3Component } from "sbolgraph"
import { Specifiers } from "bioterms";

//import clipboad = require('clipboard-polyfill')

export default class SequenceEditorContextMenu extends ContextMenu {

    overlay:SequenceEditorOverlay

    constructor(overlay:SequenceEditorOverlay, pos:Vec2) {

        const sequenceEditor:SequenceEditor = overlay.sequenceEditor
        const component:S3Component|null = sequenceEditor.component
        const sequence:S3Sequence|null = sequenceEditor.sequence

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
                    component:S3Component,
                    sequence: sequence,
                    annoStart: overlay.selectionStart,
                    annoEnd: overlay.selectionEnd
                }))*/

                if(overlay.selectionStart === null || overlay.selectionEnd === null || S3Component === null)
                    throw new Error('???')

                component.createFeatureWithRange(overlay.selectionStart + 1, overlay.selectionEnd, 'Untitled Feature')


                app.closeContextMenu()


            }))

            items.push(new ContextMenuItem('span.fa.fa-copy', 'Copy', (pos: Vec2) => {

                let elements = sequenceEditor.getSelectionElements() || ''

                //clipboad.writeText(elements)

                app.closeContextMenu()

            }))

        }

        items.push(new ContextMenuItem('span.fa.fa-paste', 'Paste', async (pos: Vec2) => {

            //let str = await clipboad.readText()

            let str = ''

            let caretPos = sequenceEditor.getCaretPos()
            let sequence = sequenceEditor.sequence

            if(caretPos !== null && sequence) {
                let elements = sequence.elements
                if(!elements) {
                    sequence.elements = str
                } else {
                    sequence.elements = [
                        elements.substring(0, caretPos),
                        str,
                        elements.substring(caretPos)
                    ].join('')
                    sequenceEditor.update()
                }
            }

            app.closeContextMenu()

        }))


        super(pos, items)

    }

}

