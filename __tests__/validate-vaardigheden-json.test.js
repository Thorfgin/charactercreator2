import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import ajvErrors from 'ajv-errors';

import {
    test,
    expect
} from '@jest/globals';

// shared
import {
    getSkillById,
    getSpellBySkill,
    getRecipyBySkill,
    getPropertyByName,
    getPdfURL
} from '../src/SharedActions.js';

import {
    getSourceVaardigheden,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden
} from '../src/SharedObjects.js';

// json
import vaardigheden_schema from './schemas/vaardigheden-schema.json';


const sourceVaardigheden = getSourceVaardigheden();


/// --- UNIQUE SKILL ID'S --- ///
function hasUniqueIDs(jsonData) {
    const uniqueIDs = new Set();
    const duplicateIDs = new Set();

    jsonData.forEach((skill) => {
        if (uniqueIDs.has(skill.id)) { duplicateIDs.add({ id: skill.id, skill: skill.skill }); }
        else { uniqueIDs.add(skill.id); }
    });

    if (duplicateIDs.size > 0) { console.warn('Duplicate Skill IDs:', Array.from(duplicateIDs)); }
    return duplicateIDs.size === 0;
}

test('Skills in BasisVaardigheden JSON should have unique IDs', () => {
    expect(hasUniqueIDs(sourceBasisVaardigheden)).toBe(true);
});

test('Skills in ExtraVaardigheden JSON should have unique IDs', () => {
    expect(hasUniqueIDs(sourceExtraVaardigheden)).toBe(true);
});

/// --- FORMATTING --- ///
function hasCorrectFormat(jsonData, schema) {
    const ajv = new Ajv({ allErrors: true });
    ajvKeywords(ajv);
    ajvErrors(ajv);
    const validate = ajv.compile(schema);
    const result = validate(jsonData)

    if (result === true) {
        return true;
    } else {
        console.warn("Vaardigheden JSON is not valid:", validate.errors);
        return false;
    }
}

test('Skills in Vaardigheden JSON should have the correct format', () => {
    expect(hasCorrectFormat(sourceVaardigheden, vaardigheden_schema)).toBe(true);
});

/// --- PREREQUISITES --- ///
function hasValidSkillPrerequisite(jsonData) {
    let faultyRecords = [];
    faultyRecords = jsonData.flatMap(sourceSkill => sourceSkill.Requirements.skill);
    const result = faultyRecords.filter(id => !getSkillById(id))
    const filteredResults = result.map(faultySkill => ({
        source_id: faultySkill.id,
        source: faultySkill.skill,
    }));

    if (filteredResults.length > 0) { console.warn('Faulty skill: ', filteredResults); }
    return filteredResults.length === 0;
}

function hasValidAnyListPrerequisite(jsonData) {
    let faultyRecords = [];
    faultyRecords = jsonData.flatMap(sourceSkill => sourceSkill.Requirements.any_list);
    const result = faultyRecords.filter(id => !getSkillById(id))
    const filteredResults = result.map(faultySkill => ({
        source_id: faultySkill.id,
        source: faultySkill.skill,
    }));

    if (filteredResults.length > 0) { console.warn('Faulty any_list skill:', filteredResults); }
    return filteredResults.length === 0;
}

function hasValidCategoriePrerequisite(jsonData) {
    const uniqueCategories = new Set();
    const faultyRecords = [];

    const collectUniqueCategories = (skills) => {
        skills.forEach((skill) => {
            if (!uniqueCategories.has(skill.category)) { uniqueCategories.add(skill.category); }
        });
    };

    collectUniqueCategories(sourceBasisVaardigheden);
    collectUniqueCategories(sourceExtraVaardigheden);

    for (const sourceSkill of jsonData) {
        sourceSkill.Requirements?.Category?.name.forEach((categoryName) => {
            if (!uniqueCategories.has(categoryName)) {
                faultyRecords.push({
                    source: sourceSkill.skill,
                    fail: categoryName,
                });
            }
        });

    }

    if (faultyRecords.length > 0) { console.warn('Faulty skill categorie:', faultyRecords); }
    return faultyRecords.length === 0;
}

test('Skills listed as Skill Requirement in BasisVaardigheden JSON should themselves exist', () => {
    expect(hasValidSkillPrerequisite(sourceBasisVaardigheden)).toBe(true);
    expect(hasValidAnyListPrerequisite(sourceBasisVaardigheden)).toBe(true);
    expect(hasValidCategoriePrerequisite(sourceBasisVaardigheden)).toBe(true);
});

