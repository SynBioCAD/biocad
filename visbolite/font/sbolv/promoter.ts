
/*
 * Copyright (C) 2016 ICOS Group, Newcastle University.  All rights reserved.
 * Contact:  James Alastair McLaughlin <j.a.mclaughlin@ncl.ac.uk>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *  
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(size) {

    var arrowForkSize = Vec2.fromXY(size.y / 4.0, size.y / 4.0);
    var start = Vec2.fromXY(0, size.y);

    return {
        start: start,
        turn: Vec2.fromXY(0, arrowForkSize.y),
        end: Vec2.fromXY(size.x, arrowForkSize.y),
        topArrowForkEnd: Vec2.fromXY(size.x - arrowForkSize.x, 0),
        bottomArrowForkEnd: Vec2.fromXY(size.x - arrowForkSize.x, arrowForkSize.y * 2),
        backboneOffset: start.y
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.start.toPathString(),
        'L' + geom.turn.toPathString(),
        'L' + geom.end.toPathString(),
        'L' + geom.topArrowForkEnd.toPathString(),
        'M' + geom.end.toPathString(),
        'L' + geom.bottomArrowForkEnd.toPathString()

    ].join('');

    return svg('path', {
        'd': path,
        'stroke': renderOpts.color || '#03c03c',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linejoin': 'round',
        'fill': 'none'
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    scale: Vec2.fromXY(1.0, 0.8)
}






