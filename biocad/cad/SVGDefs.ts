
import { svg, VNode } from "jfw/vdom";

export default class SVGDefs {

    static render():VNode {

        return svg('defs', [

            svg('marker', {
                id: 'sfProductionArrowhead',
                markerWidth: 6,
                markerHeight: 6,
                refX: 0,
                refY: 3,
                orient: 'auto-start-reverse',
            }, [
                svg('path', {
                    d: 'M0,1L0,5L5,3z',
                    stroke: 'black',
                    'stroke-linejoin': 'miter',
                    fill: 'black'
                })
            ]),

            svg('marker', {
                id: 'sfInductionArrowhead',
                markerWidth: 6,
                markerHeight: 6,
                refX: 0,
                refY: 3,
                orient: 'auto-start-reverse',
            }, [
                svg('path', {
                    d: 'M0,1L0,5L5,3z',
                    stroke: 'black',
                    'stroke-linejoin': 'miter',
                    fill: 'none'
                })
            ]),

            svg('marker', {
                id: 'sfRepressionArrowhead',
                markerWidth: 6,
                markerHeight: 6,
                refX: 0,
                refY: 3,
                orient: 'auto-start-reverse',
            }, [
                svg('path', {
                    d: 'M0,0L0,7',
                    stroke: 'black',
                    'stroke-linejoin': 'miter',
                    'stroke-width': '2',
                    fill: 'none'
                })
            ])
        ])

    }


}