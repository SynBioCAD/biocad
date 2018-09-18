
import LinearRangeSet from "jfw/geom/LinearRangeSet";
import Rect from "jfw/geom/Rect";

export default class SequenceEditorLine {

    seqOffset:number
    annoRings:Array<LinearRangeSet>
    bbox:Rect

    constructor(seqOffset:number) {

        this.seqOffset = seqOffset
        this.annoRings = []
        this.bbox = new Rect()

    }



}