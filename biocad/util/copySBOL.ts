
import { Graph, S3Identified, sbol3 } from 'sbolgraph'


// All the SBOL is copied but only things speciifed by topLevelURIs get renamed

// - Need to change their owned objects too

export default function copySBOL(graphA:Graph, graphB:Graph, newURIPrefix:string):Map<string,string> {

    let intmGraph = graphA.clone()
    
    let identityMap:Map<string,string> = sbol3(intmGraph).changeURIPrefix(newURIPrefix)

    // TODO: setCompliantIdentity is expensive; only do it when a good URI has been found

    for(let topLevel of sbol3(intmGraph).topLevels) {
        let curID:string|undefined = topLevel.id
        if(curID === undefined) {
            curID = 'anon'
        }
        let n = 1

        let origUri = topLevel.uri

        while(graphB.hasMatch(topLevel.uri, null, null)) {
            ++ n
            topLevel.setCompliantIdentity(curID + n, topLevel.version)
        }

        identityMap.set(origUri, topLevel.uri)
    }

    // TODO check doesn't exist and make new ids if it does
    graphB.addAll(intmGraph)

    return identityMap
}




