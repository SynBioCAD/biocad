
import { SBOLXGraph, SXIdentified } from 'sbolgraph'

export default function copySBOL(graphA:SBOLXGraph, graphB:SBOLXGraph, newURIPrefix:string):SXIdentified[] {

    let intmGraph = graphA.clone()
    intmGraph.changeURIPrefix(newURIPrefix)

    // TODO check doesn't exist and make new ids if it does
    graphB.addAll(graphA)

    return intmGraph.topLevels.map((topLevel) => {
        let newTopLevel = graphB.uriToFacade(topLevel.uri)
        if(!newTopLevel) {
            throw new Error('???')
        }
        return newTopLevel
    })
}


