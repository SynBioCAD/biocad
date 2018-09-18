
import View from 'jfw/ui/View'
import BiocadApp from "biocad/BiocadApp";
import { SXComponent } from "sbolgraph"
import { VNode, h } from "jfw/vdom";
import Layout from "biocad/cad/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import Vec2 from "jfw/geom/Vec2";
import Rect from "jfw/geom/Rect";

export default class InspectComponentThumbnailView extends View {

    layout:Layout
    thumb:LayoutThumbnail

    constructor(app:BiocadApp, component:SXComponent) {

        super(app)

        this.layout = new Layout(component.graph)
        this.layout.gridSize = Vec2.fromXY(8, 8)
        this.layout.syncAllDepictions(5)
        this.layout.configurate([])

        this.thumb = new LayoutThumbnail(app, this.layout)
    }

    render():VNode {

        var bbox:Rect|null = this.layout.getBoundingBox()
        
        if(bbox === null)
            return h('div', 'no bbox')

        bbox = bbox.multiply(this.layout.gridSize)

        return h('div', {
            style: {
                'background-color': 'white',
                'width': bbox.width() + 'px',
                'height': bbox.height() + 'px',
                padding: '16px',
                'border-radius': '8px'
            }
        }, [
            this.thumb.render()
        ])

    }

}