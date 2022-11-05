import { Graph, S3Component } from "sboljs";
import RepoView from "./RepoView";
import { View } from '@biocad/jfw/ui'
import Layout from "../../cad/layout/Layout";
import LayoutThumbnail from "../../cad/LayoutThumbnail";
import { h} from '@biocad/jfw/vdom'

export default class RepoComponentVisualView extends View {

	layout: Layout | null
	layoutThumbnail: LayoutThumbnail | null

	constructor(repoView:RepoView, g:Graph, c:S3Component) {

		super(repoView.app)

                this.layout = new Layout(g)
                this.layout.syncAllDepictions(5)
                this.layout.configurate([])
                this.layoutThumbnail = new LayoutThumbnail(repoView.app, this.layout)

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