test('Skills listed as Skill Requirement in ExtraVaardigheden JSON should themselves exist', () => {
    expect(hasValidSkillPrerequisite(sourceExtraVaardigheden)).toBe(true);
    expect(hasValidAnyListPrerequisite(sourceExtraVaardigheden)).toBe(true);
    expect(hasValidCategoriePrerequisite(sourceExtraVaardigheden)).toBe(true);
});

/// --- SPREUKEN  --- ///
function listedSpellsExist(jsonArray) {
    const faultyRecords = jsonArray.flatMap(skill =>
        skill.Spreuken
            .filter(spell_id => !getSpellBySkill(skill.id, spell_id))
            .map(spell_id => ({ id: skill.id, skill: skill.skill, spell_id }))
    );

    if (faultyRecords.length > 0) { console.warn('Faulty skills/spells:', faultyRecords); }
    return faultyRecords.length === 0;
}

test('Skill with Spells listed in BasisVaardigheden JSON should exist in Spreuken JSON', () => {
    expect(listedSpellsExist(sourceBasisVaardigheden)).toBe(true);
});

test('Skill with Spells listed in ExtraVaardigheden JSON should exist in Spreuken JSON', () => {
    expect(listedSpellsExist(sourceExtraVaardigheden)).toBe(true);
});

/// --- RECEPTEN  --- ///
function listedRecipesExist(jsonArray) {
    const faultyRecords = jsonArray.flatMap((skill) =>
        skill.Recepten
            .filter((recipe_id) => !getRecipyBySkill(skill.id, recipe_id))
            .map((recipe_id) => ({ id: skill.id, skill: skill.skill, recipe_id }))
    );

    if (faultyRecords.length > 0) { console.warn('Faulty skills/recipes:', faultyRecords); }
    return faultyRecords.length === 0;
}

test('Skill with Recipes listed in BasisVaardigheden JSON should exist in Recepten JSON', () => {
    expect(listedRecipesExist(sourceBasisVaardigheden)).toBe(true);
});

test('Skill with Recipes listed in ExtraVaardigheden JSON should exist in Recepten JSON', () => {
    expect(listedRecipesExist(sourceExtraVaardigheden)).toBe(true);
});

/// --- EIGENSCHAPPEN --- ///
function listedEigenschappenExist(jsonArray) {
    const faultyRecords = jsonArray.flatMap((skill) => skill.Eigenschappen
        .filter((eigenschap) => !getPropertyByName(eigenschap.name))
        .map((name) => ({ skill: skill.skill, name }))
    );

    if (faultyRecords.length > 0) { console.warn('Faulty Eigenschap:', faultyRecords); }
    return faultyRecords.length === 0;
}

test('Skill with Eigenschappen listed in BasisVaardigheden JSON should exist in Eigenschappen table', () => {
    expect(listedEigenschappenExist(sourceBasisVaardigheden)).toBe(true);
});

test('Skill with Eigenschappen listed in ExtraVaardigheden JSON should exist in Eigenschappen table', () => {
    expect(listedEigenschappenExist(sourceExtraVaardigheden)).toBe(true);
});

/// --- OVERIGE --- ///
function listedPDFExist(jsonArray) {
    const faultyRecords = new Set();

    jsonArray.forEach((item) => {
        const pdfName = item.loresheet?.pdf;
        if (pdfName && getPdfURL(pdfName) === "") { faultyRecords.add(pdfName); }
    });

    if (faultyRecords.size > 0) { console.warn('Faulty PDF name:', Array.from(faultyRecords)); }
    return faultyRecords.size === 0;
}

function listedSpecialExist(jsonArray) {
    const faultyRecords = new Set();

    jsonArray.forEach((item) => {
        const specialName = item.loresheet?.special;
        if (specialName && getPdfURL(specialName) === "") { faultyRecords.add(specialName); }
    });

    if (faultyRecords.size > 0) { console.warn('Faulty PDF name:', Array.from(faultyRecords)); }
    return faultyRecords.size === 0;
}

// loresheet
test('Skill with Loresheet listed in BasisVaardigheden JSON should exist in PDF Url adressess', () => {
    expect(listedPDFExist(sourceBasisVaardigheden)).toBe(true);
    expect(listedSpecialExist(sourceBasisVaardigheden)).toBe(true);
});

test('Skill with Loresheet listed in ExtraVaardigheden JSON should exist in PDF Url adressess', () => {
    expect(listedPDFExist(sourceExtraVaardigheden)).toBe(true);
    expect(listedSpecialExist(sourceExtraVaardigheden)).toBe(true);
});
