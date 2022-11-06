import { View } from "@biocad/jfw/ui";
import { h } from "@biocad/jfw/vdom";
import { click as clickEvent, keyupChange as keyupChangeEvent } from '@biocad/jfw/event'
import BiocadApp from "./BiocadApp";
import * as uuid from "uuid";
import fileDialog = require( "file-dialog" );
import { SBOL3GraphView } from "sboljs";
import BiocadProject from "./BiocadProject";
import RepoBrowser from "./repo-browser/RepoBrowser";
import Repo from "./Repository";
import NewProjectRepoView from "./NewProjectRepoView";

export default class ZeroProjectsView extends View {

	app:BiocadApp

	selection:null|'new'|'load'|'synbiohub'


	// new project
	projectName:string
	uriPrefix:string
	repoView:NewProjectRepoView


	constructor(app:BiocadApp) {
		super(app)
		this.app = app
		this.selection = null
	}

	render() {

		switch(this.selection) {
			case null:
				return this.renderWelcome() 
			case 'new':
				return this.renderNew()
			case 'load':
				return this.renderLoad()
			case 'synbiohub':
				return this.renderSynBioHub()
		}

	}

	renderWelcome() {
		return [ h('div.synbiocad-welcome-container.jfw-flow-grow.jfw-flow-ttb', [

				h('img.biocad-welcome-logo', {
					src: 'synbiocad.svg'
				}),
				h('h1', 'Welcome to SynBioCAD!'),

				h('div.biocad-newprojectview-options.jfw-flow-ttb', [
					h('div.biocad-newprojectview-option.jfw-flow-ltr', {
						'ev-click': clickEvent(clickWelcomeNew, { view: this })
					}, [
						h('a.fa.fa-plus', []),
						h('span.icon-text.jfw-no-select', ' Create a new project')
					]),
					h('br'),
					h('div.biocad-newprojectview-option.jfw-flow-ltr', {
						'ev-click': clickEvent(clickWelcomeLoad, { view: this })
					}, [
						h('a.fa.fa-folder-open', []),
						h('span.icon-text.jfw-no-select', ' Load a GenBank, FASTA, or SBOL file from your computer')
					]),
					h('br'),
					h('div.biocad-newprojectview-option.jfw-flow-ltr', {
						'ev-click': clickEvent(clickWelcomeSynBioHub, { view: this })
					}, [
						h('a.fa.fa-server', []),
						h('span.icon-text.jfw-no-select', ' Browse SynBioHub for parts')
					]),
				]),

				h('br'),
				h('p.welcome-warning', [
					h('center',
					'⚠️ SynBioCAD is an open source project under heavy development, and only your feedback can help make it better! For more information, check out:',
					),

					h('ul', [
						h('li', [
							h('a.jfw-weblink', {
								href: 'https://synbiocad.org'
							}, h('b', 'synbiocad.org')), ' for general information about the project'
						]),
						h('li', [
							'The ', h('a.jfw-weblink', {
								href: 'https://github.com/SynBioCAD/biocad/issues'
							}, h('b', 'issue tracker')), ' to report any problems you might find'
						]),
						h('li', [
							h('a.jfw-weblink', {
								href: 'https://github.com/SynBioCAD/biocad'
							}, h('b', 'github.com/synbiocad')), ' for the source code'
						]),
					])
				])
			]),

			]
	}

	renderNew() {
		
		let buttonEnabled = true
		let errorMessage = ''
		
		if(this.projectName === '') {
			buttonEnabled = false
			errorMessage = 'I need a project name'
		} else if(this.uriPrefix === '') {
			buttonEnabled = false
			errorMessage = 'I need a URI prefix'
		} else if(!this.uriPrefix.endsWith('/')) {
			buttonEnabled = false
			errorMessage = 'URI prefix looks invalid'
		}

		return [ h('div.synbiocad-welcome-container.jfw-flow-grow.jfw-flow-ttb', [

				h('img.biocad-welcome-logo', {
					src: 'synbiocad.svg'
				}),
				h('h1', 'Let\'s name your new project...'),

				h('div.jfw-flow-ttb.jfw-flow-align-center', [
					 h('a.jfw-weblink', {
						'ev-click': clickEvent(goBack, { view: this })

					  }, '« Want to load an existing project instead?')
				]),

				h('p', {
					style: {
					'text-align': 'center',
					'font-size': 'large'
					}
				 }, [
					'To create your new project, SynBioCAD needs a ',
					h('b', 'name'),
					' and optionally a ',
					h('b', 'URI prefix'),
					'. If you don\'t know (or care) what a URI prefix is, don\'t worry; a randomized one has been generated for you so you can get straight down to the biology!'
				]),

					h('h2', 'Project Name'),
					h('input.biocad-projcreate-input', {
						placeholder: 'My Groundbreaking Project',
						value: this.projectName,
						'ev-keyup': keyupChangeEvent(changeProjectName, { view: this} )
					}),

					h('h2', 'URI Prefix'),
					h('input.biocad-projcreate-input', {
						style: {
							'font-family': 'monospace'
						},
						value: this.uriPrefix,
						spellcheck: false,
						'ev-keyup': keyupChangeEvent(changeUriPrefix, { view: this} )
					}),

					h('br'),

					h('button.biocad-projcreate-go', {
						disabled: !buttonEnabled
					 }, errorMessage ? errorMessage : h('b', 'Let\'s go! »'))
			])

		]
	}

	renderLoad() {
	}

	renderSynBioHub() {

		return [ h('div.synbiocad-welcome-container.jfw-flow-ttb', [

				h('img.biocad-welcome-logo', {
					src: 'synbiocad.svg'
				}),
				h('h1', 'Browsing SynBioHub for parts'),

				h('div.jfw-flow-ttb.jfw-flow-align-center', [
					 h('a.jfw-weblink', {
						'ev-click': clickEvent(goBack, { view: this })

					  }, '« Want to create a new project or load from your computer instead?')
				]),
			]),


			h('div.jfw-light', [
				this.repoView.render()
			])

		]
	}
}

function clickWelcomeNew(data) {

	let { view } = data

	view.selection = 'new'
	view.projectName = ''
	view.uriPrefix = 'urn:uri:' + uuid.v4() + '/'
	view.update()
}

async function clickWelcomeLoad(data) {

	let { view } = data

    let file = await fileDialog()

	if (file && file[0]) {

		let reader = new FileReader()

		reader.onload = async (ev) => {

			if (!ev.target)
				return

			let g = await SBOL3GraphView.loadString(reader.result + '', file[0].type)

			let project = new BiocadProject(view.app)

			let prefix = g.mostPopularUriPrefix
			if(prefix)
				project.defaultPrefix = prefix

			let root = g.rootComponents[0]
			if(root) {
				let name = root.displayName
				if(name)
					project.title = name
			}

			project.loadGraph(g.graph)

			view.app.addProject(project)
		}

		reader.readAsText(file[0])
	}

}

function clickWelcomeSynBioHub(data) {

	let { view } = data

	view.selection = 'synbiohub'
	view.repoView = new NewProjectRepoView(view)
	view.update()
}


function goBack(data) {

	let { view } = data

	view.selection = null
	view.update()
}

function changeProjectName(data) {

	let { view } = data

	view.projectName = data.value
	view.update()
}

function changeUriPrefix(data) {

	let { view } = data

	view.uriPrefix = data.value
	view.update()
}

