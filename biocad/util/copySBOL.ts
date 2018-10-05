
import { SBOLXGraph, SXIdentified } from 'sbolgraph'

export default function copySBOL(graphA:SBOLXGraph, graphB:SBOLXGraph, newURIPrefix:string):SXIdentified[] {

    let intmGraph = graphA.clone()
    intmGraph.changeURIPrefix(newURIPrefix)

    // TODO: setCompliantIdentity is expensive; only do it when a good URI has been found

    for(let topLevel of intmGraph.topLevels) {
        let curID = topLevel.id
        let n = 1
        while(graphB.hasMatch(topLevel.uri, null, null)) {
            ++ n
            topLevel.setCompliantIdentity(curID + n, topLevel.version)
        }
    }

    // TODO check doesn't exist and make new ids if it does
    graphB.addAll(intmGraph)

    return intmGraph.topLevels.map((topLevel) => {
        let newTopLevel = graphB.uriToFacade(topLevel.uri)
        if(!newTopLevel) {
            throw new Error('???')
        }
        return newTopLevel
    })
}


