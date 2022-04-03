
import LinearRange from "jfw/geom/LinearRange";
import { S3Range, S3Feature } from "sbolgraph"

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
