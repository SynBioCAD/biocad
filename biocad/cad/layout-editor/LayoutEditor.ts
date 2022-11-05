import { createGrid } from 'jfw/graphics';
import { App } from 'jfw';

import Layout from 'biocad/cad/layout/Layout'
import { View, SubTree } from 'jfw/ui'

import { VNode, h, svg } from 'jfw/vdom'

import Depiction from 'biocad/cad/layout/Depiction'
import LayoutEditorOverlay from "biocad/cad/layout-editor/LayoutEditorOverlay";
import { Rect, Vec2 } from "jfw/geom"

import ScrollbarWidget from '../ScrollbarWidget'
import BiocadApp from "biocad/BiocadApp";
import Matrix from "jfw/geom/Matrix";
import { Hook } from "jfw/util";
import Droppable from "biocad/droppable/Droppable";
import LayoutPOD from "biocad/cad/layout/LayoutPOD";
import SVGDefs from "biocad/cad/SVGDefs";
import { Graph, SBOL3GraphView, sbol3 } from "sboljs"
import LayoutEditorDebugLog from './LayoutEditorDebugLog';
import DepictionRef from 'biocad/cad/layout/DepictionRefByUid';

export default class LayoutEditor extends View {

    layout:Layout

    showGrid:boolean = false
    snapToGrid:boolean = false


    /* e.g. if suggesting putting a part into a backbone
     */
    proposedLayout:Layout|null
    onProposeLayout:Hook<Layout>
    //private proposedGraph:Graph|null


    onNewGraph:Hook<Graph>


    overlay:LayoutEditorOverlay
    overlaySubtree:SubTree
    scrollbarSize:number

    debugLog:LayoutEditorDebugLog


    scrollOffset:Vec2
    scaleFactor:number
    interactive:boolean // rendercontext

    selectedDepictions:DepictionRef[]
    onSelectDepictions:Hook<Depiction[]> 

    undoLevels:any[]




    constructor(app:App, layout:Layout) {

        super(app)

        this.selectedDepictions = []
        this.onSelectDepictions = new Hook<Depiction[]>()
        this.onProposeLayout = new Hook<Layout>()

        this.onNewGraph = new Hook<Graph>()

        this.layout = layout
        this.layout.versionChangedCallback = () => this.app.update()

        this.interactive = true
        this.overlay = new LayoutEditorOverlay(this)
        this.overlaySubtree = new SubTree(this.overlay)
        this.debugLog = new LayoutEditorDebugLog(this)
        this.scrollbarSize = 24
        this.scrollOffset = Vec2.zero()
        this.scaleFactor = 1.0
        this.undoLevels = []
        this.proposedLayout = null
    }


    cleanup() {
        this.overlay.cleanup()
    }

    pushUndoLevel():void {

        console.time('push undo level')

        let layout = LayoutPOD.serialize(this.layout)
        let graph = sbol3(this.layout.graph).serializeXML() // TODO: use a faster serialization?

        this.undoLevels.push({ layout, graph })

        ;(this.app as BiocadApp).saveState()

        console.timeEnd('push undo level')
    }

    async popUndoLevel() {

        if(this.undoLevels.length === 0) {
            console.warn('nothing to undo')
            return
        }

        let oldState = this.undoLevels[this.undoLevels.length - 1]

        let newGraph = await SBOL3GraphView.loadString(oldState.graph, 'application/rdf+xml')

        let layout = LayoutPOD.deserialize(newGraph.graph, oldState.layout)
        this.undoLevels.pop()

        this.immediatelyReplaceLayout(layout)
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
            h('div', {
                style: {
                    position: 'absolute',
                    left: (this.scrollbarSize - this.scrollOffset.x) + 'px',
                    top: (this.scrollbarSize - this.scrollOffset.y) + 'px',
                    width: (this.layout.getSize().x * this.layout.gridSize.x) * this.scaleFactor + 'px',
                    height: (this.layout.getSize().y * this.layout.gridSize.y) * this.scaleFactor + 'px',
                    background: this.showGrid ? createGrid(this.layout.gridSize.multiplyScalar(this.scaleFactor)) : 'white'
                }
            }),
            svg('svg', {
                'class': 'sf-circuit-view',
                style: {
                    position: 'absolute',
                    //left: (this.scrollbarSize - this.scrollOffset.x) + 'px',

                    left: this.scrollbarSize + 'px',
                    top: this.scrollbarSize + 'px',
                    width: 'calc(100% + ' + this.scrollOffset.x + 'px)',
                    height: 'calc(100% - ' + this.scrollbarSize + 'px)'
                }
            }, svg('g', {
                transform: transform.toSVGString()
            }, svgElements)),
            h('div', {
                style: {
                    position: 'absolute',
                    left: this.scrollbarSize + 'px',
                    top: this.scrollbarSize + 'px',
                    width: 'calc(100% - ' + this.scrollbarSize + 'px)',
                    height: 'calc(100% - ' + this.scrollbarSize + 'px)',
                }
            }, [
                //this.debugLog.render()
            ]),
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
            new ScrollbarWidget(this.app as BiocadApp, this),
        ]) 
    }




    getTransform():Matrix {

        var transform:Matrix = Matrix.identity()

        transform = transform.scale(Vec2.fromScalar(this.scaleFactor))
        transform = transform.translate(Vec2.zero().subtract(this.scrollOffset))

        return transform
    }

    selectInRect(rect:Rect) {

        this.selectedDepictions.length = 0

        const intersecting:Depiction[] = this.layout.getDepictionsContainedByRect(rect, true)

        for(let depiction of intersecting) {
            this.selectedDepictions.push(new DepictionRef(depiction))
        }

        this.app.update()
        

    }

    deselectAll():void {

        this.selectedDepictions.length = 0
        this.update()
    
    }

    getSelection(layout:Layout):Depiction[] {

        let selection:Depiction[] = []
        
        for(let ref of this.selectedDepictions) {
            let d = ref.toDepiction(layout)
            if(d) {
                selection.push(d)
            }
        }

        return selection
    }

    selectionContainsPoint(layout:Layout, point:Vec2):boolean {

        const selection:Depiction[] = this.getSelection(layout)

        for(var i = 0; i < selection.length; ++ i) {

            if(selection[i].absoluteBoundingBox.intersectsPoint(point))
                return true

        }

        return false
    }

    getSelectionBoundingBox(layout:Layout):Rect|null {

        const selection:Depiction[] = this.getSelection(layout)

        if(selection.length === 0)
            return null

        var rect:Rect = selection[0].absoluteBoundingBox

        for(var i = 1; i < selection.length; ++ i) {

            rect = rect.surround(selection[i].absoluteBoundingBox)

        }

        return rect
    }

    proposeLayout(layout:Layout):void {

        this.debugLog.log('propose layout')

        this.proposedLayout = layout

        this.onProposeLayout.fire(layout)

        this.update()

    }

    acceptProposedLayout():void {

        this.debugLog.log('accept proposed layout')

        if(this.proposedLayout === null)
            throw new Error('???')

        this.layout.cleanup()
        this.layout = this.proposedLayout
        this.layout.versionChangedCallback = () => this.app.update()

        this.proposedLayout = null

        this.onNewGraph.fire(this.layout.graph)

        this.update()

    }

    immediatelyReplaceLayout(layout:Layout):void {

        this.layout.cleanup()
        this.layout = layout
        this.layout.versionChangedCallback = () => this.app.update()

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

}


