
import { App } from 'jfw'

import TestDialog from './dialog/TestDialog'
import BiocadTopbar from './topbar/BiocadTopbar'

import { SBOLXGraph } from "sbolgraph"

import configurate from './configurator/configurate'

import SetupMode from './mode/setup/SetupMode'
import LibraryMode from './mode/library/LibraryMode'
import SourceMode from './mode/source/SourceMode'
import CircuitMode from './mode/circuit/CircuitMode'
import SequenceMode from './mode/sequence/SequenceMode'
import SimulatorMode from './mode/simulator/SimulatorMode'
import LoadSaveMode from './mode/loadsave/LoadSaveMode'

import Hook from 'jfw/Hook'

import DropOverlay from './DropOverlay'
import { VNode, h, create } from "jfw/vdom";

import Mode from "jfw/ui/Mode";
import HeadlessMode from "biocad/mode/headless/HeadlessMode";
import Layout from "biocad/cad/Layout";
import Headless from "biocad/Headless";
import UData from 'jfw/udata/UData';
import InitUData from 'biocad/InitUData';
import GlobalConfig from 'jfw/GlobalConfig';
import PopupMessageDialog from './dialog/PopupMessageDialog';
import { DialogOptions } from '@biocad/jfw/dist/jfw/ui/dialog';

console.log('BiocadApp.ts')

export default class BiocadApp extends App
{
    graph: SBOLXGraph

    dropOverlay:DropOverlay

    constructor(elem) {

        super(elem)

        this.dropOverlay = new DropOverlay(this)

        console.log('construct app')
    }


    onLoadGraph:Hook<SBOLXGraph> = new Hook<SBOLXGraph>()


    init():void {

        super.init()


        InitUData.init(this)



        //const saved = this.udata.get('graph')

        const saved = false

        if(saved) {

            console.info('I have saved state! ' + typeof(saved))
            console.dir(saved)

            this.graph = new SBOLXGraph(saved)

        } else {

            console.info('Nothing was saved :-(')

            this.graph = new SBOLXGraph([])

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

            SBOLXGraph.loadURL("/data/BBa_K1444001.xml").then((graph:SBOLXGraph) => {

                this.loadGraph(graph)

            })

        }*/
    }

    loadGraph(graph:SBOLXGraph):void {

        this.graph = graph

        this.onLoadGraph.fire(graph)

        this.update()

    }


    saveState():void {


        console.time('save state')
        console.dir(this.graph.graph.toArray())
        this.udata.set('graph', this.graph.graph.toArray())
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


