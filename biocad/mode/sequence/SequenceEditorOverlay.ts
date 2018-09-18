
import { h, svg, VNode } from 'jfw/vdom'

import extend = require('xtend')

import { Vec2, Rect, LinearRange } from 'jfw/geom'

import { View } from 'jfw/ui'

import { mousemove as mousemoveEvent, click as clickEvent, contextMenu as contextMenuEvent } from 'jfw/event'

import SequenceEditor from './SequenceEditor'
import SequenceEditorContextMenu from './SequenceEditorContextMenu'

import KeyboardListener from 'jfw/util/KeyboardListener'
import { SXSequence, SXThingWithLocation } from "sbolgraph"
import { Specifiers } from "bioterms";
import SequenceEditorLine from "biocad/mode/sequence/SequenceEditorLine";

/* used as a subtree
 */
export default class SequenceEditorOverlay extends View {

    sequenceEditor: SequenceEditor

    mousePos:Vec2|null
    hoverCaretPos:number|null
    caretPos:number|null
    selecting:boolean
    selectionFinalized:boolean
    selectionStart:number|null
    selectionEnd:number|null

    constructor(sequenceEditor:SequenceEditor) {

        super(sequenceEditor.app)

        this.sequenceEditor = sequenceEditor

        this.mousePos = null
        this.hoverCaretPos = null
        this.caretPos = null
        this.selecting = false
        this.selectionFinalized = false
        this.selectionStart = null
        this.selectionEnd = null

        // TODO unlisten
        KeyboardListener.listen('seqEqOverlay', (ev:KeyboardEvent) => {
            this.onKeyboardEvent(ev)
        })

    }

    onKeyboardEvent(ev:KeyboardEvent) {

        if(this.caretPos === null)
            return

        if(!ev.key)
            return

        const seq:SXSequence|null = this.sequenceEditor.sequence

        if(seq === null)
            throw new Error('???')

        if(ev.key === 'Backspace') {

            seq.graph.startIgnoringWatchers()
            seq.deleteFragment(this.caretPos - 1, 1)
            seq.graph.stopIgnoringWatchers()

            this.caretPos = Math.max(this.caretPos - 1, 0)

            this.sequenceEditor.body.update()
            this.update()

            return
        }

        if(ev.key === 'ArrowLeft') {

            this.caretPos = Math.max(this.caretPos - 1, 0)

            this.update()

            return
        }

        if(ev.key === 'ArrowRight') {

            this.caretPos = this.caretPos + 1

            this.update()

            return
        }

        var ch:string = ''

        if(seq.encoding === Specifiers.SBOL2.SequenceEncoding.NucleicAcid) {

            switch(ev.key) {

                case 'a':
                case 'A':
                    ch = 'a'
                    break

                case 't':
                case 'T':
                    ch = 't'
                    break

                case 'c':
                case 'C':
                    ch = 'c'
                    break

                case 'g':
                case 'G':
                    ch = 'g'
                    break

                default:
                    console.log('ignoring key ' + ev.key)
                    return
            }

        }

        seq.graph.startIgnoringWatchers()
        seq.insertFragment(this.caretPos, ch)
        seq.graph.stopIgnoringWatchers()

        ++ this.caretPos

        this.sequenceEditor.body.update()
        this.update()

    }

    render() {

        const renderState = this.sequenceEditor.currentRenderState

        const {
            charSize,
            marginWidth,
            paddingTop,
            charsPerRow,
            allLinesBBox
        } = renderState

        const svgElements:VNode[] = []

        var hoverCaretDisplayPos:Rect|undefined
        
        if(this.hoverCaretPos !== null) {

            hoverCaretDisplayPos = renderState.elementOffsetToRect(this.hoverCaretPos, true)

        } else {

            if(this.mousePos !== null)
                hoverCaretDisplayPos = Rect.fromPosAndSize(this.mousePos, Vec2.fromXY(renderState.charSize, renderState.charSize + renderState.paddingBetweenLines))

        }

        if(hoverCaretDisplayPos !== undefined) {
            svgElements.push(
                svg('path', {
                    d: caretPath(hoverCaretDisplayPos.topLeft, hoverCaretDisplayPos.topLeft.add(Vec2.fromXY(0, hoverCaretDisplayPos.height() - renderState.paddingBetweenLines))),
                    stroke: this.sequenceEditor.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.4)',
                    'stroke-width': '2px',
                    'stroke-dasharray': '1, 1'
                })
            )
        }

