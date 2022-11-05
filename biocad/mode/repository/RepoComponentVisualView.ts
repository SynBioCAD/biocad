import { Graph, S3Component } from "sboljs";
import RepoView from "./RepoView";
import { View } from '@biocad/jfw/ui'
import Layout from "../../cad/layout/Layout";
import LayoutThumbnail from "../../cad/LayoutThumbnail";
import { h} from '@biocad/jfw/vdom'
import BiocadProject from "../../BiocadProject";

export default class RepoComponentVisualView extends View {

	project:BiocadProject

	layout: Layout | null
	layoutThumbnail: LayoutThumbnail | null

	constructor(repoView:RepoView, g:Graph, c:S3Component) {

		super(repoView.project)
		this.project = repoView.project

                this.layout = new Layout(g)
                this.layout.syncAllDepictions(5)
                this.layout.configurate([])
                this.layoutThumbnail = new LayoutThumbnail(repoView.project, this.layout)

                this.layoutThumbnail.attr = {
                    style: {
                    }
                }
	}

	render() {

		return h('div', {
			style: {
				overflow: 'auto',
				flex: 1
			}
		}, [
			this.layoutThumbnail.render()
		])
	}

}