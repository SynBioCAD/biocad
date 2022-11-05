
import { View } from '@biocad/jfw/ui'
import { h, VNode } from '@biocad/jfw/vdom'
import SequenceEditor from "biocad/mode/sequence/SequenceEditor";

export default class SequenceEditorToolbar extends View {

    sequenceEditor: SequenceEditor

    constructor(sequenceEditor) {

        super(sequenceEditor.project)

        this.sequenceEditor = sequenceEditor

    }

    render() {

        var elements:Array<VNode> = []

        if(this.sequenceEditor.showTopToolbar) {
            elements.push(this.renderTop())
        }

        if(this.sequenceEditor.showBottomToolbar) {
            elements.push(this.renderBottom())
        }

        return h('div.sf-sequence-view-toolbar', elements)

    }

    renderTop() {

        return h('div.sf-sequence-view-toolbar-top', {
            style: {
                color: this.sequenceEditor.darkMode ? 'white' : 'black'
            }
        }, 'top')

    }

    renderBottom() {

        const caretPos = this.sequenceEditor.getCaretPos()
        const hoverCaretPos = this.sequenceEditor.getHoverPos()
        const selection = this.sequenceEditor.getSelection()

        const elements:VNode[] = []

        if(hoverCaretPos !== null) {
            elements.push(h('div', 'Cursor: ' + hoverCaretPos + '..' + (hoverCaretPos + 1)))
        }

        if(caretPos !== null) {
            elements.push(h('div', 'Insert: ' + caretPos + '..' + (caretPos + 1)))
        }

        if(selection !== null) {

            var selectionStr = 'Selected: ' + selection.start + '..' + selection.end

            if(selection.end < selection.start)
                selectionStr += ' (reverse complement)'

            elements.push(h('div', selectionStr))
        }
        
        return h('div.sf-sequence-view-toolbar-bottom', {
            style: {
                color: this.sequenceEditor.darkMode ? 'white' : 'black',
                'background-color': this.sequenceEditor.darkMode ? 'black' : 'white',
            }
        }, elements)

    }
}

