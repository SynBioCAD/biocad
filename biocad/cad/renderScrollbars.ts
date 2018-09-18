import { Vec2 } from 'jfw/geom';


import LayoutEditor from "biocad/cad/LayoutEditor";
import { VNode, h } from "jfw/vdom";
import Layout from "biocad/cad/Layout";
import Rect from "jfw/geom/Rect";

import { drag as dragHandler } from 'jfw/event'

export default function renderScrollbars(layoutEditor:LayoutEditor): VNode[] {

    const layout:Layout = layoutEditor.layout
    const gridBoundingBox:Rect|null = layout.getBoundingBox()
    const scrollbarThickness:number = layoutEditor.scrollbarSize
    const scrollOffset:Vec2 = layoutEditor.scrollOffset

    const elements:any[] = []

    if (gridBoundingBox !== null) {

        const boundingBox:Rect = gridBoundingBox.multiply(layoutEditor.layout.gridSize)

        const scrollOffsetNormalized:Vec2 = scrollOffset.divide(boundingBox.size())

        const viewportSizeCSS = {
            x: '100%',
            y: '100%'
        }

        const scrollbarThicknessCSS = scrollbarThickness + 'px'

        const scrollbarSizeCSS = {
            x: `calc(${viewportSizeCSS.x} - ${scrollbarThicknessCSS})`,
            y: `calc(${viewportSizeCSS.y} - ${scrollbarThicknessCSS})`
        }

        const scrollOffsetBeginCSS = {
            x: (scrollOffsetNormalized.x * 100) + '%'
        }

        const viewportSizePxCSS = {
            //x: 'calc(~' + scrollOffsetBeginCSS.x + ' + (100% / ' + boundingBox.size().x + '))'
            //x: `calc(0px - (0px - 100%))`
            x: '100%'
        }

        const viewportSizeDivDesignSizeCSS = {
            //x: 'calc(~' + scrollOffsetBeginCSS.x + ' + (100% / ' + boundingBox.size().x + '))'
            x: `calc(100% - ((${scrollOffsetBeginCSS.x} + ${viewportSizePxCSS.x}) / ${boundingBox.size().x}) * 100)`
        }

        elements.push(h('div.sf-circuit-view-scrollbar.sf-circuit-view-horizontal-scrollbar', {
            style: {
                position: 'absolute',
                top: 0,
                left: scrollbarThicknessCSS,
                width: scrollbarSizeCSS.x,
                height: scrollbarThicknessCSS
            }
        }, [
            h('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: scrollOffsetBeginCSS.x,
                    'background-color': 'red',
                    height: scrollbarThicknessCSS,
                    width: viewportSizeDivDesignSizeCSS.x
                },
                'ev-mousedown': dragHandler(onDragHorizontal, { layoutEditor: layoutEditor })
            })
        ]))






/*
        elements.push(h('div.sf-circuit-view-scrollbar.sf-circuit-view-vertical-scrollbar', {
            style: {
                position: 'absolute',
                left: 0,
                top: scrollbarSize + 'px',
                height: '100%',
                width: scrollbarSize + 'px'
            }
        }, [
            h('div', {
                style: {
                    position: 'absolute',
                    top: (scrollOffsetNormalized.y * 100) + '%',
                    left: 0,
                    'background-color': 'red',
                    width: scrollbarSize + 'px',
                    height: '16px'
                }
            })
        ]))*/


    }

    return elements

    /*return h('div', {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    }, elements)*/
}

function onDragHorizontal(data) {

    const dragState:string = data.dragState
    const layoutEditor:LayoutEditor = data.layoutEditor
    const x:number = data.x

    const layout:Layout = layoutEditor.layout

    const layoutBBox:Rect|null = layout.getBoundingBox()

    if(layoutBBox !== null) {


        const bboxPx = layoutBBox.multiply(layoutEditor.layout.gridSize)

        layoutEditor.scrollOffset = Vec2.fromXY(layoutEditor.scrollOffset.x + x, layoutEditor.scrollOffset.y)

        layoutEditor.scrollOffset = layoutEditor.scrollOffset.max(bboxPx.topLeft)
        layoutEditor.scrollOffset = layoutEditor.scrollOffset.min(bboxPx.bottomRight)
,
        layoutEditor.app.update()
    }

}