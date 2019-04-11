
import Depiction, { Orientation } from './Depiction'
import Layout from './Layout';
import { SXIdentified, SXRange, SXLocation } from 'sbolgraph'
import IdentifiedChain from 'biocad/IdentifiedChain';
import LabelDepiction from './LabelDepiction';
import BackboneDepiction from './BackboneDepiction';
import { Vec2 } from 'jfw/geom'

export default abstract class LocationableDepiction extends Depiction {

    orientation: Orientation
    location: SXIdentified|null
    backbonePlacement:string
    proportionalWidth:number

    constructor(layout:Layout, depictionOf:SXIdentified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

        this.orientation = Orientation.Forward

    }

    getAnchorY():number {

        // TODO: Best effort to align to a parent backbone, if exists.
        // If there are multiple BackboneDepiction children, only aligns to the first
        for(var i = 0; i < this.children.length; ++ i) {

            let child:Depiction = this.children[i]

            if(child instanceof BackboneDepiction) {
                return child.offset.y + child.getAnchorY()
            }

        }



        if(this.backbonePlacement === 'mid') {

           return this.size.y / 2

        } else if(this.backbonePlacement === 'top') {

            return this.size.y

        } else {

            return 0

        }
    }

    calcWidthFromLocation(): { proportionalWidth:number, displayWidth:number } {

        let hasFixedLoc = this.location && (this.location as SXLocation).isFixed()

        let layout = this.layout

        let proportionalWidth = layout.minGlyphWidth

        if (hasFixedLoc) {
            if (this.location instanceof SXRange) {
                let start = this.location.start
                let end = this.location.end
                if (start !== undefined && end !== undefined) {
                    proportionalWidth =  Math.abs(end - start) * layout.bpToGridScale
                }
            }
        }

        let w = Math.max(proportionalWidth, layout.minGlyphWidth)
        w = Math.max(w, this.minSize.x)

        if(!hasFixedLoc) {
            proportionalWidth = w
        }

        return { displayWidth: w, proportionalWidth }

    }

}
