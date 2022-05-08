import { View, TreeView, TreeNode } from "@biocad/jfw/ui";
import BiocadApp from "biocad/BiocadApp";
import { VNode } from "@biocad/jfw/vdom";

export default class LibraryTree extends View {

    treeView:TreeView

    constructor(app:BiocadApp) {

        super(app)

        this.treeView = new TreeView(app)

        this.treeView.setNodeFetcher(fetchNodes)

        function fetchNodes():TreeNode[] {

            const libraries:any[] = app.udata.get('libraries')

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