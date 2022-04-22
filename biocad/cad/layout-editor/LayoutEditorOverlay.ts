import  { S3Identified, S3Interaction, sbol3 }  from "sbolgraph"

import LabelDepiction from 'biocad/cad/layout/LabelDepiction';
import Depiction, { Opacity } from 'biocad/cad/layout/Depiction';
import { Vec2 } from 'jfw/geom';
import { VNode, svg, active } from 'jfw/vdom';

import { View } from 'jfw/ui'
import LayoutEditor from "biocad/cad/LayoutEditor";

import { mousemove as mousemoveEvent, click as clickEvent, mousewheel as wheelEvent, gesture as gestureEvent, contextMenu as contextMenuEvent, drag } from 'jfw/event'
import Layout from "biocad/cad/layout/Layout";

import renderHandles from '../renderHandles'
import Matrix from "jfw/geom/Matrix";
import Rect from "jfw/geom/Rect";
import BiocadApp from "biocad/BiocadApp";
import Droppable from "biocad/droppable/Droppable";
import SBOLDroppable from "biocad/droppable/SBOLDroppable";

import { Graph, S3Component, S3SubComponent } from "sbolgraph"
import LayoutEditorContextMenu from "biocad/cad/LayoutEditorContextMenu";
import ComponentDepiction from 'biocad/cad/layout/ComponentDepiction';

import assert from 'power-assert'
import DOp, { DOpResult } from "biocad/cad/drag-op/DOp";
import DOpTwoBlackboxesMakeConstraint from "biocad/cad/drag-op/DOpTwoBlackboxesMakeConstraint";
import DOpMoveInWorkspace from "biocad/cad/drag-op/DOpMoveInWorkspace";
import DOpEnterWorkspace from "biocad/cad/drag-op/DOpEnterWorkspace";
import DOpEnterParent from "biocad/cad/drag-op/DOpEnterParent";
import DOpEnterSibling from "biocad/cad/drag-op/DOpEnterSibling";
import DOpMoveInBackbone from "biocad/cad/drag-op/DOpMoveInBackbone";
import DOpMoveInParent from "biocad/cad/drag-op/DOpMoveInParent";
import InteractionDepiction from "biocad/cad/layout/InteractionDepiction";
import DepictionRef from "biocad/cad/layout/DepictionRefByUid";

import copySBOL from 'biocad/util/copySBOL'
import createInteraction from "../createInteraction";
import DepictionRefByChain from "biocad/cad/layout/DepictionRefByChain";

export default class LayoutEditorOverlay extends View {

    mouseGridPos: Vec2 = Vec2.fromXY(-1, -1)
    layoutEditor:LayoutEditor


    selectionStart:Vec2|null

    dragging:boolean
    draggingDepictions:{depiction:DepictionRefByChain, dragOffset:Vec2}[]


    displayRect:Rect|null


    proposingResult:DOpResult|null


    dragOps:Array<DOp>

    proposingConnectionFrom:Depiction|undefined

    constructor(layoutEditor:LayoutEditor) {

        super(layoutEditor.app)
        
        this.layoutEditor = layoutEditor


        this.proposingResult = null



        this.displayRect = null

        this.draggingDepictions = []

        this.selectionStart = null


        this.dragOps = []
        this.dragOps.push(new DOpMoveInBackbone())
        this.dragOps.push(new DOpTwoBlackboxesMakeConstraint())
        this.dragOps.push(new DOpEnterSibling())
        this.dragOps.push(new DOpEnterParent())
        this.dragOps.push(new DOpEnterWorkspace())
        this.dragOps.push(new DOpMoveInWorkspace())
        this.dragOps.push(new DOpMoveInParent())

        const app:BiocadApp = this.app as BiocadApp
        app.dropOverlay.addReceiver(this)

    }

    cleanup() {
        (this.app as BiocadApp).dropOverlay.removeReceiver(this)
    }


    private getSelectionRect():Rect|null {

        if(this.selectionStart === null)
            return null

        var transform:Matrix = this.layoutEditor.getTransform().invert()

        const selectionEnd:Vec2 = this.mouseGridPos

        return new Rect(this.selectionStart, selectionEnd).normalize()

    }

