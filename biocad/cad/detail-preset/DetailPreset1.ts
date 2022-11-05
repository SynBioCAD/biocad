
import DetailPreset from './DetailPreset'

import { Specifiers } from 'bioterms'

import { Opacity } from '../layout/Depiction'

import {
    S3SubComponent,
    S3Component,
    S3SequenceFeature
} from "sboljs"

export default class DetailPreset1 extends DetailPreset {

    getComponentOpacity(component:S3Component, nestDepth:number):Opacity {

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

    getSequenceFeatureOpacity(sequenceAnnotation:S3SequenceFeature, nestDepth:number):Opacity {
        return Opacity.Blackbox
    }

}

