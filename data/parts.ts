
import { Prefixes, Specifiers } from 'bioterms'

const parts = [

    ///
    /// SBOLV
    /// 

    {
        shortName: 'cds',
        longName: 'Coding Sequence',
        soTerm: Specifiers.SO.CDS,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 128,
        defaultHeight: 32
    },

    {
        shortName: 'promoter',
        longName: 'Promoter',
        soTerm: Specifiers.SO.Promoter,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'rbs',
        longName: 'Ribosome Binding Site',
        soTerm: Specifiers.SO.RBS,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'restriction_site',
        longName: 'Restriction Site',
        soTerm: Specifiers.SO.RestrictionSite,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'blunt_restriction_site',
        longName: 'Blunt Restriction Site',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0001691',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'terminator',
        longName: 'Terminator',
        soTerm: Specifiers.SO.Terminator,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    
    {
        shortName: 'user_defined',
        longName: 'User Defined Part',
        typeUri: Specifiers.SBOL2.Type.DNA,
        soTerm: Specifiers.SO.EngineeredRegion,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'origin_of_replication',
        longName: 'Origin of Replication',
        soTerm: Specifiers.SO.OriginOfReplication,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'origin_of_transfer',
        longName: 'Origin of Transfer',
        soTerm: Specifiers.SO.OriginOfTransfer,
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'aptamer',
        longName: 'Aptamer',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000031',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'operator',
        longName: 'Operator',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000057',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'primer_binding_site',
        longName: 'Primer Binding Site',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0005850',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'engineered_region',
        longName: 'Engineered Region',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000280',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'recombination_site',
        longName: 'Recombination Site',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000299',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'poly_a',
        longName: 'PolyA',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000553',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },

    {
        shortName: 'insulator',
        longName: 'Insulator',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000627',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'biopolymer_junction',
        longName: 'Biopolymer Junction',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000699',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'biopolymer_base',
        longName: 'Biopolymer Base',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0001236',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'biopolymer_amino_acid',
        longName: 'Biopolymer Amino Acid',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0001237',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'non_coding_rna_gene',
        longName: 'Non-coding RNA Gene',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0001263',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'protein_stability',
        longName: 'Protein Stability',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0001546',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'protein_domain',
        longName: 'Protein Domain',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000417',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'tag',
        longName: 'Tag',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000324',
        typeUri: Specifiers.SBOL2.Type.DNA,
        defaultLength: 2,
        defaultHeight: 2
    },
    {
        shortName: 'protein',
        longName: 'Protein',
        soTerm: Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000104',
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 2,
        defaultHeight: 2
    },







    ///
    /// PROTLANG
    /// 

    {
        shortName: 'localization-tag-reversible',
        longName: 'Localization, Retained',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'localization-tag-irreversible',
        longName: 'Localization, Cleaved',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
       {
        shortName: 'biochemical-tag',
        longName: 'Biochemical Tag',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'catalytic-site',
        longName: 'Catalytic',
        soTerm: Specifiers.GO.CatalyticActivity,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'binding-site',
        longName: 'Binding',
        soTerm: Specifiers.GO.ProteinBinding,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'protein-cleavage-site',
        longName: 'Cleavage',
        soTerm: Specifiers.GO.ProteinProcessing,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'degradation-tag',
        longName: 'Degradation',
        soTerm: Specifiers.GO.ProteinDepolymerization,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'covalent-modification',
        longName: 'Covalent',
        soTerm: Specifiers.GO.CovalentChromatinModification,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'defined-region',
        longName: 'Structured Region',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'membrane-static',
        longName: 'Membrane',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'linker',
        longName: 'Omitted Region',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
        defaultLength: 128,
        defaultHeight: 32
    },
    {
        shortName: 'stability-element',
        longName: 'Stability Element',
        soTerm: Specifiers.SO.EngineeredRegion,
        typeUri: Specifiers.SBOL2.Type.Protein,
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