        if(this.caretPos !== null) {

            const caretDisplayPos:Rect = renderState.elementOffsetToRect(this.caretPos, true)

            svgElements.push(
                svg('path', {
                    'class': 'sf-caret',
                    d: caretPath(caretDisplayPos.topLeft, caretDisplayPos.topLeft.add(Vec2.fromXY(0, caretDisplayPos.height() - renderState.paddingBetweenLines))),
                    stroke: this.sequenceEditor.darkMode ? 'white' : 'black',
                    'stroke-width': '2px'
                })
            )

        }

        Array.prototype.push.apply(svgElements, this._renderSelection())

        svgElements.push(
            svg('rect', {
                x: allLinesBBox.topLeft.x,
                y: allLinesBBox.topLeft.y,
                width: allLinesBBox.width() + 'px',
                height: allLinesBBox.height() + 'px',
                //width: ((charsPerRow * charSize) + 32) + 'px',
                //height: ((charSize + annotationSpace) + 32) * numLines,
                fill: 'none',
            })
        )

        return [
            h('div.sf-sequence-editor-overlay', {
                'ev-mousemove': mousemoveEvent(onMousemove, { overlay: this }),
                'ev-mouseout': mousemoveEvent(onMouseout, { overlay: this }),
                'ev-mousedown': clickEvent(onMouseDown, { overlay: this }),
                'ev-mouseup': clickEvent(onMouseUp, { overlay: this }),
                'ev-contextmenu': contextMenuEvent(onRightClick, { overlay: this }),
                style: {
                    'pointer-events': 'visible',
                    cursor: 'none'
                }
            }),
            svg('svg', {
                    'class': 'sf-sequence-editor-overlay-svg',
                style: {
                    'pointer-events': 'none'
                }
            }, svgElements)
        ]
    }

    _renderSelection():VNode[] {

        if(this.selectionStart === null || this.selectionEnd === null)
            return []

        if(this.selectionStart === this.selectionEnd)
            return []

        const renderState = this.sequenceEditor.currentRenderState

        const {
            charSize,
            marginWidth,
            paddingTop,
            charsPerRow,
        } = renderState

        var selectionStart = this.selectionStart
        var selectionEnd = this.selectionEnd

        if(selectionEnd < selectionStart) {
            var tmp = selectionEnd
            selectionEnd = selectionStart
            selectionStart = tmp
        }

        const svgElements:VNode[] = []

        const lineThickness = charSize // + annotationSpace

        const startLineNumber:number = renderState.elementOffsetToLineNumber(selectionStart)
        const endLineNumber:number = renderState.elementOffsetToLineNumber(selectionEnd)
        var x:number = selectionStart % charsPerRow

        if(startLineNumber === -1 || endLineNumber === -1)
            throw new Error('???')


        var curLineNumber:number = startLineNumber


        /* First, starting at the start x pos, fill whole lines until we get to the endLineNumber
         */
        while(curLineNumber < endLineNumber) {

            const curLine = renderState.lines[curLineNumber]

            svgElements.push(svg('line', {
                x1: curLine.bbox.topLeft.x + x * charSize,
                y1: curLine.bbox.center().y,
                x2: curLine.bbox.bottomRight.x,
                y2: curLine.bbox.center().y,
                stroke: 'rgba(174, 198, 207, 0.6)',
                'stroke-width': curLine.bbox.height()
            }))

            ++ curLineNumber
            x = 0
        }

        /* We are now on the end line number.  Fill from the current x (either the start x or 0 if
         * we filled some lines before) to the end x
         */
        const curLine = renderState.lines[curLineNumber]
        var endX:number = selectionEnd - curLine.seqOffset

        svgElements.push(svg('line', {
            x1: curLine.bbox.topLeft.x + x * charSize,
            y1: curLine.bbox.center().y,
            x2: curLine.bbox.topLeft.x + endX * charSize,
            y2: curLine.bbox.center().y,
            stroke: 'rgba(174, 198, 207, 0.6)',
            'stroke-width': curLine.bbox.height()
        }))

        return svgElements
    }

    onMousemove(offset) {

        const renderState = this.sequenceEditor.currentRenderState


        renderState.annoHoverUris.clear()


        // TODOOOO

        const o = Vec2.fromXY(offset.x + renderState.marginWidth, offset.y + renderState.paddingTop)

        renderState.annoLabelBBoxes.forEach((bbox:[SXThingWithLocation, Rect]) => {

            const [ thing, rect ] = bbox

            console.dir(rect)
            console.dir(o)

            if(rect.intersectsPoint(o)) {
                
                renderState.annoHoverUris.add(thing.uri)

                // todo compare old set to new set etc

                this.sequenceEditor.update()

            }

        })



        const elementOffset = renderState.offsetToElementOffset(offset, true)

        this.mousePos = offset

        if(elementOffset >= 0) {
            this.hoverCaretPos = elementOffset
        } else {
            this.hoverCaretPos = null
        }

        this.sequenceEditor.onHoverPosChanged(this.hoverCaretPos)

        if(this.selecting) {
            this.selectionEnd = elementOffset
            //this.sequenceEditor.onSelectionChanged(this.getSelection())
        }

        this.update()
    }

    onMouseout(offset) {

        this.mousePos = null
        this.hoverCaretPos = null
        this.update()

    }

    onMouseDown(offset) {

        const renderState = this.sequenceEditor.currentRenderState

        var elementOffset = renderState.offsetToElementOffset(offset, true)

        if(elementOffset === -1)
            elementOffset = renderState.elements.length

        this.selecting = true
        this.selectionFinalized = false
        this.selectionStart = elementOffset
        this.selectionEnd = elementOffset

        this.app.closeContextMenu()

        this.update()
    }

    onMouseUp(offset) {

        if(!this.selecting)
            return

            console.log('ss ' + this.selectionStart)
            console.log('se ' + this.selectionEnd)

        if(this.selectionStart === this.selectionEnd) {

            console.log('setting caret')

            this.caretPos = this.selectionStart
            this.sequenceEditor.onCaretPosChanged(this.caretPos)

            this.selectionStart = null
            this.selectionEnd = null

            this.selecting = false
            this.selectionFinalized = false

            this.update()

        } else {

            console.log('finalizaing solelelct ')

            this.selecting = false
            this.selectionFinalized = true

            this.update()

        }
    }

    onRightClick(offset:Vec2) {

        this.app.openContextMenu(new SequenceEditorContextMenu(
            this,
            offset
        ))

    }

    getCaretPos() {

        return this.caretPos

    }

    getHoverPos() {

        return this.hoverCaretPos

    }

    getSelection() {

        if(this.selectionStart !== null && this.selectionEnd !== null
                && this.selectionStart !== this.selectionEnd) {

            return new LinearRange(this.selectionStart, this.selectionEnd)

        } else {

            return null

        }

    }
}

