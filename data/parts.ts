
import { Prefixes, Specifiers } from 'bioterms'

const parts = [

    ///
    /// SBOLV
    /// 

    {
        shortName: 'CDS',
        longName: 'Coding Sequence',
        soTerm: Specifiers.SO.CDS,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 128,
        defaultHeight: 32
    }

]


export function shortNameFromTerm(uri:string) {

    return soToGlyphType('SO:' + uri.split('SO:')[1])
                || soToGlyphType('GO:' + uri.split('GO:')[1]) 
                || soToGlyphType('SO:' + uri.split('SO_')[1]) 
                || soToGlyphType('GO:' + uri.split('GO_')[1]) 
                || ''
}

export default parts

function soToGlyphType(so) {

    for(var i = 0; i < parts.length; ++ i) {

        const term = parts[i].soTerm

        if(term.indexOf('SO:') !== -1) {
            if(parts[i].soTerm.split('SO:')[1] === so.split('SO:')[1]) {
                return parts[i].shortName
            }
        }

        if(term.indexOf('GO:') !== -1) {
            if(parts[i].soTerm.split('GO:')[1] === so.split('GO:')[1]) {
                return parts[i].shortName
            }
        }
    }

    return ({
      "SO:0000057": "operator",
      "SO:0000110": "scar",
      "SO:0000139": "rbs",
      "SO:0000141": "terminator",
      "SO:0000167": "promoter",
      "SO:0000169": "promoter",
      "SO:0000170": "promoter",
      "SO:0000171": "promoter",
      "SO:0000243": "rbs",
      "SO:0000296": "origin",
      "SO:0000297": "origin",
      "SO:0000313": "stem-loop",
      "SO:0000316": "cds",
      "SO:0000436": "origin",
      "SO:0000552": "rbs",
      "SO:0000568": "promoter",
      "SO:0000613": "promoter",
      "SO:0000614": "terminator",
      "SO:0000615": "terminator",
      "SO:0000617": "promoter",
      "SO:0000618": "promoter",
      "SO:0000621": "promoter",
      "SO:0000627": "insulator",
      "SO:0000724": "origin",
      "SO:0000750": "origin",
      "SO:0000834": "mature-transcript-region",
      "SO:0000935": "cds",
      "SO:0000951": "terminator",
      "SO:0000952": "origin",
      "SO:0000953": "origin",
      "SO:0000981": "terminator",
      "SO:0000982": "terminator",
      "SO:0001203": "promoter",
      "SO:0001204": "promoter",
      "SO:0001205": "promoter",
      "SO:0001206": "promoter",
      "SO:0001207": "promoter",
      "SO:0001384": "cds",
      "SO:0001647": "rbs",
      "SO:0001669": "promoter",
      "SO:0001671": "promoter",
      "SO:0001672": "promoter",
      "SO:0001687": "restriction-site",
      "SO:0001691": "blunt-rts",
      "SO:0001692": "restriction-site",
      "SO:0001896": "cds",
      "SO:0001913": "promoter",
      "SO:0001953": "assembly-scar",
      "SO:0001955": "pse",
      "SO:0001956": "pts",
      "SO:0001957": "rse",
      "SO:0001975": "restriction-site",
      "SO:0001976": "restriction-site",
      "SO:0002050": "promoter",
      "SO:0002051": "promoter",
      "SO:0005850": "primer-binding-site",
      "SO:1001246": "cds",
      "SO:1001247": "cds",
      "SO:1001249": "cds",
      "SO:1001251": "cds",
      "SO:1001254": "cds",
      "SO:1001259": "cds",
      "SO:1001260": "rbs",
    })[so];

}


