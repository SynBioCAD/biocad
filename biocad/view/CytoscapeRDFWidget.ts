
import cytoscape = require('cytoscape')

import { Graph } from 'sbolgraph'

export default class CytoscapeRDFWidget {

    graph:Graph

    container:any

    cy:any

    constructor(graph:Graph) {
        this.graph = graph
    }

    init() {

        this.container = document.createElement('div')
        this.container.style.flexGrow = 1

        requestAnimationFrame(() => this.afterRender())

        return this.container
    }

    afterRender() {
        console.log('cytoscape afterRender')
        this.cy = cytoscape({
            container: this.container,
            elements: this.createElements(),
            style: [
                {
                  selector: 'node',
                  style: {
                    'content': 'data(name)'
                  }
                },
                {
                  selector: 'edge',
                  style: {
                    'content': 'data(name)'
                  }
                }
            ],
            layout: {
                name: 'cose',
                animate: true,
                nodeDimensionsIncludeLabels: true
            }
        })
        this.cy.resize()
    }

    update(prev:CytoscapeRDFWidget, elem:HTMLElement):void {
        this.cy = prev.cy
    }
    
    createElements() {

        let elems:any[] = []

        let n = 0

        let createdSubjects:Set<string> = new Set()

        let createSubject = (subj) => {
            if(!createdSubjects.has(subj)) {
                createdSubjects.add(subj)
                elems.push({
                    group: 'nodes',
                    data: {
                        id: subj,
                        name: nameFromURI(subj)
                    }
                })
            }
        }

        let triples = this.graph.graph._graph

        console.log(triples.length + ' triples')

        for(let triple of triples) {

            console.log(JSON.stringify(triple))

            createSubject(triple.subject.nominalValue)

            let id = 'edge' + (++n)

            if(triple.object.interfaceName === 'NamedNode') {
                createSubject(triple.object.nominalValue)

                elems.push({
                    group: 'edges',
                    data: {
                        id: id,
                        name: nameFromURI(triple.predicate.nominalValue),
                        source: triple.subject.nominalValue,
                        target: triple.object.nominalValue
                    }
                })
            } else {

                let targId = id + '_targ'

                elems.push({
                    group: 'nodes',
                    data: {
                        id: targId,
                        name: nameFromURI(triple.object.nominalValue)
                    }
                })

                elems.push({
                    group: 'edges',
                    data: {
                        id: id,
                        name: nameFromURI(triple.predicate.nominalValue),
                        source: triple.subject.nominalValue,
                        target: targId
                    },
                })
            }
        }

        return elems
    }
}

CytoscapeRDFWidget.prototype['type'] = 'Widget'

function nameFromURI(uri) {

    let idx = uri.lastIndexOf('#')

    if(idx !== -1) {
        return uri.slice(idx + 1)
    }

    idx = uri.lastIndexOf('/')

    let v = uri.slice(idx + 1)

    if(v.length === 1) {
        idx = uri.lastIndexOf('/', idx - 1)
        if (idx !== -1) {
            return uri.slice(idx + 1)
        }
    } else {
        return uri.slice(idx + 1)
    }

    return uri
}
