

import { h, main, diff, patch, create } from 'jfw/vdom'

import RenderContext from './RenderContext'
import { Vec2 } from "jfw/geom";
import Rect from "jfw/geom/Rect";

import { drag as dragHandler } from 'jfw/event'
import Layout from "biocad/cad/Layout";
import BiocadApp from "biocad/BiocadApp";

import assert from 'power-assert'

const scrollbarThickness = 16

export default class ScrollbarWidget {

    _stateToken:object
    _mainLoop:any

    app:BiocadApp
    viewportSize:Vec2 = Vec2.fromXY(0, 0)
    renderContext:RenderContext
    isFirstRender:boolean

    constructor(app:BiocadApp, renderContext:RenderContext) {

        this.app = app
        this.renderContext = renderContext
        this._stateToken = { ref: this }
        this.isFirstRender = false

    }

    init():void {

        //console.log('init scrollbar widget')

        this.isFirstRender = true

        const render = (stateToken) => {
            return stateToken.ref.render()
        }

        this._mainLoop = main(this._stateToken, render, {
            diff: diff,
            create: create,
            patch: patch
        })

        return this._mainLoop.target
    }

    render():any {

        if(this.viewportSize.x === 0 && this.viewportSize.y === 0) {
            setTimeout(() => this.app.update(), 0)
            return h('div', '')
        }

        const renderContext = this.renderContext

        const scrollOffset = renderContext.scrollOffset
        const horizScrollbarWidth = this.viewportSize.x - scrollbarThickness
        const vertScrollbarHeight = this.viewportSize.y - scrollbarThickness

        var designBBox:Rect|null = renderContext.layout.getBoundingBox()

        if(designBBox === null) {
            designBBox = Rect.fromPosAndSize(Vec2.fromXY(0, 0), this.viewportSize.divide(renderContext.layout.gridSize))
        }

        const designSize = designBBox.size().multiply(renderContext.layout.gridSize)

        const viewportSizeNormalized = this.viewportSize.divide(designSize).divideScalar(renderContext.scaleFactor)

        const scrollOffsetNormalized = scrollOffset.divide(designSize)

        if(this.isFirstRender) {

            this.isFirstRender = false

            const fitFactors = this.viewportSize.divide(designSize)

            renderContext.scaleFactor = Math.min(fitFactors.x, fitFactors.y, 1.0)
        
            assert(!isNaN(renderContext.scaleFactor))

            this.app.update()
        }



        return h('div.jfw-flow-grow', {
        }, [
            h('div.sf-circuit-view-scrollbar.sf-circuit-view-horizontal-scrollbar', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: scrollbarThickness + 'px',
                    width: horizScrollbarWidth + 'px',
                    height: scrollbarThickness + 'px'
                }
            }, [
                h('div', {
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: (scrollOffsetNormalized.x * horizScrollbarWidth) + 'px',
                        height: scrollbarThickness + 'px',
                        width: (viewportSizeNormalized.x * horizScrollbarWidth) + 'px',
                    },
                    'ev-mousedown': dragHandler(onDragHorizontal, { renderContext: renderContext, widget: this })
                })
            ]),

            h('div.sf-circuit-view-scrollbar.sf-circuit-view-vertical-scrollbar', {
                style: {
                    position: 'absolute',
                    left: 0,
                    top: scrollbarThickness + 'px',
                    height: vertScrollbarHeight + 'px',
                    width: scrollbarThickness + 'px'
                }
            }, [
                h('div', {
                    style: {
                        position: 'absolute',
                        left: 0,
                        top: (scrollOffsetNormalized.y * vertScrollbarHeight) + 'px',
                        width: scrollbarThickness + 'px',
                        height: (viewportSizeNormalized.y * vertScrollbarHeight) + 'px',
                    },
                    'ev-mousedown': dragHandler(onDragVertical, { renderContext: renderContext, widget: this })
                })
            ]),

        ])
    }

    update(prev:ScrollbarWidget, elem:HTMLElement):void {

        //elem.innerHTML = 'Content set directly on real DOM node, by widget ' +
        //'<em>after</em> update.'

        if(this.renderContext !== prev.renderContext)
            return this.init()

        this.renderContext = prev.renderContext
        this._mainLoop = prev._mainLoop
        this.isFirstRender = prev.isFirstRender

        const parent:Node|null = elem.parentNode

        if(parent !== null) {

            const viewportSize:Vec2 = Vec2.fromXY(
                (parent as HTMLElement).offsetWidth,
                (parent as HTMLElement).offsetHeight
            )

            this.viewportSize = viewportSize
        }

        this._stateToken = { ref: this }
        this._mainLoop.update(this._stateToken)
    }
}

ScrollbarWidget.prototype['type'] = 'Widget'

function onDragHorizontal(data) {

    const dragState:string = data.dragState
    const renderContext:RenderContext = data.renderContext
    const xScroll:number = data.x

    const layout:Layout = renderContext.layout

    const layoutBBox:Rect|null = layout.getBoundingBox()

    const widget:ScrollbarWidget = data.widget


    const horizScrollbarWidth = widget.viewportSize.x - scrollbarThickness

    if(layoutBBox !== null) {

        const bboxPx = layoutBBox.multiply(renderContext.layout.gridSize)

        // thats the x in unscaled coords
        const x = ((xScroll / horizScrollbarWidth) * bboxPx.size().x)

        renderContext.scrollOffset = Vec2.fromXY(x, renderContext.scrollOffset.y)

        renderContext.scrollOffset = renderContext.scrollOffset.max(Vec2.zero())

// when we zoom in that gets smaller, its the number of design px we can actually see
        const f = widget.viewportSize.divideScalar(renderContext.scaleFactor)

        const bound = bboxPx.size().subtract(f)

        if(renderContext.scrollOffset.x > bound.x)
            renderContext.scrollOffset = Vec2.fromXY(bound.x, renderContext.scrollOffset.y)

        //update()
        
        widget.app.update()
    }

}

function onDragVertical(data) {

    const dragState:string = data.dragState
    const renderContext:RenderContext = data.renderContext
    const yScroll:number = data.y

    const layout:Layout = renderContext.layout

    const layoutBBox:Rect|null = layout.getBoundingBox()

    const widget:ScrollbarWidget = data.widget


    const vertScrollbarWidth = widget.viewportSize.y - scrollbarThickness

    if(layoutBBox !== null) {


        const bboxPx = layoutBBox.multiply(renderContext.layout.gridSize)

        const y = (yScroll / vertScrollbarWidth) * bboxPx.size().y

        renderContext.scrollOffset = Vec2.fromXY(renderContext.scrollOffset.x, y)

        renderContext.scrollOffset = renderContext.scrollOffset.max(Vec2.zero())
        renderContext.scrollOffset = renderContext.scrollOffset.min(bboxPx.bottomRight.subtract(widget.viewportSize))

        //update()
        
        widget.app.update()
    }

}