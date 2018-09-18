
import LinearRange from "jfw/geom/LinearRange";
import { SXRange, SXThingWithLocation } from "sbolgraph"

export default class IdentifiedLinearRange extends LinearRange
{
    thing:SXThingWithLocation
    location:SXRange
    label:string

    constructor(start:number, end:number, location:SXRange, label:string) {
        super(start, end)
        this.location = location
        this.label = label
        this.thing = location.containingObject as SXThingWithLocation
    }
}
