

import { SXSequenceFeature, SXSubComponent, SXSequenceConstraint, SXComponent, SXIdentified, SXLocation } from "sbolgraph"

export default class SXComponentDisplayList {


    backboneGroups:Array<Array<SXIdentified>>
    ungrouped:Array<SXIdentified>


    static fromComponent(SXComponent:SXComponent):SXComponentDisplayList {

        return new SXComponentDisplayList(SXComponent)

    }



    private constructor(cd:SXComponent) {
        

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

               if(set.has(sc.subject.uri) || set.has(sc.object.uri)) {

                   if(firstSet !== null) {

                      for(let elem of set)
                        firstSet.add(elem)
                    
                      set.clear()

                   } else {

                       set.add(sc.subject.uri)
                       set.add(sc.object.uri)
                       visited.add(sc.subject.uri)
                       visited.add(sc.object.uri)

                       firstSet = set
                   }
               } 
           }

           if(!firstSet) {

               let newSet:Set<string> = new Set()
               newSet.add(sc.subject.uri)
               newSet.add(sc.object.uri)
               visited.add(sc.subject.uri)
               visited.add(sc.object.uri)
               sets.add(newSet)

           }
               
        }


        this.backboneGroups = []

        for(let set of Array.from(new Set(sets.values()))) {

            if(set.size === 0)
                continue

            this.backboneGroups.push(expandLocations(Array.from(set).map((uri:string) => {

                console.log(uri, 'contained in backbone group')

                const facade:SXIdentified|undefined = cd.graph.uriToFacade(uri)

                if(!facade)
                    throw new Error('???')

                return facade

            })))
        
        }
        

        /* we need to expand SCs and features to all their locations
         */


        this.ungrouped = cd.subComponents.filter((c:SXSubComponent) => {
            return !visited.has(c.uri)
        })

        console.dir(this.backboneGroups)


        //console.log('ComponentDisplayList', cd.displayName, this.backboneGroups.length + ' backbone group(s)')
        //console.log('ComponentDisplayList',  cd.displayName,this.ungrouped.length + ' ungrouped')



        // might not have any locations cos it's positioned only by a sequenceconstraint


        function expandLocations(children:Array<SXIdentified>):Array<SXLocation|SXSequenceFeature|SXSubComponent> {

            const res:Array<SXLocation> = []

            for(let child of children) {

                Array.prototype.push.apply(res, expandChildLocations(child))
                //Array.prototype.push.apply(res, [ child ])

            }

            return res
        }

        function expandChildLocations(child:SXIdentified):Array<SXLocation|SXSequenceFeature|SXSubComponent> {

            var locations

            if(child instanceof SXSequenceFeature) {

                locations = (child as SXSequenceFeature).locations

            } else if(child instanceof SXSubComponent) {

                locations = (child as SXSubComponent).locations

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