
import  { h } from '@biocad/jfw/vdom'

import { View, TreeView } from '@biocad/jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import { S3Component, Graph, sbol3 } from "sbolgraph";
import { TreeNode } from '@biocad/jfw/ui';

import { Hook } from '@biocad/jfw/util'

export default class ComponentBrowser extends View {

    filter:(S3Component)=>boolean
    tree:TreeView

    onCreate:Hook<string> = new Hook()
    onSelect:Hook<string> = new Hook()

    constructor(app, filter) {

        super(app)

        this.filter = filter

        this.tree = new TreeView(app)
        this.tree.setEditable(true)

        this.tree.onSelect.listen((uri:string) => {
            this.onSelect.fire(new S3Component(sbol3(app.graph), uri))
        })

        this.tree.onCreate.listen((uri:string) => {
            this.onCreate.fire(uri)
        })


        const fetchTreeNodes = ():TreeNode[] => {

            const graph:Graph = app.graph

            const nodes = []

            return sbol3(graph).rootComponents.filter(this.filter).map(S3ComponentToNode)

            function S3ComponentToNode(component:S3Component):TreeNode {

                const subnodes = component.subComponents.filter((component) => {
                    return filter(component.instanceOf)
                }).map((component) => {
                    return S3ComponentToNode(component.instanceOf)
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

    select(c:S3Component) {
        this.tree.select(c.uri)
    }
}

