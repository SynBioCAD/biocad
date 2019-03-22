
import  { h } from 'jfw/vdom'

import { View, TreeView } from 'jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import { SXComponent, SBOLXGraph } from "sbolgraph";
import { TreeNode } from 'jfw/ui/TreeView';

export default class ComponentBrowser extends View {

    filter:(SXComponent)=>boolean
    tree:TreeView

    constructor(app, filter) {

        super(app)

        this.filter = filter

        this.tree = new TreeView(app)
        this.tree.setEditable(true)


        const fetchTreeNodes = ():TreeNode[] => {

            const graph:SBOLXGraph = app.graph

            const nodes = []

            return graph.rootComponents.filter(this.filter).map(SXComponentToNode)

            function SXComponentToNode(component:SXComponent):TreeNode {

                const subnodes = component.subComponents.filter((component) => {
                    return filter(component.instanceOf)
                }).map((component) => {
                    return SXComponentToNode(component.instanceOf)
                })

                var node:TreeNode = new TreeNode()

                node.id = component.uri
                node.title = component.displayName || '???'
                node.subnodes = subnodes

                return node
            }

        }


        this.tree.setNodeFetcher(fetchTreeNodes)

    }


    render() {

        return h('div', [

            this.tree.render()

        ])
    }


    onSelect(fn) {

        const app = this.app as BiocadApp

        this.tree.onSelect((uri:string) => {

            fn(new SXComponent(app.graph, uri))
        
        })
    }

    onCreate(fn) {
        this.tree.onCreate(fn)
    }

    select(c:SXComponent) {
        this.tree.select(c.uri)
    }
}

