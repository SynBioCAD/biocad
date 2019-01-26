
import { SBOLXGraph, SBOL2Graph } from "sbolgraph";

export default class SBOLConverterValidator {

    static async sxToGenbank(g:SBOLXGraph) {

        let sbol2Graph = new SBOL2Graph()
        await sbol2Graph.loadString(g.serializeXML())

        let res = await fetch('http://www.async.ece.utah.edu/validate/', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'options': {
                    'test_equality': false,
                    'check_uri_compliance': false,
                    'check_completeness': false,
                    'check_best_practices': false,
                    'fail_on_first_error': false,
                    'provide_detailed_stack_trace': true,
                    'subset_uri': '',
                    'uri_prefix': 'http://biocad.io/',
                    'version': '',
                    'insert_type': false,
                    'main_file_name': 'main file',
                    'diff_file_name': 'comparison file',
                    'language': 'GenBank'
                },
                'return_file': true,
                'main_file': sbol2Graph.serializeXML()
            })
        })

        console.dir(res)

        if(!res['output_file']) {
            throw new Error(JSON.stringify(res))
        }

        return res['output_file']
    }

    static async sxToFASTA(g:SBOLXGraph) {

        let sbol2Graph = new SBOL2Graph()
        await sbol2Graph.loadString(g.serializeXML())

        let res = await fetch('http://www.async.ece.utah.edu/validate/', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'options': {
                    'test_equality': false,
                    'check_uri_compliance': false,
                    'check_completeness': false,
                    'check_best_practices': false,
                    'fail_on_first_error': false,
                    'provide_detailed_stack_trace': true,
                    'subset_uri': '',
                    'uri_prefix': 'http://biocad.io/',
                    'version': '',
                    'insert_type': false,
                    'main_file_name': 'main file',
                    'diff_file_name': 'comparison file',
                    'language': 'FASTA'
                },
                'return_file': true,
                'main_file': sbol2Graph.serializeXML()
            })
        })

        console.dir(res)

        if(!res['output_file']) {
            throw new Error(JSON.stringify(res))
        }

        return res['output_file']
    }

}