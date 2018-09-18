
import { svg, VNode } from 'jfw/vdom'
import SequenceEditorLine from "biocad/mode/sequence/SequenceEditorLine";

export default function renderLineNumbers(sequenceEditor) {

    const renderState = sequenceEditor.currentRenderState

    const {

        charSize,
        charsPerRow,
        lines

    } = renderState


    const svgElements:VNode[] = []

    var i = 0

    lines.forEach((line:SequenceEditorLine) => {

        const n = i * charsPerRow

        svgElements.push(svg('text', {
            x: 0,
            y: line.bbox.topLeft.y + charSize / 2,
            'font-family': 'monospace',
            'dominant-baseline': 'middle',
            fill: sequenceEditor.darkMode ? 'white' : 'black'
        }, leftPad(n)))

        ++ i

    })

    return svgElements
}

function leftPad(n) {

    n = '' + n

    const s = '00000'

    return s.slice(n.length) + n

}

