
import DetailPreset from './DetailPreset'

import { Specifiers } from 'bioterms'

import { Opacity } from '../Depiction'

import {
    SXSubComponent,
    SXComponent,
    SXSequenceFeature
} from "sbolgraph"

export default class DetailPreset1 extends DetailPreset {

    getComponentOpacity(component:SXComponent, nestDepth:number):Opacity {

        if(component.subComponents.length > 0 || component.sequenceFeatures.length > 0) {
            
            //console.log('nd ' + nestDepth)

            if(nestDepth < 2) {

                return Opacity.Whitebox

            } else {

                return Opacity.Blackbox

            }

        } else {
            return Opacity.Blackbox
        }

    }

    getSequenceFeatureOpacity(sequenceAnnotation:SXSequenceFeature, nestDepth:number):Opacity {
        return Opacity.Blackbox
    }

}

