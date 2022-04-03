
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'
import extend = require('xtend')

import sbolvFont from './font/sbolv'
import protlangFont from './font/protlang'
import tbtFont from './font/tbt'

var fonts = [
    sbolvFont,
    protlangFont,
    tbtFont
]

function glyphAndUriFromType(type) {

    for(var i = 0; i < fonts.length; ++ i) {

        var font = fonts[i]

        var uri = font.prefix + type

        var glyph = font.mapping[uri]

        if(glyph) {

            return {
                uri: uri,
                glyph: glyph
            }

        }

    }

    return { uri: 'http://biocad.io/font/sbolv/user_defined', glyph: fonts[0].mapping['http://biocad.io/font/sbolv/user_defined'] }

    //throw new Error('no glyph for ' + type)
}

function glyphScaleFromType(type) {

    const glyphAndUri = glyphAndUriFromType(type)

    if(glyphAndUri === undefined)
        return

    return glyphAndUri.glyph.scale || Vec2.fromXY(1.0, 1.0)



}


function glyphFromUri(uri) {

    for(var i = 0; i < fonts.length; ++ i) {

        var font = fonts[i]

        var glyph = font.mapping[uri]

        if(glyph) {

            return glyph

        }

    }

    return glyphAndUriFromType('user-defined').glyph
}


function renderGlyph(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    if(glyph.hasLabel && !glyphInfo.label)
        glyphInfo.label = glyph.defaultLabel

    if(glyphInfo.autoApplyScale) {

        const scale = glyph.scale || Vec2.fromXY(1.0, 1.0)

        const origSize = glyphInfo.size
        glyphInfo.size = glyphInfo.size.multiply(scale)

        return svg('g', {
            transform: Matrix.translation(Vec2.fromXY(1.0, 1.0).subtract(scale).multiplyScalar(0.5).multiply(origSize)).toSVGString()
        }, [
            glyph.render(glyphInfo)
        ])
    } else {
        return glyph.render(glyphInfo)
    }




    /*
    if(glyphInfo.strand === 'negative') {

        var boxSize = Rect.size(box);

        var glyphMatrix = Matrix();

        glyphMatrix = Matrix.translate(glyphMatrix, Vec2(0, geom.backboneOffset));
        glyphMatrix = Matrix.rotate(glyphMatrix, 180, Vec2(boxSize.x, 0));
        glyphMatrix = Matrix.translate(glyphMatrix, Vec2(boxSize.x, 0));
        glyphMatrix = Matrix.translate(glyphMatrix, Vec2(0, -geom.backboneOffset));

        glyph.svg = svg('g', {
            transform: Matrix.toSVGString(glyphMatrix)
        }, [ glyph.svg ]);
    }*/

}

function getBackbonePlacement(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.backbonePlacement

}

function isContainer(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.isContainer || false

}

function interruptsBackbone(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.interruptsBackbone || false

}

function resizable(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.resizable || false

}

function resizableVertically(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    if(glyph.resizableVertically !== undefined)
        return glyph.resizableVertically

    return true

}

function splitsBackbone(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.splitsBackbone || false

}

function hasLabel(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.hasLabel || false

}

function defaultLabel(glyphInfo) {

    var glyph = glyphAndUriFromType(glyphInfo.type).glyph

    return glyph.defaultLabel || 'A'

}

export default {

    glyphAndUriFromType: glyphAndUriFromType,
    glyphFromUri: glyphFromUri,

    render: renderGlyph,
    backbonePlacement: getBackbonePlacement,
    isContainer: isContainer,
    interruptsBackbone: interruptsBackbone,
    resizable: resizable,
    resizableVertically: resizableVertically,
    splitsBackbone: splitsBackbone,
    hasLabel: hasLabel,
    defaultLabel: defaultLabel,

    glyphScaleFromType: glyphScaleFromType,
}


