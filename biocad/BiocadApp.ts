
import { App } from '@biocad/jfw/ui'

import BiocadTopbar from './topbar/BiocadTopbar'

import SetupMode from './mode/setup/SetupMode'
import LibraryMode from './mode/library/LibraryMode'
import SourceMode from './mode/source/SourceMode'
import CircuitMode from './mode/circuit/CircuitMode'
import SequenceMode from './mode/sequence/SequenceMode'
import SimulatorMode from './mode/simulator/SimulatorMode'
import LoadSaveMode from './mode/loadsave/LoadSaveMode'
import RepoMode from './mode/repository/RepoMode'

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
import { Graph, sbol3 } from 'sboljs'

import '../less/biocad.less'
import BiocadProject from './BiocadProject'
import BiocadProjectbar from './projectbar/BiocadProjectbar'

console.log('BiocadApp.ts')

export default class BiocadApp extends App
{
    dropOverlay:DropOverlay

    constructor(elem) {

        super(elem)

        this.dropOverlay = new DropOverlay(this)

        console.log('construct app')
    }


    init():void {

        super.init()


        InitUData.init(this)



        // const saved:any = this.udata.get('biocad')
        const saved:any = false

        if(saved) {

            console.info('I have saved state! ' + typeof(saved))
            console.dir(saved)

	    for(let projectPOD of saved['projects']) {
		this.addProject(BiocadProject.fromPOD(this, projectPOD))
	    }

        } else {

            console.info('Nothing was saved :-(')

	    this.addProject(new BiocadProject(this))
        }


        if(GlobalConfig.get('biocad.headless')) {

            window['biocad_HEADLESS'] = new Headless(this)

        } else {

        }

	this.setProjectBar(new BiocadProjectbar(this))


        /*
        if(!GlobalConfig.get('biocad.headless')) {

            Graph.loadURL("/data/BBa_K1444001.xml").then((graph:Graph) => {

                this.loadGraph(graph)

            })

        }*/
    }

    saveState():void {


        console.time('save state')
        this.udata.set('biocad', {
		projects: this.projects.map(p => (p as BiocadProject).toPOD())
	})
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

}