    private resize(depiction:Depiction, pos:Vec2, dimensions:string[]) {

        const transform:Matrix = this.layoutEditor.getTransform().invert()
        //const gridPos:Vec2 = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize).round())
        const gridPos:Vec2 = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize))

        var relPos:Vec2
        
        if(depiction.parent)
            relPos = gridPos.subtract(depiction.parent.absoluteOffset)
        else
            relPos = gridPos

        //console.log(relPos)

        var bbox = depiction.boundingBox

        // boundingBox is literally { offset, offset + size }


        if(dimensions.indexOf('south') !== -1) {
            bbox.bottomRight = Vec2.fromXY(bbox.bottomRight.x, relPos.y)
        }
        if(dimensions.indexOf('east') !== -1) {
            bbox.bottomRight = Vec2.fromXY(relPos.x, bbox.bottomRight.y)
        }
        if(dimensions.indexOf('north') !== -1) {
            bbox.topLeft = Vec2.fromXY(bbox.topLeft.x, relPos.y)
        }
        if(dimensions.indexOf('west') !== -1) {
            bbox.topLeft = Vec2.fromXY(relPos.x, bbox.topLeft.y)
        }

        bbox.topLeft = bbox.topLeft.max(Vec2.fromXY(0, 0))
        bbox.bottomRight = bbox.bottomRight.max(Vec2.fromXY(1, 1))


        let dL = bbox.topLeft.x - depiction.boundingBox.topLeft.x
        let dT = bbox.topLeft.y - depiction.boundingBox.topLeft.y
        let dR = bbox.bottomRight.x - depiction.boundingBox.bottomRight.x
        let dB = bbox.bottomRight.y - depiction.boundingBox.bottomRight.y

        let stuffChanged = false


        let bboxSize = bbox.size()

        if(! (depiction instanceof ComponentDepiction)) {
            return
        }

        let newSize = depiction.size.add(Vec2.fromXY(
            (- dL) + dR,
            (- dT) + dB
        ))
        
        if (newSize.x !== depiction.size.x) {
            depiction.minSize = Vec2.fromXY(newSize.x, depiction.minSize.y)
            stuffChanged = true
        }

        if (newSize.y !== depiction.size.y) {
            depiction.minSize = Vec2.fromXY(depiction.minSize.x, newSize.y)
            stuffChanged = true
        }

        if(stuffChanged) {
            // TODO:
            // Currently dragging the top or left handles can cause the depiction
            // to move, because we change the minSize but don't know what the
            // eventual minimum size is going to be post configurate. so we change
            // the offset and then the size ends up staying the same.
            //
            depiction.offset = bbox.topLeft
            depiction.offsetExplicit = true
            stuffChanged = true
        }

        if(stuffChanged)
            depiction.touch()

        this.app.update()
        

    }

    render():VNode {

        const layout:Layout = this.layoutEditor.proposedLayout
                ? this.layoutEditor.proposedLayout : this.layoutEditor.layout


        const handles:VNode[] = []

        var transform:Matrix = this.layoutEditor.getTransform()


        const mappings:VNode[] = []

        if(this.selectionStart === null) {

            let hovering:Depiction|null = layout.getTopIntersectingDepiction(this.mouseGridPos, true)

            if(hovering) {

                if(hovering instanceof LabelDepiction) {
                    hovering = hovering.labelFor
                }

                handles.push(renderHandles(transform.transformRect(hovering.absoluteBoundingBox.multiply(layout.gridSize)), true, /* hovering.isResizeable() */ false, (pos:Vec2, dimensions:string[]) => {
                    //this.resize(hovering, pos, dimensions)
                }))

                let hoveringThing = hovering.depictionOf

                if(hoveringThing && hoveringThing instanceof S3SubComponent) {

                    let sc = hoveringThing as S3SubComponent

                    for(let mapping of sc.mappings) {

                        let local = mapping.local
                        let remote = mapping.remote

                        if(!local || !remote) {
                            throw new Error('???')
                        }

                        let dOfLocal = layout.getDepictionsForUri(local.uri)[0]
                        let dOfRemote = layout.getDepictionsForUri(remote.uri)[0]

                        if(dOfLocal && dOfRemote) {
 

                            /*
                            mappings.push(svg('line', {
                                x1: localBBox.center().x,
                                y1: localBBox.center().y,
                                x2: remoteBBox.center().x,
                                y2: remoteBBox.center().y,
                                stroke: 'red',
                                'stroke-dasharray': '1 1'
                                //thickness: '2px'
                            }))*/

                            for(let d of [ dOfLocal, dOfRemote ]) {

                                if (d !== hovering) {
                                    mappings.push(renderHandles(transform.transformRect(d.absoluteBoundingBox.multiply(layout.gridSize)), true, hovering.isResizeable(), (pos: Vec2, dimensions: string[]) => {
                                    }, '#ff6961'))
                                }

                            }


                        } else {
                            throw new Error('???')

                        }


                    }

                }
            }
        }

        for(let depiction of this.layoutEditor.getSelection(layout)) {

            handles.push(renderHandles(transform.transformRect(depiction.absoluteBoundingBox.multiply(layout.gridSize)), false, depiction.isResizeable(), (pos:Vec2, dimensions:string[]) => {
                this.resize(depiction, pos, dimensions)
            }))

        }

        const interaction:VNode[] = []

        if(this.proposingConnectionFrom) {

            var points

            console.log('pc')



            let intersects = layout.getTopIntersectingDepiction(this.mouseGridPos, true)

            if(intersects && intersects instanceof ComponentDepiction) {
                points = this.proposingConnectionFrom.absoluteBoundingBox
                    .closestEdgeMidPointsBetweenThisAnd(intersects.absoluteBoundingBox)

            } else {

                points = this.proposingConnectionFrom.absoluteBoundingBox
                    .closestEdgeMidPointsBetweenThisAnd(Rect.fromPosAndSize(this.mouseGridPos, Vec2.fromXY(1, 1)))

            }

            let pA = points.pointA as Vec2
            let pB = points.pointB as Vec2

            interaction.push(svg('path', {
                d: [
                    'M' + pA.multiply(layout.gridSize).toPathString(),
                    'L' + pB.multiply(layout.gridSize).toPathString()
                ].join(''),
                'stroke': 'red',
                'stroke-width': '2px',
                'opacity': '0.2'
            }))

        }


        const selection:VNode[] = []

        if(this.selectionStart !== null) {

            const _selectionRect:Rect|null = this.getSelectionRect()

            if(_selectionRect === null)
                throw new Error('???')

            //const selectionRect:Rect = transform.transformRect(_selectionRect.round().multiply(layout.gridSize))
            const selectionRect:Rect = transform.transformRect(_selectionRect.multiply(layout.gridSize))

            selection.push(
                svg('rect', {
                    x: selectionRect.topLeft.x,
                    y: selectionRect.topLeft.y,
                    width: selectionRect.width(),
                    height: selectionRect.height(),
                    fill: '#AAF',
                    opacity: 0.5,
                    'pointer-events': 'none'
                })
            )


        }

        var debug:any = []

        /*
        if(this.proposingResult) {

            console.log('pr')

            if(this.proposingResult.validForRect) {

                console.log('prvfr')

                let r = this.proposingResult.validForRect

                r = r.multiply(layout.gridSize)

                console.log(r)

                debug.push(svg('rect', {
                    x: r.topLeft.x,
                    y: r.topLeft.y,
                    width: r.width(),
                    height: r.height(),
                    fill: 'rgba(0, 255, 255, 0.5)'
                }))
            }
        } else {
            console.log('npr')
        }*/

        const afterRender = (realNode:Element) => {
            this.afterRender(realNode)
        }

        return active(afterRender, svg('g', [
            svg('rect', {
                width: '100%',
                height: '100%',
                fill: 'none',
                stroke: 'none',
                'pointer-events': 'visible',
                'ev-mousemove': mousemoveEvent(onMousemove, { overlay: this }),
                'ev-mouseout': mousemoveEvent(onMouseout, { overlay: this }),

                'ev-mousedown': clickEvent(onMousedown, { overlay: this }),
                'ev-mouseup': clickEvent(onMouseup, { overlay: this }),
                
                'ev-click': clickEvent(onClick, { overlay: this }),
                'ev-contextmenu': contextMenuEvent(onRightClick, { overlay: this }),
                ['ev-' + wheelEvent.getEventName()]: wheelEvent(onWheel, { overlay: this }),
                ['ev-gesturestart']: gestureEvent(onGestureStart, { overlay: this }),
                ['ev-gesturechange']: gestureEvent(onGestureChange, { overlay: this }),
                ['ev-gestureend']: gestureEvent(onGestureEnd, { overlay: this }),
            }),
        ].concat(handles).concat(selection).concat(mappings).concat(interaction).concat(debug).concat([
        ])))
    }

    afterRender(realNode:Node) {

        this.displayRect = Rect.fromClientRect(
            (realNode as SVGElement).getBoundingClientRect()
        )
    }



    getDropZone():Rect|null {
        return this.displayRect
    }

    receiveDroppable(offset:Vec2, _droppable:Droppable):void {

        const app:BiocadApp = this.app as BiocadApp

        //console.log('receive at')
        //console.log(offset)




        if(_droppable instanceof SBOLDroppable) {

            if(this.layoutEditor.isProposingLayout()) {

                this.layoutEditor.acceptProposedLayout()

                this.proposingResult = null

                //;(_droppable as SBOLDroppable).finalizeDrop(this.layoutEditor.layout.graph, this.proposingDepiction)
                //this.proposingDepiction = null
                
                this.app.update()

                return
            }

            const droppable:SBOLDroppable = _droppable as SBOLDroppable

            let identityMap = copySBOL(droppable.graph, app.graph, app.defaultPrefix)

            // TODO
            const newUri = identityMap.get(sbol3(droppable.graph).topLevels[0].uri)

            if(!newUri) {
                throw new Error('???')
            }

            const layout:Layout = this.layoutEditor.layout

            layout.syncAllDepictions(5)

            const depiction:Depiction|undefined = layout.getDepictionsForUri(newUri)[0]

            if(depiction === undefined)
                throw new Error('???')

            depiction.offsetExplicit = true
            //depiction.offset = offset.divide(this.layoutEditor.layout.gridSize).divideScalar(this.layoutEditor.scaleFactor).round()
            depiction.offset = offset.divide(this.layoutEditor.layout.gridSize).divideScalar(this.layoutEditor.scaleFactor)

            layout.configurate([])

        }


    }


    onMousemove(pos:Vec2) {

        var transform:Matrix = this.layoutEditor.getTransform().invert()

        this.mouseGridPos = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize))




        if(this.dragging) {
            for(let i = 0; i < this.draggingDepictions.length; ++ i) {

                let dragging = this.draggingDepictions[i]

                let draggingDepiction = dragging.depiction.toDepiction(this.layoutEditor.layout)

                if(!draggingDepiction) {
                    continue
                }

                let newRect = Rect.fromPosAndSize(
                    //this.mouseGridPos.subtract(dragging.dragOffset).round(),
                    this.mouseGridPos.subtract(dragging.dragOffset),
                    draggingDepiction.size
                )

                // TODO not good with multipole depictins selected
                for(let dOp of this.dragOps) {

                    let result = dOp.test(this.layoutEditor.layout,
                            this.layoutEditor.layout.graph,
                            this.layoutEditor.layout,
                            this.layoutEditor.layout.graph, 
                            draggingDepiction,
                            newRect,
                            [])

                    if(result) {

                        console.log('onMousemove: got drag op result for ', dOp)

                        // If it doesn't change the graph action immediately
                        // if it produced a new graph, propose it until mouse up

                        if(result.newGraph) {

                            let layout = result.newLayout

                            if(!layout) {
                                layout = this.layoutEditor.layout.cloneWithNewGraph(result.newGraph)
                                layout.syncAllDepictions(5)
                                layout.configurate([])
                            }

                            this.layoutEditor.proposeLayout(layout)

                        } else if(result.newLayout) {

                            this.layoutEditor.immediatelyReplaceLayout(result.newLayout)

                        } 

                        break
                    }

                }

            }
        }



        /* always rerendering the overlay on mousemove (but not the whole layout)
         */
        this.update()
    }

    onDroppableMoved(_offset:Vec2, _droppable:Droppable):void {

        // DEBUG
        this.update()

        if(this.displayRect === null)
            return

        if(!(_droppable instanceof SBOLDroppable))
            return


        const droppable:SBOLDroppable = _droppable as SBOLDroppable

        var transform:Matrix = this.layoutEditor.getTransform().invert()

        console.log('Droppable moved ', _offset)

        const offset = transform.transformVec2(
            _offset.subtract(this.displayRect.topLeft).divide(this.layoutEditor.layout.gridSize)
        )

        const size:Vec2 = droppable.getSize().divide(this.layoutEditor.layout.gridSize)
        const rect:Rect = new Rect(offset.subtract(size.multiplyScalar(0.5)), offset.add(size.multiplyScalar(0.5)))


        let newDOp = false

        for(let dOp of this.dragOps) {

            let result = dOp.test(_droppable.layout,
                    _droppable.graph,
                    this.layoutEditor.layout,
                    this.layoutEditor.layout.graph, 
                    _droppable.layout.getRootDepictions()[0],
                    rect,
                    droppable.ignoreForDragOps || [])

            if(result) {

                console.log('onDroppableMoved: got drag op result for ', dOp)

                this.proposingResult = result

                if(result.newLayout) {
                    this.layoutEditor.proposeLayout(result.newLayout)
                }


                newDOp = true

                break
            }

        }


        if(!newDOp) {
            if(this.layoutEditor.isProposingLayout()) {

                if(this.proposingResult === null)
                    throw new Error('???')

                if(this.proposingResult.validForRect && !this.proposingResult.validForRect.intersects(rect)) {
                    this.proposingResult = null
                    this.layoutEditor.cancelProposedLayout()
                }
            }
        }

        if(this.proposingResult) {
            ; (this.app as BiocadApp).dropOverlay.hide()
        } else {
            ; (this.app as BiocadApp).dropOverlay.unhide()
        }
    }


    onMousedown(pos:Vec2) {

        const layout:Layout = this.layoutEditor.layout

        var transform:Matrix = this.layoutEditor.getTransform().invert()

        const gridPos:Vec2 = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize))

        if(this.proposingConnectionFrom) {

            let from = this.proposingConnectionFrom
            let to = this.layoutEditor.layout.getTopIntersectingDepiction(this.mouseGridPos, true)

            this.proposingConnectionFrom = undefined

            if(to) {
                createInteraction(this.layoutEditor, from, to)
            }
        }

        if(this.layoutEditor.selectionContainsPoint(layout, gridPos)) {

            const selection:Depiction[] = this.layoutEditor.getSelection(layout)

            this.draggingDepictions = []

            for(let d of selection) {

                this.draggingDepictions.push({
                    depiction: new DepictionRefByChain(d),
                    dragOffset: gridPos.subtract(d.absoluteOffset)
                })

            }

            this.layoutEditor.pushUndoLevel()
            this.dragging = true

        } else {

            const depiction:Depiction|null = layout.getTopIntersectingDepiction(gridPos, true)

            if(depiction !== null) {
                this.layoutEditor.pushUndoLevel()
                this.dragging = true
                this.draggingDepictions = [
                    {
                        depiction: new DepictionRefByChain(depiction),
                        dragOffset: gridPos.subtract(depiction.absoluteOffset)
                    }
                ]
            } else {
                this.dragging = false
                this.draggingDepictions = []
                //this.selectionStart = gridPos.round()
                this.selectionStart = gridPos
            }

        }

    }

    onMouseup(pos:Vec2) {


        if(this.dragging) {
            this.dragging = false
            this.draggingDepictions = []
        }

        if(this.layoutEditor.isProposingLayout()) {


            /*
            let pR = this.proposingResult

            if(pR !== null) {
                this.draggingDepictions = this.draggingDepictions.map((drag) => {
                    let d = drag.depiction.toDepiction(this.layoutEditor.layout)
                    for(let r of pR.replacements) {
                        if(r.old === d) {
                            return {
                                depiction: new DepictionRefByChain(r.new),
                                dragOffset: drag.dragOffset
                            }
                        }
                    }
                    return drag
                })
            }*/

            this.layoutEditor.acceptProposedLayout()



            this.proposingResult = null
            
            this.app.update()

            return
        }


        var transform:Matrix = this.layoutEditor.getTransform().invert()

        const mouseGridPos = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize))

        const selection:Rect|null = this.getSelectionRect()

        this.selectionStart = null

        if(selection !== null && selection.width() > 1 && selection.height() > 1) {

            this.layoutEditor.selectInRect(selection)

        } else {

            const layout:Layout = this.layoutEditor.layout

            const clicked:Depiction|null = layout.getTopIntersectingDepiction(mouseGridPos, true)

            if(clicked === null) {
                this.layoutEditor.deselectAll()
                this.layoutEditor.onSelectDepictions.fire([])
                this.update()
                return
            }

            if(clicked instanceof LabelDepiction) {

                this.onClickLabel(clicked)

            } else {

                this.onClickDepiction(clicked)
            
            }

        }

        this.update()

    }

    onMouseout(pos:Vec2) {

        this.selectionStart = null
        this.update()


    }

    onClick(pos:Vec2) {

        this.app.closeContextMenu()

    }

    onRightClick(offset:Vec2, absPos:Vec2) {

        const layoutPos:Vec2 = offset.divide(this.layoutEditor.layout.gridSize)

        var transform:Matrix = this.layoutEditor.getTransform().invert()
        const gridPos:Vec2 = transform.transformVec2(offset.divide(this.layoutEditor.layout.gridSize))

        let selection:Depiction[] = this.layoutEditor.getSelection(this.layoutEditor.layout)

        let clickedSelection = false

        for(let depiction of selection)  {
            if(depiction.absoluteBoundingBox.intersectsPoint(layoutPos)) {
                this.app.openContextMenu(new LayoutEditorContextMenu(this.layoutEditor, absPos, selection))
                clickedSelection = true
                break
            }
        }

        if(!clickedSelection) {
            this.layoutEditor.deselectAll()

            const depiction:Depiction|null = this.layoutEditor.layout.getTopIntersectingDepiction(gridPos, true)

            if(depiction) {
                this.app.openContextMenu(new LayoutEditorContextMenu(this.layoutEditor, absPos, [ depiction ]))
            } else {
                this.app.openContextMenu(new LayoutEditorContextMenu(this.layoutEditor, absPos, []))
            }
        }
    }

    onWheel(spin:Vec2) {

        this.layoutEditor.scaleFactor = Math.max(this.layoutEditor.scaleFactor + (spin.y * 0.2), 0.2)

        assert(!isNaN(this.layoutEditor.scaleFactor))

        this.app.update()
    }

    private onClickLabel(label:LabelDepiction) {

        //console.log('clicked label')

        const layout:Layout = this.layoutEditor.layout

        const labelFor:Depiction|null = label.parent

        if(!labelFor) {
            throw new Error('label must have parent')
        }

        if(labelFor.isExpandable) {

            labelFor.toggleOpacity()
            this.app.update()

        }
    }

    private onClickDepiction(depiction:Depiction) {

        this.layoutEditor.selectedDepictions.length = 0
        this.layoutEditor.selectedDepictions.push(new DepictionRef(depiction))
        this.layoutEditor.onSelectDepictions.fire([ depiction ])
        this.update()

    }

}


function onMousemove(data) {

    const { overlay, offsetX, offsetY } = data
    
    overlay.onMousemove(Vec2.fromXY(offsetX, offsetY))
}

function onMousedown(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMousedown(Vec2.fromXY(offsetX, offsetY))
}

function onMouseup(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMouseup(Vec2.fromXY(offsetX, offsetY))
}

function onMouseout(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onMouseout(Vec2.fromXY(offsetX, offsetY))
}

function onClick(data) {

    const { overlay, offsetX, offsetY } = data

    overlay.onClick(Vec2.fromXY(offsetX, offsetY))
}

function onRightClick(data) {

    const { overlay, offsetX, offsetY, x, y } = data

    overlay.onRightClick(Vec2.fromXY(offsetX, offsetY), Vec2.fromXY(x, y))

}

function onWheel(data) {

    const { overlay, spinX, spinY } = data

    overlay.onWheel(Vec2.fromXY(spinX, spinY))
}

function onGestureStart(data) {

}

function onGestureChange(data) {

}

function onGestureEnd(data) {

}



