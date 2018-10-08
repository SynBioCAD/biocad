
import { SXComponent } from "sbolgraph"

import { h, svg } from 'jfw/vdom'

import { View } from 'jfw/ui'
import { click as clickEvent } from 'jfw/event'

import { Matrix, Vec2, LinearRangeSet, LinearRange } from 'jfw/geom'

import { Types } from 'bioterms'

import { DetachedSubTree, SubTree } from 'jfw/ui'
import SequenceEditorOverlay from './SequenceEditorOverlay'
import SequenceEditorToolbar from './SequenceEditorToolbar'
import SequenceEditorBody from './SequenceEditorBody'

import RenderState from './SequenceEditorRenderState'
import { VNode } from "jfw/vdom"
import { Dialog } from "jfw/ui/dialog";
import { App } from "jfw";
import { SXSequence } from "sbolgraph"

export default class SequenceEditor extends View {

    component:SXComponent|null
    sequence:SXSequence|null

    charsPerRow:number
    charSize:number
    annotationHeight:number
    marginWidth:number
    paddingTop:number
    caretPos:number
    paddingBetweenStrands:number

    darkMode:boolean
    showTopToolbar:boolean
    showBottomToolbar:boolean
    readOnly:boolean

    overlay:SequenceEditorOverlay
    toolbar:SequenceEditorToolbar

    body:SequenceEditorBody
    bodySubTree:SubTree

    currentRenderState: RenderState


    constructor(app:App, parent?:Dialog) {

        super(app, parent)

        this.darkMode = false
        this.showTopToolbar = true
        this.showBottomToolbar = true
        this.readOnly = false

        this.component = null
        this.sequence = null
        this.charsPerRow = 50
        this.charSize = 10
        this.annotationHeight = 8
        this.marginWidth = 64
        //this.paddingTop = 32
        this.paddingTop = 0
        this.caretPos = -1
        this.paddingBetweenStrands = 2

        this.overlay = new SequenceEditorOverlay(this)
        this.toolbar = new SequenceEditorToolbar(this)

        this.body = new SequenceEditorBody(this)
        this.bodySubTree = new SubTree(this.body)
    }

    setComponent(component:SXComponent) {

        this.component = component
        
        this.sequence = component.sequence || null

        if(this.sequence === null) {
            this.sequence = component.createSequence()
        }

        this.body.update()
        this.app.update()

    }

    setCharsPerRow(charsPerRow) {

        this.charsPerRow = charsPerRow
        this.app.update()

    }

    render() {

        if(!this.component) {
            return svg('svg.sf-sequence-editor', {
                style: {
                width: '100%',
                height: '100%'
                }
            })
        }

        this.currentRenderState = new RenderState(this)

        const svgElements:Array<any> = []

        svgElements.push(this.bodySubTree.render())

        let elems:VNode[] = [
            h('div.sf-sequence-editor-svgs', [
                svg('svg', {
                    'class': 'sf-sequence-editor-svg'
                }, svgElements),
                this.overlay.render()
            ])
        ]

        if(this.showTopToolbar) {
            elems.unshift( this.toolbar.render())
        }
        return h('div.sf-sequence-editor', {
        }, elems)
    }


    getHoverPos() {
        return this.overlay.getHoverPos()
    }

    getCaretPos() {
        return this.overlay.getCaretPos()
    }

    getSelection() {
        return this.overlay.getSelection()
    }

    /**** functions below are called by the overlay
     ****/

    onHoverPosChanged(newPos) {
        this.toolbar.update()
    }

    onCaretPosChanged(newPos) {
        this.toolbar.update()
    }

    onSelectionChanged(startPos, endPos) {
        this.toolbar.update()
    }

}

