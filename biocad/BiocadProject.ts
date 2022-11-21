

import { Mode, Project } from '@biocad/jfw/ui'
import { GlobalConfig } from '@biocad/jfw/ui'
import { Hook } from '@biocad/jfw/util'
import { Graph, sbol3 } from 'sboljs'
import * as uuid from 'uuid'
import BiocadApp from './BiocadApp'
import CircuitMode from './mode/circuit/CircuitMode'
import LibraryMode from './mode/library/LibraryMode'
import LoadSaveMode from './mode/loadsave/LoadSaveMode'
import RepoMode from './mode/repository/RepoMode'
import SequenceMode from './mode/sequence/SequenceMode'
import SetupMode from './mode/setup/SetupMode'
import SimulatorMode from './mode/simulator/SimulatorMode'
import SourceMode from './mode/source/SourceMode'
import BiocadTopbar from './topbar/BiocadTopbar'

export default class BiocadProject extends Project {

	graph:Graph
	defaultPrefix:string

	onLoadGraph: Hook<Graph> = new Hook<Graph>()

	constructor(app:BiocadApp, id?:string, defaultPrefix?:string, title?:string) {

		super(app)

		this.id = id || uuid.v4()
		this.graph = new Graph([])
		this.defaultPrefix = defaultPrefix || 'http://' + this.id + '/'
		this.title = title || 'Untitled'
		this.active = true
	}

	init() {

		let app = this.app as BiocadApp

		let modes:Mode[] = []

		if(GlobalConfig.get('biocad.feature.ui.modeswitcher')) {
			this.setTopbar(new BiocadTopbar(this))
		    }

		if (!GlobalConfig.get('biocad.headless')) {
			if(GlobalConfig.get('biocad.feature.mode.loadsave'))
				modes.push(new LoadSaveMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.setup'))
				modes.push(new SetupMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.source'))
				modes.push(new SourceMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.repository'))
				modes.push(new RepoMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.library'))
				modes.push(new LibraryMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.circuit'))
				modes.push(new CircuitMode(app, this, true))

			if(GlobalConfig.get('biocad.feature.mode.sequence'))
				modes.push(new SequenceMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.simulator'))
				modes.push(new SimulatorMode(app, this, false))
		}

		this.setModes(modes)
	}

	static async fromPOD(app:BiocadApp, projPOD:any) {

		let p = new BiocadProject(app)
		p.id = projPOD.id
		p.title = projPOD.title
		p.defaultPrefix = projPOD.defaultPrefix
		p.graph = await Graph.loadString(projPOD.graph)

		p.init()

		return p

	}

	toPOD():any {

		console.log(this.graph.serializeXML())

		return {
			graph: this.graph.serializeXML(),
			defaultPrefix: this.defaultPrefix,
			id: this.id,
			title: this.title
		}
	}

    loadGraph(graph:Graph, asCopy?:boolean):void {

        this.graph = asCopy === true ? graph.clone() : graph

        this.onLoadGraph.fire(graph)

        this.update()

    }

    getCircuitMode():CircuitMode|undefined {

        for(let mode of this.modes) {
            if(mode instanceof CircuitMode) {
                return mode
            }
        }
    }

}
