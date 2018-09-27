import  { SXIdentified, SXInteraction }  from "sbolgraph"

import LabelDepiction from 'biocad/cad/LabelDepiction';
import Depiction, { Opacity } from 'biocad/cad/Depiction';
import { Vec2 } from 'jfw/geom';
import { VNode, svg, active } from 'jfw/vdom';

import { View } from 'jfw/ui'
import LayoutEditor from "biocad/cad/LayoutEditor";

import { mousemove as mousemoveEvent, click as clickEvent, mousewheel as wheelEvent, gesture as gestureEvent, contextMenu as contextMenuEvent, drag } from 'jfw/event'
import Layout from "biocad/cad/Layout";

import renderHandles from './renderHandles'
import Matrix from "jfw/geom/Matrix";
import Rect from "jfw/geom/Rect";
import BiocadApp from "biocad/BiocadApp";
import Droppable from "biocad/droppable/Droppable";
import SBOLDroppable from "biocad/droppable/SBOLDroppable";

import { SBOLXGraph, SXComponent, SBOLXCopier, SXSubComponent } from "sbolgraph"
import LayoutEditorContextMenu from "biocad/cad/LayoutEditorContextMenu";
import DepictionPOD from "biocad/cad/DepictionPOD";
import BackboneDepiction from 'biocad/cad/BackboneDepiction';
import ComponentDepiction from 'biocad/cad/ComponentDepiction';

import assert from 'power-assert'
import Instruction from "biocad/cad/layout-instruction/Instruction";
import ReplaceInstruction from "biocad/cad/layout-instruction/ReplaceInstruction";
import { Predicates } from "bioterms";
import LabelledDepiction from "./LabelledDepiction";
import { Specifiers } from "bioterms/Specifiers";
import DND, { DNDResult } from "./dnd-action/DND";
import DNDTwoBlackboxesMakeConstraint from "./dnd-action/DNDTwoBlackboxesMakeConstraint";
import DNDMoveInWorkspace from "./dnd-action/DNDMoveInWorkspace";
import DNDEnterWorkspace from "./dnd-action/DNDEnterWorkspace";
import DNDEnterParent from "./dnd-action/DNDEnterParent";
import ABInteractionDepiction from "./ABInteractionDepiction";
import DepictionRef from "./DepictionRef";

export default class LayoutEditorOverlay extends View {

    mouseGridPos: Vec2 = Vec2.fromXY(-1, -1)
    layoutEditor:LayoutEditor


    selectionStart:Vec2|null

    dragging:boolean
    draggingDepictions:{depiction:DepictionRef, dragOffset:Vec2}[]


    displayRect:Rect|null


    proposingResult:DNDResult|null


    dnd:Array<DND>

    proposingConnectionFrom:Depiction|undefined

