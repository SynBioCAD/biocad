
import { S3Component } from "sboljs"

import { h, svg } from '@biocad/jfw/vdom'

import { View } from '@biocad/jfw/ui'

import { DetachedSubTree, SubTree } from '@biocad/jfw/ui'
import SequenceEditorOverlay from './SequenceEditorOverlay'
import SequenceEditorToolbar from './SequenceEditorToolbar'
import SequenceEditorBody from './SequenceEditorBody'

import RenderState from './SequenceEditorRenderState'
import { VNode } from "@biocad/jfw/vdom"
import { Dialog } from "@biocad/jfw/ui";
import { App } from "@biocad/jfw/ui";
import { S3Sequence } from "sboljs"

import getReverseComplementSequenceString = require('ve-sequence-utils/src/getReverseComplementSequenceString')
import BiocadProject from "../../BiocadProject"

export default class SequenceEditor extends View {

	project:BiocadProject

    component:S3Component|null
    sequence:S3Sequence|null

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


    constructor(project:BiocadProject) {

        super(project)
	this.project = project

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

    setComponent(component:S3Component) {

        this.component = component
        
        // TODO multiple sequence support
        this.sequence = component.sequences[0] || null

        if(this.sequence === null) {
            this.sequence = component.createSequence()
        }

        this.body.update()
        this.update()

    }

    setCharsPerRow(charsPerRow) {

        this.charsPerRow = charsPerRow
        this.update()

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
		style: {
			width: this.currentRenderState.totalSize().x + 'px',
			height: this.currentRenderState.totalSize().y + 'px',
		}
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

    getSelectionElements():string|null {

        let selection = this.getSelection()

        if(selection === null)
            return null

        let sequence = this.sequence

        if(sequence === null)
            return null

        let elements = sequence.elements

        if(elements === undefined)
            return null

        if(selection.end < selection.start) {
            return getReverseComplementSequenceString(elements.substring(selection.end, selection.start))
        } else {
            return elements.substring(selection.start, selection.end)
        }

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

