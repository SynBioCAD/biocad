
import { View } from '@biocad/jfw/ui';
import BiocadApp from "biocad/BiocadApp";
import { S3Component } from "sbolgraph"
import { VNode, h } from "@biocad/jfw/vdom";
import Layout from "biocad/cad/layout/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import { Vec2 } from "@biocad/jfw/geom";
import { Rect } from "@biocad/jfw/geom";

export default class InspectComponentThumbnailView extends View {

    layout:Layout
    thumb:LayoutThumbnail

    constructor(app:BiocadApp, component:S3Component) {

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