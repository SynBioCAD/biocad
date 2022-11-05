import { View, TreeView, TreeNode } from "@biocad/jfw/ui";
import BiocadApp from "biocad/BiocadApp";
import { VNode } from "@biocad/jfw/vdom";
import BiocadProject from "../../BiocadProject";

export default class LibraryTree extends View {

	project:BiocadProject

    treeView:TreeView

    constructor(project:BiocadProject) {

        super(project)

	this.project = project

        this.treeView = new TreeView(project)

        this.treeView.setNodeFetcher(fetchNodes)

        function fetchNodes():TreeNode[] {

            const libraries:any[] = project.udata.get('libraries')

            const nodes = libraries.map((library:any) => {

                const node:TreeNode = new TreeNode()

                node.id = library.url
                node.title = library.name

                return node

            })

            const udNode:TreeNode = new TreeNode()
            udNode.id = 'udata'
            udNode.title = 'Local'
            nodes.unshift(udNode)

            return nodes


        }
    }

    render():VNode {

        return this.treeView.render()

    }




}