import { createGrid } from 'jfw/graphics';
import { App } from 'jfw';

import Layout from './Layout'
import { View, SubTree } from 'jfw/ui'

import { VNode, h, svg } from 'jfw/vdom'

import Depiction from './Depiction'
import LayoutEditorOverlay from "biocad/cad/LayoutEditorOverlay";
import { Rect, Vec2 } from "jfw/geom"

import ScrollbarWidget from './ScrollbarWidget'
import BiocadApp from "biocad/BiocadApp";
import Matrix from "jfw/geom/Matrix";
import Hook from "jfw/Hook";
import Droppable from "biocad/droppable/Droppable";
import LayoutPOD from "biocad/cad/LayoutPOD";
import SVGDefs from "biocad/cad/SVGDefs";
import { SBOLXGraph } from "sbolgraph"

export default class LayoutEditor extends View {

    layout:Layout


    /* e.g. if suggesting putting a part into a backbone
     */
    private proposedLayout:Layout|null
    onProposeLayout:Hook<Layout>
    //private proposedGraph:SBOLXGraph|null


    onNewGraph:Hook<SBOLXGraph>


    overlay:LayoutEditorOverlay
    overlaySubtree:SubTree
    scrollbarSize:number


    scrollOffset:Vec2
    scaleFactor:number
    interactive:boolean // rendercontext

    selectedUIDs:Set<number> 
    onSelectDepictions:Hook<Depiction[]> 

    undoLevels:any[]


    creatingInteraction:boolean
    creatingInteractionFrom:Depiction|undefined
    creatingInteractionWaypoints:Vec2[]


    constructor(app:App, layout:Layout) {

        super(app)

        this.selectedUIDs = new Set<number>()
        this.onSelectDepictions = new Hook<Depiction[]>()
        this.onProposeLayout = new Hook<Layout>()

        this.onNewGraph = new Hook<SBOLXGraph>()

        this.layout = layout
        this.interactive = true
        this.overlay = new LayoutEditorOverlay(this)
        this.overlaySubtree = new SubTree(this.overlay)
        this.scrollbarSize = 24
        this.scrollOffset = Vec2.zero()
        this.scaleFactor = 1.0
        this.undoLevels = []
        this.proposedLayout = null

        this.creatingInteraction = false
    }


    pushUndoLevel():void {

        const serialized = LayoutPOD.serialize(this.layout)

        this.undoLevels.push(serialized)

        ;(this.app as BiocadApp).saveState()
    }

    popUndoLevel():void {

        if(this.undoLevels.length === 0) {
            console.warn('nothing to undo')
            return
        }

        this.layout = LayoutPOD.deserialize(this.layout.graph, this.undoLevels[this.undoLevels.length - 1])
        this.undoLevels.pop()
        this.update()
    }

    render():VNode {

        const svgElements:Array<VNode> = [
            SVGDefs.render()
        ]

        const layoutToRender:Layout = this.proposedLayout ? this.proposedLayout : this.layout

        for(var i = layoutToRender.depictions.length - 1; i >= 0; -- i) {

            const depiction = layoutToRender.depictions[i]

            if(depiction.isVisible()) {
                svgElements.push(depiction.render(this))
            }
        }

        var transform:Matrix = this.getTransform()

        return h('div.jfw-flow-grow', {
            style: {
                position: 'relative',
                display: 'flex',
                overflow: 'hidden'
            }
        }, [
            svg('svg', {
                'class': 'sf-circuit-view',
                style: {
                    position: 'absolute',
                    //left: (this.scrollbarSize - this.scrollOffset.x) + 'px',

                    left: this.scrollbarSize + 'px',
                    top: this.scrollbarSize + 'px',
                    width: 'calc(100% + ' + this.scrollOffset.x + 'px)',
                    height: 'calc(100% - ' + this.scrollbarSize + 'px)',
                    background: createGrid(this.layout.gridSize.multiplyScalar(this.scaleFactor)),
                }
            }, svg('g', {
                transform: transform.toSVGString()
            }, svgElements)),
            svg('svg', {
                'class': 'sf-circuit-view-overlay',
                style: {
                    position: 'absolute',
                    left: this.scrollbarSize + 'px',
                    top: this.scrollbarSize + 'px',
                    width: 'calc(100% - ' + this.scrollbarSize + 'px)',
                    height: 'calc(100% - ' + this.scrollbarSize + 'px)',
                }
            }, [
                this.overlaySubtree.render()
            ]),
            new ScrollbarWidget(this.app as BiocadApp, this)
        ]) 
    }




    getTransform():Matrix {

        var transform:Matrix = Matrix.identity()

        transform = transform.scale(Vec2.fromScalar(this.scaleFactor))
        transform = transform.translate(Vec2.zero().subtract(this.scrollOffset))

        return transform
    }

    selectInRect(rect:Rect) {

        this.selectedUIDs.clear()

        const intersecting:Depiction[] = this.layout.getDepictionsContainedByRect(rect, true)

        intersecting.forEach((depiction:Depiction) => {
            this.selectedUIDs.add(depiction.uid)
        })

        this.app.update()
        

    }

    deselectAll():void {

        this.selectedUIDs.clear()
        this.update()
    
    }

    getSelection():Depiction[] {

        const arr:Depiction[] = []

        const keys = this.selectedUIDs.keys()

        for(var it:IteratorResult<number> = keys.next(); !it.done; it = keys.next()) {

            const depiction:Depiction|undefined = this.layout.getDepictionForUid(it.value)

            if(depiction === undefined)
                throw new Error('???')

            arr.push(depiction)
        }

        return arr
    }

    selectionContainsPoint(point:Vec2):boolean {

        const selection:Depiction[] = this.getSelection()

        for(var i = 0; i < selection.length; ++ i) {

            if(selection[i].absoluteBoundingBox.intersectsPoint(point))
                return true

        }

        return false
    }

    getSelectionBoundingBox():Rect|null {

        const selection:Depiction[] = this.getSelection()

        if(selection.length === 0)
            return null

        var rect:Rect = selection[0].absoluteBoundingBox

        for(var i = 1; i < selection.length; ++ i) {

            rect = rect.surround(selection[i].absoluteBoundingBox)

        }

        return rect
    }

    proposeLayout(layout:Layout):void {

        this.proposedLayout = layout

        this.onProposeLayout.fire(layout)

        this.update()

    }

    acceptProposedLayout():void {

        if(this.proposedLayout === null)
            throw new Error('???')

        this.layout = this.proposedLayout
        this.proposedLayout = null

        this.onNewGraph.fire(this.layout.graph)

        this.update()

    }

    immediatelyReplaceLayout(layout:Layout):void {

        this.layout = layout

        this.onNewGraph.fire(this.layout.graph)

        this.update()

    }

    cancelProposedLayout():void {

        this.proposedLayout = null
        this.update()

    }

    isProposingLayout():boolean {

        return this.proposedLayout !== null

    }



    startCreatingInteraction(from:Depiction) {

        this.creatingInteraction = true
        this.creatingInteractionFrom = from
        this.creatingInteractionWaypoints = []
        this.overlay.update()
    }

}