    constructor(layoutEditor:LayoutEditor) {

        super(layoutEditor.app)
        
        this.layoutEditor = layoutEditor


        this.proposingResult = null



        this.displayRect = null

        this.draggingDepictions = []

        this.selectionStart = null


        this.dnd = []
        this.dnd.push(new DNDTwoBlackboxesMakeConstraint())
        this.dnd.push(new DNDEnterParent())
        this.dnd.push(new DNDEnterWorkspace())
        this.dnd.push(new DNDMoveInWorkspace())

        const app:BiocadApp = this.app as BiocadApp
        app.dropOverlay.addReceiver(this)
        // TODO removing rdeiver?

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
        const gridPos:Vec2 = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize).round())

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

        if(! (depiction instanceof LabelledDepiction)) {
            throw new Error('???')
        }

        let labelled = depiction.getLabelled()

        let newSize = labelled.size.add(Vec2.fromXY(
            (- dL) + dR,
            (- dT) + dB
        ))
        
        if (newSize.x !== depiction.size.x) {
            labelled.minSize = Vec2.fromXY(newSize.x, labelled.minSize.y)
            stuffChanged = true
        }

        if (newSize.y !== depiction.size.y) {
            labelled.minSize = Vec2.fromXY(labelled.minSize.x, newSize.y)
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

        //console.log('llamas')

        if(stuffChanged)
            labelled.touch()

        this.app.update()
        

    }

    render():VNode {

        const layout:Layout = this.layoutEditor.proposedLayout
                ? this.layoutEditor.proposedLayout : this.layoutEditor.layout


        const handles:VNode[] = []

        var transform:Matrix = this.layoutEditor.getTransform()


        const mappings:VNode[] = []

        if(this.selectionStart === null) {

            const hovering:Depiction|null = layout.getTopIntersectingDepiction(this.mouseGridPos, true)

            if(hovering) {

                handles.push(renderHandles(transform.transformRect(hovering.absoluteBoundingBox.multiply(layout.gridSize)), true, hovering.isResizeable(), (pos:Vec2, dimensions:string[]) => {
                    this.resize(hovering, pos, dimensions)
                }))

                let hoveringThing = hovering.depictionOf

                if(hoveringThing && hoveringThing instanceof SXSubComponent) {

                    let sc = hoveringThing as SXSubComponent

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

            if(intersects && intersects instanceof LabelledDepiction) {
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

            const selectionRect:Rect = transform.transformRect(_selectionRect.round().multiply(layout.gridSize))

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

            const newUri:string = SBOLXCopier.copy(droppable.graph, app.graph, droppable.uri, 'http://fooprefix/')

            const layout:Layout = this.layoutEditor.layout

            layout.syncAllDepictions(5)

            const depiction:Depiction|undefined = layout.getDepictionsForUri(newUri)[0]

            if(depiction === undefined)
                throw new Error('???')

            depiction.offsetExplicit = true
            depiction.offset = offset.divide(this.layoutEditor.layout.gridSize).round()

            layout.configurate([])

        }


    }


    onMousemove(pos:Vec2) {

        var transform:Matrix = this.layoutEditor.getTransform().invert()

        this.mouseGridPos = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize))




        for(let i = 0; i < this.draggingDepictions.length; ++ i) {

            let dragging = this.draggingDepictions[i]

            let draggingDepiction = dragging.depiction.toDepiction(this.layoutEditor.layout)

            if(!draggingDepiction) {
                continue
            }

            let newRect = Rect.fromPosAndSize(
                this.mouseGridPos.subtract(dragging.dragOffset).round(),
                draggingDepiction.size
            )

            // TODO not good with multipole depictins selected
            for(let dnd of this.dnd) {

                let result = dnd.test(this.layoutEditor.layout,
                        this.layoutEditor.layout.graph,
                        this.layoutEditor.layout,
                        this.layoutEditor.layout.graph, 
                        draggingDepiction,
                        newRect)

                if(result) {

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


        let newDND = false

        for(let dnd of this.dnd) {

            let result = dnd.test(_droppable.layout,
                    _droppable.graph,
                    this.layoutEditor.layout,
                    this.layoutEditor.layout.graph, 
                    _droppable.layout.getRootDepictions()[0],
                    rect)

            if(result) {

                console.log('got dnd result')

                this.proposingResult = result

                if(result.newLayout) {
                    this.layoutEditor.proposeLayout(result.newLayout)
                }


                newDND = true

                break
            }

        }


        if(!newDND) {
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
                let fOf = from.depictionOf
                let tOf = to.depictionOf
                let id = 'someinteraction'
                let type = Specifiers.SBO.Stimulation
                let ourrole = Specifiers.SBO.Stimulator
                let theirrole = Specifiers.SBO.Stimulated
                let interaction:SXInteraction|null = null
                let wrapper:SXComponent|null = null
                if(fOf instanceof SXComponent) {
                    if(tOf instanceof SXComponent) {
                        // from component to component
                        wrapper = fOf.wrap()
                        wrapper.setBoolProperty('http://biocad.io/terms/untitled', true)
                        wrapper.createSubComponent(tOf)
                        let scA = wrapper.subComponents[0]
                        let scB = wrapper.subComponents[1]
                        interaction = scA.createInteractionWith(scB, id, type, ourrole, theirrole)
                    } else if(tOf instanceof SXSubComponent) {
                        // from component to subcomponent
                        let scA = tOf.containingComponent.createSubComponent(fOf)
                        interaction = scA.createInteractionWith(tOf, id, type, ourrole, theirrole)
                    } else {
                        throw new Error('???')
                    }
                } else if(fOf instanceof SXSubComponent) {
                    if(tOf instanceof SXComponent) {
                        // from subcomponent to component
                        let scB = fOf.containingComponent.createSubComponent(tOf)
                        interaction = fOf.createInteractionWith(scB, id, type, ourrole, theirrole)
                    } else if(tOf instanceof SXSubComponent) {
                        // from subcomponent to subcomponent
                        if(tOf.containingComponent === fOf.containingComponent) {
                            interaction = fOf.createInteractionWith(tOf,id, type, ourrole, theirrole)
                        }
                    } else {
                        throw new Error('???')
                    }
                } else {
                    throw new Error('???')
                }
                    
                this.proposingConnectionFrom = undefined

                this.layoutEditor.deselectAll()

                if(interaction) {
                    this.layoutEditor.layout.syncAllDepictions(5)

                    if(wrapper) {
                        let wrapperD = this.layoutEditor.layout.getDepictionsForUri(wrapper.uri)[0]

                        if(!wrapperD) {
                            throw new Error('???')
                        }

                        wrapperD.offsetExplicit = from.offsetExplicit
                        wrapperD.offset = from.offset
                    }
                    this.layoutEditor.layout.configurate([])
                }
            }
        }

        if(this.layoutEditor.selectionContainsPoint(layout, gridPos)) {

            const selection:Depiction[] = this.layoutEditor.getSelection(layout)

            this.draggingDepictions = []

            for(let d of selection) {

                this.draggingDepictions.push({
                    depiction: new DepictionRef(d),
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
                        depiction: new DepictionRef(depiction),
                        dragOffset: gridPos.subtract(depiction.absoluteOffset)
                    }
                ]
            } else {
                this.dragging = false
                this.draggingDepictions = []
                this.selectionStart = gridPos.round()
            }

        }

    }

    onMouseup(pos:Vec2) {


        if(this.layoutEditor.isProposingLayout()) {

            this.layoutEditor.acceptProposedLayout()

            this.proposingResult = null
            
            this.app.update()

            return
        }


        var transform:Matrix = this.layoutEditor.getTransform().invert()

        const mouseGridPos = transform.transformVec2(pos.divide(this.layoutEditor.layout.gridSize))


        if(this.dragging) {
            this.dragging = false
            this.draggingDepictions = []
        }

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



