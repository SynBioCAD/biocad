import { View } from "@biocad/jfw/ui";
import { h } from "@biocad/jfw/vdom";
import BiocadApp from "./BiocadApp";

export default class AddProjectView extends View {

	app:BiocadApp

	constructor(app:BiocadApp) {
		super(app)
		this.app = app
	}

	render() {
		return h('div', 'add proj view')
	}
}
