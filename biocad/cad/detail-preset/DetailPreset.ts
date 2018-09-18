

import { Opacity } from '../Depiction'

import {
    SXComponent,
    SXSubComponent,
    SXSequenceFeature
} from "sbolgraph"

export default abstract class DetailPreset {
    
    abstract getComponentOpacity(component:SXComponent, nestDepth: number):Opacity
    abstract getSequenceFeatureOpacity(sequenceAnnotation:SXSequenceFeature, nestDepth:number):Opacity

}