function caretPath(topPos:Vec2, bottomPos:Vec2) {

    const topLeft = topPos.subtract(Vec2.fromXY(4, 0))
    const topRight = topPos.add(Vec2.fromXY(4, 0))
    const bottomLeft = bottomPos.subtract(Vec2.fromXY(4, 0))
    const bottomRight = bottomPos.add(Vec2.fromXY(4, 0))

    return [
        'M' + topPos.x + ' ' + topPos.y,
        'L' + bottomPos.x + ' ' + bottomPos.y,
        'M' + topLeft.x + ' ' + topLeft.y,
        'L' + topRight.x + ' ' + topRight.y,
        'M' + bottomLeft.x + ' ' + bottomLeft.y,
        'L' + bottomRight.x + ' ' + bottomRight.y
    ].join('')

}

function onMousemove(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMousemove(Vec2.fromXY(offsetX, offsetY))
}

function onMouseout(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMouseout(Vec2.fromXY(offsetX, offsetY))
}

function onMouseDown(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMouseDown(Vec2.fromXY(offsetX, offsetY))
}

function onMouseUp(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMouseUp(Vec2.fromXY(offsetX, offsetY))
}


function onRightClick(data) {

    const { overlay, x, y } = data

    overlay.onRightClick(Vec2.fromXY(x, y))
}

