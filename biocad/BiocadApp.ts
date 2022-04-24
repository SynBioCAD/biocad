
import { App } from '@biocad/jfw/ui'

import BiocadTopbar from './topbar/BiocadTopbar'

import SetupMode from './mode/setup/SetupMode'
import LibraryMode from './mode/library/LibraryMode'
import SourceMode from './mode/source/SourceMode'
import CircuitMode from './mode/circuit/CircuitMode'
import SequenceMode from './mode/sequence/SequenceMode'
import SimulatorMode from './mode/simulator/SimulatorMode'
import LoadSaveMode from './mode/loadsave/LoadSaveMode'

import { Hook } from '@biocad/jfw/util'

import DropOverlay from './DropOverlay'
import { VNode, h, create } from "@biocad/jfw/vdom";

import { Mode } from "@biocad/jfw/ui";
import Headless from "biocad/Headless";
import InitUData from 'biocad/InitUData';
import { GlobalConfig } from '@biocad/jfw/ui';
import PopupMessageDialog from './dialog/PopupMessageDialog';
import { DialogOptions } from '@biocad/jfw/ui';

import uuid = require('uuid')
import { Graph, sbol3 } from 'sbolgraph'

import '../less/biocad.less'

console.log('BiocadApp.ts')

export default class BiocadApp extends App
{
    graph:Graph

    dropOverlay:DropOverlay

    constructor(elem) {

        super(elem)

        this.dropOverlay = new DropOverlay(this)

        console.log('construct app')
    }


    onLoadGraph:Hook<Graph> = new Hook<Graph>()


    defaultPrefix:string


    init():void {

        super.init()


        InitUData.init(this)



        //const saved = this.udata.get('graph')

        const saved = false

        if(saved) {

            console.info('I have saved state! ' + typeof(saved))
            console.dir(saved)

            this.graph = new Graph(saved)
            this.defaultPrefix = sbol3(this.graph).uriPrefixes[0]

        } else {

            console.info('Nothing was saved :-(')

            this.graph = new Graph([])
        }

        if(!this.defaultPrefix) {
            this.defaultPrefix = 'http://' + uuid.v4() + '/'
        }

        if(GlobalConfig.get('biocad.feature.ui.modeswitcher')) {
            this.setTopbar(new BiocadTopbar(this))
        }

        const modes:Mode[] = []

        if(GlobalConfig.get('biocad.headless')) {

            window['biocad_HEADLESS'] = new Headless(this)

        } else {

            if(GlobalConfig.get('biocad.feature.mode.loadsave'))
                modes.push(new LoadSaveMode(this, false))

            if(GlobalConfig.get('biocad.feature.mode.setup'))
                modes.push(new SetupMode(this, false))

            if(GlobalConfig.get('biocad.feature.mode.source'))
                modes.push(new SourceMode(this, false))

            if(GlobalConfig.get('biocad.feature.mode.library'))
                modes.push(new LibraryMode(this, false))

            if(GlobalConfig.get('biocad.feature.mode.circuit'))
                modes.push(new CircuitMode(this, true))

            if(GlobalConfig.get('biocad.feature.mode.sequence'))
                modes.push(new SequenceMode(this, false))

            if(GlobalConfig.get('biocad.feature.mode.simulator'))
                modes.push(new SimulatorMode(this, false))

        }

        console.log(modes.length + ' mode(s) enabled')

        this.setModes(modes)


        /*
        if(!GlobalConfig.get('biocad.headless')) {

            Graph.loadURL("/data/BBa_K1444001.xml").then((graph:Graph) => {

                this.loadGraph(graph)

            })

        }*/
    }

    loadGraph(graph:Graph):void {

        this.graph = graph

        this.onLoadGraph.fire(graph)

        this.update()

    }


    saveState():void {


        console.time('save state')
        console.dir(this.graph.toArray())
        this.udata.set('graph', this.graph.toArray())
        console.timeEnd('save state')

    }


    render():VNode {

        return h('div.jfw-container', [
            this.dropOverlay.render(),
            super.render()
        ])

    }

    onFileDrop(files:File[]) {

        console.log('biocad: onFileDrop')

    }

    popupMessage(title:string, message:any) {

        this.openDialog(new PopupMessageDialog(this, title, message, new DialogOptions()))

    }

    getCircuitMode():CircuitMode|undefined {

        for(let mode of this.modes) {
            if(mode instanceof CircuitMode) {
                return mode
            }
        }
    }
}


