import assert from "assert"
import { Specifiers } from "bioterms"
import { S3Location, S3Identified, S3OrientedLocation, S3SubComponent, S3SequenceFeature } from "sboljs"
import IdentifiedChain from "../../../IdentifiedChain"
import DetailPreset from "../../detail-preset/DetailPreset"
import BackboneDepiction from "../BackboneDepiction"
import ComponentDepiction from "../ComponentDepiction"
import Depiction, { Orientation, Opacity } from "../Depiction"
import FeatureLocationDepiction from "../FeatureLocationDepiction"
import Layout from "../Layout"
import syncComponentDepiction from "./syncComponentDepiction"

export default function syncLocationDepiction(layout:Layout, preset:DetailPreset, location:S3Location, chain:IdentifiedChain, parent:BackboneDepiction, nestDepth:number, orientation:Orientation) {

        //const sequenceAnnotation:S3SequenceFeature = location.containingSequenceFeature

        const containingObject:S3Identified|undefined = location.containingObject

        if(containingObject === undefined)
            throw new Error('???')

        //const opacity:Opacity = preset.getSequenceFeatureOpacity(sequenceAnnotation, nestDepth)

        const opacity = Opacity.Blackbox

        var nestedOrientation:Orientation

        if(location instanceof S3OrientedLocation) {

            nestedOrientation = (location as S3OrientedLocation).orientation ===
                Specifiers.SBOL3.Orientation.ReverseComplement ?
                    reverse(orientation) : orientation

        } else {

            nestedOrientation = orientation

        }


        if(containingObject instanceof S3SubComponent) {

            const cDepiction:ComponentDepiction = syncComponentDepiction(layout, preset, containingObject, containingObject.instanceOf, chain, parent, nestDepth, nestedOrientation)
            cDepiction.location = location

            return cDepiction

        } else if(containingObject instanceof S3SequenceFeature) {

            var depiction:Depiction|undefined = layout.identifiedChainToDepiction.get(chain.stringify())
            var salDepiction

            if(depiction !== undefined) {

                assert(depiction instanceof FeatureLocationDepiction)

                depiction.stamp = Layout.nextStamp
    
                salDepiction = depiction as FeatureLocationDepiction
    
                layout.attachToParent(depiction, parent)

            } else {

                depiction = salDepiction = new FeatureLocationDepiction(layout, containingObject, chain, parent)
                salDepiction.setSameVersionAs(layout)

                layout.addDepiction(depiction, parent)

                salDepiction.opacity = Opacity.Blackbox
            }

            salDepiction.location = location
            salDepiction.depictionOf = containingObject
            salDepiction.orientation = nestedOrientation
            salDepiction.isExpandable = false

            return salDepiction

        } else {

            throw new Error('???')

        }

    }

    function reverse(orientation:Orientation):Orientation {

	return orientation === Orientation.Forward ?
		    Orientation.Reverse :
		    Orientation.Forward
    
    }