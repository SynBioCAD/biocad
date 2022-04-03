

import assert from 'power-assert'

import { Vec2 } from '@biocad/jfw/geom'

export default function tileHorizontalStrategy(parent, children, padding) {

    var offset = Vec2.fromXY(padding, padding)
    var maxHeight = -99999

    for(let child of children) {

        child.offset = offset

        offset = offset.add(Vec2.fromXY(child.size.x + padding, 0))

        maxHeight = Math.max(maxHeight, child.size.y)

    }

    parent.size = Vec2.fromXY(offset.x, padding + maxHeight + padding)


}

