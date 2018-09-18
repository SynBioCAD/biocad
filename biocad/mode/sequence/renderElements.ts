

import { svg, VNode } from 'jfw/vdom'
import { Matrix, Vec2 } from 'jfw/geom'
import SequenceEditorLine from "biocad/mode/sequence/SequenceEditorLine";

export default function renderElements(sequenceEditor) {

    const renderState = sequenceEditor.currentRenderState


    const {

        marginWidth,
        paddingTop,
        charSize,
        charsPerRow,
        elements,
        lines

    } = renderState

    const res:VNode[] = []

    lines.forEach((line:SequenceEditorLine) => {

        for(var i = 0; i < charsPerRow; ++ i) {

            let offset = line.bbox.topLeft.add(Vec2.fromXY(i * charSize, 0))
            let offsetBelow = offset.add(Vec2.fromXY(0, sequenceEditor.paddingBetweenStrands + charSize))

            switch(elements[line.seqOffset + i]) {

                case 'a':
                case 'A':
                    res.push(renderA(offset, false))
                    res.push(renderT(offsetBelow, true))
                    break
                case 't':
                case 'T':
                    res.push(renderT(offset, false))
                    res.push(renderA(offsetBelow, true))
                    break
                case 'c':
                case 'C':
                    res.push(renderC(offset, false))
                    res.push(renderG(offsetBelow, true))
                    break
                case 'g':
                case 'G':
                    res.push(renderG(offset, false))
                    res.push(renderC(offsetBelow, true))
                    break
            }

        }

    })

    return res
}

function renderA(offset, fade) {

    var transform = new Matrix()
    transform = transform.translate(offset)

    return svg('use', {
        'xlink:href': fade ? '#nucleotide-faded-a' : '#nucleotide-a',
        transform: transform.toSVGString()
    })
}

function renderT(offset, fade) {

    var transform = new Matrix()
    transform = transform.translate(offset)

    return svg('use', {
        'xlink:href': fade ? '#nucleotide-faded-t' : '#nucleotide-t',
        transform: transform.toSVGString()
    })
}

function renderC(offset, fade) {

    var transform = new Matrix()
    transform = transform.translate(offset)

    return svg('use', {
        'xlink:href': fade ? '#nucleotide-faded-c' : '#nucleotide-c',
        transform: transform.toSVGString()
    })
}

function renderG(offset, fade) {

    var transform = new Matrix()
    transform = transform.translate(offset)

    return svg('use', {
        'xlink:href': fade ? '#nucleotide-faded-g' : '#nucleotide-g',
        transform: transform.toSVGString()
    })

}


