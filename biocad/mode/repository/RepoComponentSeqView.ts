import { Graph, S3Component } from "sboljs";
import RepoView from "./RepoView";
import { View } from '@biocad/jfw/ui'
import Layout from "../../cad/layout/Layout";
import LayoutThumbnail from "../../cad/LayoutThumbnail";
import { h} from '@biocad/jfw/vdom'
import SequenceEditor from "../sequence/SequenceEditor";
import BiocadProject from "../../BiocadProject";

export default class RepoComponentSeqView extends View {

	project:BiocadProject

	layout: Layout | null
	layoutThumbnail: LayoutThumbnail | null

	sequenceView:SequenceEditor

	constructor(repoView:RepoView, g:Graph, c:S3Component) {

		super(repoView.project)
		this.project = repoView.project

		this.sequenceView = new SequenceEditor(this.project, this)
		this.sequenceView.setComponent(c)
		this.sequenceView.darkMode = false
		this.sequenceView.showTopToolbar = false
		this.sequenceView.readOnly = true

	}

	render() {

		return h('div', {
			style: {
				overflow: 'auto',
				flex: 1,
				paddingLeft: '8px',
				paddingTop: '8px'
			}
		}, [
			this.sequenceView.render()
		])
	}

}