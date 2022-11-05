

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

	constructor(app:BiocadApp) {

		super(app)

		this.id = uuid.v4()
		this.graph = new Graph([])
		this.defaultPrefix = 'http://' + this.id + '/'
		this.title = 'Untitled'
		this.active = true

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
				modes.push(new RepoMode(app, this, true))

			if(GlobalConfig.get('biocad.feature.mode.library'))
				modes.push(new LibraryMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.circuit'))
				modes.push(new CircuitMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.sequence'))
				modes.push(new SequenceMode(app, this, false))

			if(GlobalConfig.get('biocad.feature.mode.simulator'))
				modes.push(new SimulatorMode(app, this, false))
		}

		this.setModes(modes)
	}

	static fromPOD(app:BiocadApp, projPOD:any) {

		let p = new BiocadProject(app)
		p.graph = new Graph(projPOD.graph)
		p.defaultPrefix = sbol3(p.graph).uriPrefixes[0]
		return p

	}

	toPOD():string {
		return JSON.stringify({
			graph: this.graph.serializeXML(),
			defaultPrefix: this.defaultPrefix
		})
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
