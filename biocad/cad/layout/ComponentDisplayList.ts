
import { S3SequenceFeature, S3SubComponent, S3Constraint, S3Component, S3Identified, S3Location, Graph, Facade, sbol3 } from "sboljs"

export default class ComponentDisplayList {


    backboneGroups:Array<Array<S3Identified>>
    ungrouped:Array<S3Identified>


    static fromComponent(graph:Graph, component:S3Component):ComponentDisplayList {

        return new ComponentDisplayList(graph, component)

    }



    private constructor(graph:Graph, cd:S3Component) {
        

        const visited:Set<string> = new Set()


        /* first everything with locations goes in one set
         */
        const saSet:Set<string> = new Set()

        for(let sc of cd.subComponents) {
            //console.log(sc)

            if(sc.locations.length > 0) {

                saSet.add(sc.uri)
                visited.add(sc.uri)

            }
        }

        for(let sc of cd.sequenceFeatures) {

            //console.log(sc)

            if(sc.locations.length > 0) {

                saSet.add(sc.uri)
                visited.add(sc.uri)

            }

        }


        const sets:Set<Set<string>> = new Set()

        if(saSet.size > 0)
            sets.add(saSet)


        /* now we need to group together things linked by constraints
         */
        for(let sc of cd.sequenceConstraints) {

           let firstSet:Set<string>|null = null

           for(let set of sets) {

               if(set.has(sc.constraintSubject.uri) || set.has(sc.constraintObject.uri)) {

                   if(firstSet !== null) {

                      for(let elem of set)
                        firstSet.add(elem)
                    
                      set.clear()

                   } else {

                       set.add(sc.constraintSubject.uri)
                       set.add(sc.constraintObject.uri)
                       visited.add(sc.constraintSubject.uri)
                       visited.add(sc.constraintObject.uri)

                       firstSet = set
                   }
               } 
           }

           if(!firstSet) {

               let newSet:Set<string> = new Set()
               newSet.add(sc.constraintSubject.uri)
               newSet.add(sc.constraintObject.uri)
               visited.add(sc.constraintSubject.uri)
               visited.add(sc.constraintObject.uri)
               sets.add(newSet)

           }
               
        }


        this.backboneGroups = []

        for(let set of Array.from(new Set(sets.values()))) {

            if(set.size === 0)
                continue

            this.backboneGroups.push(expandLocations(Array.from(set).map((uri:string) => {

                console.log(uri, 'contained in backbone group')

                const facade:Facade|undefined = sbol3(graph).uriToFacade(uri)

                if(!facade)
                    throw new Error('???')

                if(!(facade instanceof S3Identified))
                    throw new Error('???')

                return facade

            })))
        
        }
        

        /* we need to expand SCs and features to all their locations
         */


        this.ungrouped = cd.subComponents.filter((c:S3SubComponent) => {
            return !visited.has(c.uri)
        })

        console.dir(this.backboneGroups)


        //console.log('ComponentDisplayList', cd.displayName, this.backboneGroups.length + ' backbone group(s)')
        //console.log('ComponentDisplayList',  cd.displayName,this.ungrouped.length + ' ungrouped')



        // might not have any locations cos it's positioned only by a sequenceconstraint


        function expandLocations(children:Array<S3Identified>):Array<S3Location|S3SequenceFeature|S3SubComponent> {

            const res:Array<S3Location> = []

            for(let child of children) {

                Array.prototype.push.apply(res, expandChildLocations(child))
                //Array.prototype.push.apply(res, [ child ])

            }

            return res
        }

        function expandChildLocations(child:S3Identified):Array<S3Location|S3SequenceFeature|S3SubComponent> {

            var locations

            if(child instanceof S3SequenceFeature) {

                locations = (child as S3SequenceFeature).locations

            } else if(child instanceof S3SubComponent) {

                locations = (child as S3SubComponent).locations

            } else {

                throw new Error('???')
            
            }

            if(locations.length > 0) {
                return locations
            }

            return [ child ]

        }
    }
}