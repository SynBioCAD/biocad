
import { LinearRangeSet } from "@biocad/jfw/geom";
import { Rect } from "@biocad/jfw/geom";

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