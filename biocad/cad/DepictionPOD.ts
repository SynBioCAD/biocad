
import assert from 'power-assert'
import Layout from "biocad/cad/Layout";
import { SBOLXGraph, SXInteraction } from "sbolgraph"
import Depiction from "biocad/cad/Depiction";
import ComponentDepiction from "biocad/cad/ComponentDepiction";
import LabelDepiction from "biocad/cad/LabelDepiction";
import FeatureLocationDepiction from "biocad/cad/FeatureLocationDepiction";
import extend = require('xtend')
import { SXIdentified } from "sbolgraph"
import Vec2 from "jfw/geom/Vec2";
import BackboneDepiction from "biocad/cad/BackboneDepiction";
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import InteractionDepiction from './InteractionDepiction';
import IdentifiedChain from 'biocad/IdentifiedChain';
import { LinearRange, LinearRangeSet } from 'jfw/geom';

export default class DepictionPOD {

    static serialize(depiction:Depiction):any {

        var type

        var additionalProps = {}

        if(depiction instanceof ComponentDepiction) {

            type = 'ComponentDepiction'

            additionalProps['orientation'] = depiction.orientation
            additionalProps['backbonePlacement'] = depiction.backbonePlacement
            additionalProps['proportionalWidth'] = depiction.proportionalWidth

            if(depiction.location)
                additionalProps['location'] = depiction.location.uri

        } else if(depiction instanceof LabelDepiction) {

            type = 'LabelDepiction'

            additionalProps['labelFor'] = depiction.labelFor.uid

        } else if(depiction instanceof FeatureLocationDepiction) {

            type = 'FeatureLocationDepiction'

            additionalProps['orientation'] = depiction.orientation
            additionalProps['backbonePlacement'] = depiction.backbonePlacement
            additionalProps['proportionalWidth'] = depiction.proportionalWidth

            if(depiction.location)
                additionalProps['location'] = depiction.location.uri


        } else if(depiction instanceof CircularBackboneDepiction) {

            type = 'CircularBackboneDepiction'

        } else if(depiction instanceof BackboneDepiction) {

            type = 'BackboneDepiction'
            
            additionalProps['backboneY'] = depiction.backboneY
            additionalProps['locationsOfOmittedRegions'] = depiction.locationsOfOmittedRegions.toPOD()

            if(depiction.location)
                additionalProps['location'] = depiction.location.uri

        } else if(depiction instanceof InteractionDepiction) {

            type = 'InteractionDepiction'

        } else {

            assert(false)

        }

        if(depiction.label)
            additionalProps['label'] = depiction.label.uid

        return extend({
            'class': type,
            uid: depiction.uid,
            offset: depiction.offset.toPOD(),
            offsetExplicit: depiction.offsetExplicit,
            size: depiction.size.toPOD(),
            minSize: depiction.minSize.toPOD(),
            opacity: depiction.opacity,
            isExpandable: depiction.isExpandable,
            depictionOf: depiction._depictionOf ? depiction._depictionOf.uri : null,
            identifiedChain:  depiction.identifiedChain ? depiction.identifiedChain.stringify() : null,
            children: depiction.children.map(
                (child:Depiction) => DepictionPOD.serialize(child))
        }, additionalProps)

    }

