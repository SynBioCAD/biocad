

import { Opacity } from '../Depiction'

import {
    S3Component,
    S3SubComponent,
    S3SequenceFeature
} from "sbolgraph"

export default abstract class DetailPreset {
    
    abstract getComponentOpacity(component:S3Component, nestDepth: number):Opacity
    abstract getSequenceFeatureOpacity(sequenceAnnotation:S3SequenceFeature, nestDepth:number):Opacity

}


