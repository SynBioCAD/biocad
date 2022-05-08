
export class SearchQuery {

    criteria:any[]

    constructor() {
        this.criteria = []
    }


    add(key:string, value:string) {

        this.criteria.push({ key: key, value: value })

    }

    addObjectType(name:string) {

        this.add('objectType', name)

    }

    addRole(uri:string) {

        this.add('role', '<' + uri + '>')

    }


}

export class SearchResult {

    description:string
    displayId:string
    name:string
    uri:string
    version:string

}

export default class Repo {

    url:string

    constructor(url:string) {

        this.url = url

    }

    async searchMetadata(query:SearchQuery):Promise<Array<SearchResult>> {

        var params = ''

        var isFirst = true

        query.criteria.forEach((c:any) => {

            //if(isFirst)
                //isFirst = false
            //else

            params += c.key
            params += '='
            params += c.value
            params += '&'
        
        })

        let r = await fetch(this.url + '/remoteSearch/' + encodeURIComponent(params))

        let results:SearchResult[] = await r.json()

        return results
    }

}
