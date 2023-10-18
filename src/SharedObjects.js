// jsons
import vaardigheden from './json/vaardigheden.json';
import spreuken from './json/spreuken.json';
import recepten from './json/recepten.json';
import presets from './json/presets.json';

// functions
import {
    generateOptions,
    regenerateOptions
} from './SharedActions.js';

// --- PRESETS --- ///
export const getPresets= () => { return presets; }

/// --- SKILLS & SELECT PROPERTIES --- ///

// total XP
export let totalXP = 0;
export function setTotalXP(value) { totalXP = value; }
export function resetTotalXP(tableData) { totalXP = tableData.length > 0 ? tableData.reduce((accumulator, skill) => accumulator + skill.xp, 0) : 0 }

// vaardigheden
export const sourceBasisVaardigheden = vaardigheden.BasisVaardigheden;
export let optionsBasisVaardigheden = generateOptions(sourceBasisVaardigheden);
export function regeneratedBasisVaardigheden(tableData) { optionsBasisVaardigheden = regenerateOptions(sourceBasisVaardigheden, tableData); }

export const sourceExtraVaardigheden = vaardigheden.ExtraVaardigheden;
export let optionsExtraVaardigheden = generateOptions(sourceExtraVaardigheden);
export function regeneratedExtraVaardigheden(tableData) { optionsExtraVaardigheden = regenerateOptions(sourceExtraVaardigheden, tableData); }

export const sourceSpreuken = [].concat(...spreuken.Categories.map(category => category.Skills));
export const sourceRecepten = [].concat(...recepten.Categories.map(category => category.Skills));

/// --- TABLE PROPERTIES --- ///
export const defaultProperties = [
    { name: "hitpoints", image: "./images/image_hp.png", text: "Totaal HP", value: 1 },
    { name: "armourpoints", image: "./images/image_ap.png", text: "Max AP", value: 0 },
    { name: "elemental_mana", image: "./images/image_em.png", text: "Elementaire Mana", value: 0 },
    { name: "elemental_ritual_mana", image: "./images/image_erm.png", text: "Rituele Elementaire Mana", value: 0 },
    { name: "spiritual_mana", image: "./images/image_sm.png", text: "Spirituele Mana", value: 0 },
    { name: "spiritual_ritual_mana", image: "./images/image_srm.png", text: "Rituele Spirituele Mana", value: 0 },
    { name: "inspiration", image: "./images/image_ins.png", text: "Inspiratie", value: 0 },
    { name: "willpower", image: "./images/image_wil.png", text: "Wilskracht", value: 0 },
    { name: "glyph_craft_cap", image: "./images/image_glp_cra.png", text: "Glyph Craft cap", value: 0 },
    { name: "glyph_imbue_cap", image: "./images/image_glp_imb.png", text: "Glyph Imbue cap", value: 0 },
    { name: "rune_craft_cap", image: "./images/image_run_cra.png", text: "Rune Craft cap", value: 0 },
    { name: "rune_imbue_cap", image: "./images/image_run_imb.png", text: "Rune Imbue cap", value: 0 }
];