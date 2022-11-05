
import { LinearRange } from "@biocad/jfw/geom";
import { S3Range, S3Feature } from "sboljs"

export default class IdentifiedLinearRange extends LinearRange
{
    thing:S3Feature
    location:S3Range
    label:string

    constructor(start:number, end:number, location:S3Range, label:string) {
        super(start, end)
        this.location = location
        this.label = label
        this.thing = location.containingObject as S3Feature
    }
}
