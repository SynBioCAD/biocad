
import { svg } from '@biocad/jfw/vdom'
import { Matrix, Vec2 } from '@biocad/jfw/geom'

export default function renderDefs(sequenceEditor) {

    const renderState = sequenceEditor.currentRenderState

    const {

        charSize

    } = renderState

    return [
        svg('defs', [
            renderADef('nucleotide-a', sequenceEditor.darkMode ? 'white' : 'black', charSize),
            renderTDef('nucleotide-t', sequenceEditor.darkMode ? 'white' : 'black', sequenceEditor.charSize),
            renderCDef('nucleotide-c', sequenceEditor.darkMode ? 'white' : 'black', sequenceEditor.charSize),
            renderGDef('nucleotide-g', sequenceEditor.darkMode ? 'white' : 'black', sequenceEditor.charSize),
            renderADef('nucleotide-faded-a', sequenceEditor.darkMode ? '#AAA' : '#666', charSize),
            renderTDef('nucleotide-faded-t', sequenceEditor.darkMode ? '#AAA' : '#666', sequenceEditor.charSize),
            renderCDef('nucleotide-faded-c', sequenceEditor.darkMode ? '#AAA' : '#666', sequenceEditor.charSize),
            renderGDef('nucleotide-faded-g', sequenceEditor.darkMode ? '#AAA' : '#666', sequenceEditor.charSize),
        ])
    ]

}

function renderADef(id, fill, wh) {

    var transform = new Matrix()

    transform = transform.scale(Vec2.fromScalar(wh / 55.6))

    return svg('path', {
        id: id,
        'class': 'sf-sequence-editor-element',
        d: 'M23.4,1h8.8l16.4,53.6h-7.5l-3.9-14H18.4l-3.9,14H7L23.4,1z M27.8,7.4l-7.6,27.4h15.3L27.8,7.4z',
        transform: transform.toSVGString(),
        fill: fill
    })


}

function renderCDef(id, fill, wh) {

    var transform = new Matrix()

    transform = transform.scale(Vec2.fromScalar(wh / 55.6))

    return svg('path', {
        id: id,
        'class': 'sf-sequence-editor-element',
        d: 'M44.2,52.7c-1.8,1-3.7,1.7-5.7,2.2s-4,0.7-6.2,0.7c-6.9,0-12.2-2.4-16-7.3c-3.8-4.9-5.7-11.7-5.7-20.5' + 
		'c0-8.8,1.9-15.6,5.7-20.5c3.8-4.9,9.1-7.3,16-7.3c2.2,0,4.2,0.2,6.2,0.7c1.9,0.5,3.8,1.2,5.7,2.2v7.4c-1.8-1.5-3.7-2.6-5.7-3.3' + 
		'c-2-0.8-4.1-1.1-6.1-1.1c-4.7,0-8.2,1.8-10.6,5.5c-2.3,3.6-3.5,9.1-3.5,16.5c0,7.3,1.2,12.8,3.5,16.4c2.3,3.6,5.9,5.5,10.6,5.5' + 
		'c2.1,0,4.2-0.4,6.2-1.1c2-0.8,3.9-1.9,5.7-3.3V52.7z',
        transform: transform.toSVGString(),
        fill: fill
    })
}


function renderTDef(id, fill, wh) {

    var transform = new Matrix()

    transform = transform.scale(Vec2.fromScalar(wh / 55.6))

    return svg('path', {
        id: id,
        'class': 'sf-sequence-editor-element',
        d: 'M7.4,1h40.9v6.1H31.5v47.5h-7.3V7.1H7.4V1z',
        transform: transform.toSVGString(),
        fill: fill
    })
}

function renderGDef(id, fill, wh) {

    var transform = new Matrix()

    transform = transform.scale(Vec2.fromScalar(wh / 55.6))

    return svg('path', {
        id: id,
        'class': 'sf-sequence-editor-element',
        d: 'M45.3,50.2c-1.9,1.8-4.1,3.2-6.6,4.1c-2.4,0.9-5.1,1.4-7.9,1.4c-6.8,0-12.1-2.4-15.9-7.3c-3.8-4.9-5.7-11.7-5.7-20.5' +
		'c0-8.8,1.9-15.6,5.7-20.5c3.8-4.9,9.2-7.3,16-7.3c2.2,0,4.4,0.3,6.5,1c2.1,0.6,4,1.6,6,2.9v7.4c-1.9-1.8-3.9-3.2-6-4.1' +
		'c-2-0.9-4.2-1.3-6.5-1.3c-4.7,0-8.3,1.8-10.6,5.5c-2.4,3.6-3.5,9.1-3.5,16.5c0,7.4,1.1,13,3.4,16.5c2.3,3.6,5.8,5.4,10.5,5.4' +
		'c1.6,0,3-0.2,4.2-0.6c1.2-0.4,2.3-1,3.3-1.7V33h-7.8v-6h14.7V50.2z',
        transform: transform.toSVGString(),
        fill: fill
    })
}


