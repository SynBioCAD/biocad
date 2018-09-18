
    
 // silence warning about private name
 import { Vec2 } from 'jfw/geom'

var prefix = 'http://biocad.io/font/sbolv/'

import aptamer from './aptamer'
import assembly_scar from './assembly_scar'
import non_coding_rna_gene from './non_coding_rna_gene'
import signature from './signature'
import sticky_restriction_site_5 from './sticky_restriction_site_5'
import primer_binding_site from './primer_binding_site'
import biopolymer_junction from './biopolymer_junction'
import biopolymer_base from './biopolymer_base'
import biopolymer_amino_acid from './biopolymer_amino_acid'
import blunt_restriction_site from './blunt_restriction_site'
import cds from './cds'
import engineered_region from './engineered_region'
import helix from './helix'
import insulator from './insulator'
import mature_transcript_region from './mature_transcript_region'
import operator from './operator'
import origin_of_replication from './origin_of_replication'
import origin_of_transfer from './origin_of_transfer'
import poly_a from './poly_a'
import promoter from './promoter'
import protease_site from './protease_site'
import protein_stability from './protein_stability'
import protein_domain from './protein_domain'
import recombination_site from './recombination_site'
import rbs from './rbs'
import restriction_site from './restriction_site'
import ribonuclease_site from './ribonuclease_site'
import rna_stability from './rna_stability'
import stem_loop from './stem_loop'
import tag from './tag'
import terminator from './terminator'
import no_glyph_assigned from './no_glyph_assigned'
import unspecified from './unspecified'
import protein from './protein'
import rna from './rna'
import dna from './dna'
//this is the glyph for complex when we can't specify its type
import complex from './complex'
import small_molecule_complex from './small_molecule_complex'
import small_molecule_circle from './small_molecule_circle'
import user_defined from './user_defined'

import plasmid_cds from  './plasmid_cds'


let glyphs = {
    aptamer,
    assembly_scar,
    non_coding_rna_gene,
    signature,
    sticky_restriction_site_5,
    primer_binding_site,
    biopolymer_junction,
    biopolymer_base,
    biopolymer_amino_acid,
    blunt_restriction_site,
    cds,
    engineered_region,
    helix,
    insulator,
    mature_transcript_region,
    operator,
    origin_of_replication,
    origin_of_transfer,
    poly_a,
    promoter,
    protease_site,
    protein_stability,
    protein_domain,
    recombination_site,
    rbs,
    restriction_site,
    ribonuclease_site,
    rna_stability,
    stem_loop,
    tag,
    terminator,
    no_glyph_assigned,
    unspecified,
    protein,
    rna,
    dna,
    complex,
    small_molecule_complex,
    small_molecule_circle,
    plasmid_cds,
    user_defined
}


let glyphMapping = {}

for(let k of Object.keys(glyphs)) {
    glyphMapping[prefix + k] = glyphs[k]
}

export default {
    prefix: prefix,
    mapping: glyphMapping
}


