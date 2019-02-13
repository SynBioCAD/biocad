
import { SBOLXGraph, SXIdentified } from 'sbolgraph'


// All the SBOL is copied but only things speciifed by topLevelURIs get renamed

// - Need to change their owned objects too

export default function copySBOL(graphA:SBOLXGraph, graphB:SBOLXGraph, newURIPrefix:string, topLevelURIs?:string[]):SXIdentified[] {

    let intmGraph = graphA.clone()
    intmGraph.changeURIPrefix(newURIPrefix)

    let topLevels:SXIdentified[] = topLevelURIs ?
        topLevelURIs.map((uri) => intmGraph.uriToFacade(uri)) as SXIdentified[] :
            intmGraph.topLevels

    // TODO: setCompliantIdentity is expensive; only do it when a good URI has been found

    for(let topLevel of topLevels) {
        let curID:string|undefined = topLevel.id
        if(curID === undefined) {
            curID = 'anon'
        }
        let n = 1
        while(graphB.hasMatch(topLevel.uri, null, null)) {
            ++ n
            topLevel.setCompliantIdentity(curID + n, topLevel.version)
        }
    }

    // TODO check doesn't exist and make new ids if it does
    graphB.addAll(intmGraph)

    return topLevels.map((topLevel) => {
        let newTopLevel = graphB.uriToFacade(topLevel.uri)
        if(!newTopLevel) {
            throw new Error('???')
        }
        return newTopLevel
    })
}