    static deserialize(layout:Layout, graph:SBOLXGraph, parent:Depiction|undefined, pod:any, uidToDepiction:Map<number,Depiction>):Depiction {

        let depictionOf:SXIdentified|undefined = graph.uriToFacade(pod.depictionOf)

        let chain:IdentifiedChain|undefined = pod.identifiedChain ? IdentifiedChain.fromString(graph, pod.identifiedChain) : undefined

        var depiction:Depiction

        if(pod['class'] === 'ComponentDepiction') {

            depiction = new ComponentDepiction(layout, depictionOf, chain, parent, pod.uid)

            ;(depiction as ComponentDepiction).orientation = pod.orientation
            ;(depiction as ComponentDepiction).backbonePlacement = pod.backbonePlacement
            ;(depiction as ComponentDepiction).proportionalWidth = pod.proportionalWidth

            let loc =  graph.uriToFacade(pod.location)

            if(loc instanceof SXIdentified) {
                ; (depiction as ComponentDepiction).location = loc
            }


        } else if(pod['class'] === 'LabelDepiction') {

            let labelFor = uidToDepiction.get(pod['labelFor'])
        
            if(!labelFor) {
                throw new Error('cannot find labelFor for LabelDepiction when deserializing: ' + pod['labelFor'])
            }

            depiction = new LabelDepiction(layout, labelFor, parent, pod.uid)

            labelFor.label = depiction as LabelDepiction

        } else if(pod['class'] === 'CircularBackboneDepiction') {

            if(parent === undefined) {
                throw new Error('backbone must have a parent')
            }

            depiction = new CircularBackboneDepiction(layout, parent, pod.uid)

        } else if(pod['class'] === 'BackboneDepiction') {

            if(parent === undefined) {
                throw new Error('backbone must have a parent')
            }

            depiction = new BackboneDepiction(layout, parent, pod.uid)

            ;(depiction as BackboneDepiction).backboneY = pod.backboneY
            ;(depiction as BackboneDepiction).locationsOfOmittedRegions = LinearRangeSet.fromPOD(pod.locationsOfOmittedRegions)

            let loc =  graph.uriToFacade(pod.location)

            if(loc instanceof SXIdentified) {
                ; (depiction as BackboneDepiction).location = loc
            }


        } else if(pod['class'] === 'InteractionDepiction') {

            if(depictionOf === undefined)
                throw new Error('abid must have a depictionOf')

            if(parent === undefined) {
                throw new Error('abid must have a parent')
            }

            depiction = new InteractionDepiction(layout, depictionOf as SXInteraction, chain as IdentifiedChain, parent, pod.uid)

        } else if(pod['class'] === 'FeatureLocationDepiction') {

            if(depictionOf === undefined)
                throw new Error('FeatureLocationDepiction must have a depictionOf')

            depiction = new FeatureLocationDepiction(layout, depictionOf, chain, parent, pod.uid)

            ;(depiction as FeatureLocationDepiction).proportionalWidth = pod.proportionalWidth

            let loc =  graph.uriToFacade(pod.location)

            if(! (loc instanceof SXIdentified)) {
                throw new Error('???')
            }

            ;(depiction as FeatureLocationDepiction).location = loc

        } else {
            throw new Error('unknown depiction class')
        }

        depiction.offset = Vec2.fromPOD(pod.offset)
        depiction.offsetExplicit = pod.offsetExplicit
        depiction.size = Vec2.fromPOD(pod.size)
        depiction.minSize = Vec2.fromPOD(pod.minSize)
        depiction.opacity = pod.opacity
        depiction.isExpandable = pod.isExpandable
        depiction.depictionOf = depictionOf

        uidToDepiction.set(depiction.uid, depiction)

        for(let childPod of pod.children) {

            if(childPod['class'] !== 'LabelDepiction') {
                let d = DepictionPOD.deserialize(layout, graph, depiction, childPod, uidToDepiction)
                depiction.children.push(d)
                uidToDepiction.set(d.uid, d)
            }

        }
        for(let childPod of pod.children) {

            if(childPod['class'] === 'LabelDepiction') {
                let d = DepictionPOD.deserialize(layout, graph, depiction, childPod, uidToDepiction)
                depiction.children.push(d)
                uidToDepiction.set(d.uid, d)
            }

        }

        return depiction

    }

    static clone(depiction:Depiction, layout?:Layout, parent?:Depiction):Depiction {

        const pod:any = DepictionPOD.serialize(depiction)

        if(depiction.depictionOf === undefined)
            throw new Error('???')

        let uidToDepiction = new Map()

        if(layout) {
            return DepictionPOD.deserialize(layout, depiction.depictionOf.graph, parent, pod, uidToDepiction)
        } else {
            return DepictionPOD.deserialize(depiction.layout, depiction.depictionOf.graph, parent, pod, uidToDepiction)
        }
    }



}

