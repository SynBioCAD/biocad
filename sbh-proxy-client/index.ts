
import request = require('request')
import { Graph } from 'sboljs'

const URL = 'http://localhost:9992'


export interface SearchResult {
    description:string
    displayId:string
    name:string
    svg:string
    uri:string
    version:string
}

export function search():Promise<SearchResult[]> {

    return new Promise((resolve, reject) => {

        request({
            method: 'get',
            url: URL + '/search'
        }, (err, res, body) => {

            if(err)
                reject(err)
            else if(res.statusCode && res.statusCode >= 300)
                reject('HTTP ' + res.statusCode)
            else
                resolve(JSON.parse(body))


        })

    })

}



