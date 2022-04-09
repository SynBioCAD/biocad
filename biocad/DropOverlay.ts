
import { S3Identified } from "sbolgraph"

import { h, VNode } from "@biocad/jfw/vdom";
import { Graph } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import BiocadApp from "biocad/BiocadApp";
import assert = require('assert')
import { MouseListener } from '@biocad/jfw/util'
import { Vec2, Rect } from '@biocad/jfw/geom'

import { contextMenu as contextMenuEvent, click as clickEvent } from '@biocad/jfw/event'
import Depiction from "biocad/cad/Depiction";

import Droppable from './droppable/Droppable'
import SBOLDroppable from "biocad/droppable/SBOLDroppable";

import DropReceiver from './DropReceiver'

export enum FinalizeEvent {
    MouseDown,
    MouseUp
}

export default class DropOverlay {

    private currentDroppable:Droppable|null

    app:BiocadApp

    receivers:DropReceiver[]

    hidden:boolean

    startTime:number

    finalizeEvent:FinalizeEvent

    constructor(app:BiocadApp) {

        this.app = app

        this.receivers = []

        this.hidden = false

        this.finalizeEvent = FinalizeEvent.MouseDown
    }

    addReceiver(receiver:DropReceiver) {

        if(this.receivers.indexOf(receiver) === -1) {
            this.receivers.push(receiver)
        }

    }

    removeReceiver(receiver:DropReceiver) {

        for(var i = 0; i < this.receivers.length; ++ i) {

            if(this.receivers[i] === receiver) {

                this.receivers.splice(i, 1)
                break

            }

        }

    }

    render():VNode {

        const elements:any[] = []

        if(this.currentDroppable) {
            elements.push(h('div', {
                style: {
                    position: 'absolute',
                    left: MouseListener.mousePos.x + 'px',
                    top: MouseListener.mousePos.y + 'px',
                    transform: 'translateX(-50%) translateY(-50%)',
                    'pointer-events': 'none'
                }
            }, [
                this.currentDroppable.render()
            ]))
        }

        const attr = {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                'z-index': 9999,
            }
        }

        if(this.currentDroppable) {

            if(this.hidden)
                attr.style['opacity'] = '0'

            attr.style['cursor'] = 'none'
            attr['ev-contextmenu'] = contextMenuEvent(onRightClick, { overlay: this })
            attr['ev-mousedown'] = clickEvent(onMouseDown, { overlay: this })
            attr['ev-mouseup'] = clickEvent(onMouseUp, { overlay: this })
        } else {
            attr.style['pointer-events'] = 'none'
        }

        return h('div.sf-drop-overlay', attr, elements)
    }

    startDropping(droppable:Droppable) {

        assert(!this.currentDroppable)

        this.startTime = new Date().getTime()

        this.unhide()

        this.currentDroppable = droppable

        let hasMoved = false

        let move = () => {

            hasMoved = true

            for(let receiver of this.receivers) {
                receiver.onDroppableMoved(MouseListener.mousePos, droppable)
            }

            this.app.update()
        }

        MouseListener.listen('DropOverlay', () => {

            move()

        })

        move()
    }

    cancelDrop():void {

        if(this.currentDroppable) {
            this.currentDroppable = null
            MouseListener.unlisten('DropOverlay')
            this.app.update()
        }
    }

    getCurrentDroppable():Droppable|null {

        return this.currentDroppable

    }

    hide():void {

        if(!this.hidden) {
            this.hidden = true
            this.app.update()
        }

    }

    unhide():void {

        if(this.hidden) {
            this.hidden = false
            this.app.update()
        }

    }

    setFinalizeEvent(finalizeEvent:FinalizeEvent) {
        console.log('finalizeEvent' + finalizeEvent)
        this.finalizeEvent = finalizeEvent
    }


}

function onRightClick(data) {

    //console.log('right click')

    const overlay:DropOverlay = data.overlay

    overlay.cancelDrop()

}

function onMouseUp(data) {

    const overlay:DropOverlay = data.overlay

    let t = new Date().getTime()

    if((t - overlay.startTime) > 500) {

        if(overlay.finalizeEvent === FinalizeEvent.MouseUp) {
            drop(data)
        }
    } else {

        overlay.finalizeEvent = FinalizeEvent.MouseDown
    }
}

function onMouseDown(data) {

    const overlay:DropOverlay = data.overlay

    if(overlay.finalizeEvent === FinalizeEvent.MouseDown) {
        drop(data)
    }
}

function drop(data) {

    const pos:Vec2 = Vec2.fromXY(data.x, data.y)

    const overlay:DropOverlay = data.overlay

    const dropping:Droppable|null = overlay.getCurrentDroppable()

    const app:BiocadApp = overlay.app as BiocadApp

    //console.log('drop overlay onclick, dropping ' + dropping)

    if(dropping) {

        let effectivePos = pos.subtract(dropping.getSize().multiplyScalar(0.5))

        for(let receiver of overlay.receivers) {

            const rect:Rect|null = receiver.getDropZone()

            if(rect !== null) {

                if(rect.intersectsPoint(effectivePos)) {

                    receiver.receiveDroppable(effectivePos.subtract(rect.topLeft), dropping)

                }


            }

        }

        overlay.cancelDrop()

    }
}
