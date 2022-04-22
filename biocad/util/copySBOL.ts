
import { Graph, S3Identified, sbol3, node, triple, rdf } from 'sbolgraph'


// All the SBOL is copied but only things speciifed by topLevelURIs get renamed

// - Need to change their owned objects too

// TODO

export default function copySBOL(graphA:Graph, graphB:Graph, newURIPrefix:string):Map<string,string> {

    let intmGraph = graphA.clone()
    
    let identityMap:Map<string,string> = sbol3(intmGraph).changeURIPrefix(newURIPrefix)

    for(let topLevel of sbol3(intmGraph).topLevels) {
        let n = 1

        let origUri = topLevel.uri
        let newUri = topLevel.uri

	if(!graphB.hasMatch(newUri, null, null)) {
		continue
	}

        while(graphB.hasMatch(newUri, null, null)) {
            ++ n
            newUri = origUri + '_' + n
        }

        intmGraph = intmGraph.map(t => {
		let { subject, predicate, object } = t
		let uri = node.toString(subject)
		if (uri && uri.startsWith(origUri)) {
			let subject2 = newUri + uri.slice(origUri.length)
			identityMap.set(uri, subject2)
			subject = node.createUriNode(subject2)
		}
		let uri2 = node.toString(t.object)
		if (uri2 && uri2.startsWith(origUri)) {
			let object2 = newUri + uri2.slice(origUri.length)
			identityMap.set(uri2, object2)
			object = node.createUriNode(object2)
		}
		return triple.fromSPO(subject, predicate, object)
	})

        identityMap.set(origUri, newUri)
    }

    graphB.addAll(intmGraph)

    return identityMap
}





