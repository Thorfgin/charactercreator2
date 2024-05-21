import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import ajvErrors from 'ajv-errors';

import {
    test,
    expect
} from '@jest/globals';

// shared
import {
    getSpreuken,
} from '../src/SharedObjects.js';

import {
    getSkillById,
    getSpellBySkill,
} from '../src/SharedActions.js';


const sourceSpreuken = getSpreuken();

// json
import spreuken_schema from './schemas/spreuken-schema.json';

/// --- UNIQUE SPELL ID'S --- ///
function hasUniqueSpellIDs(jsonData) {
    const spells = new Set(jsonData.Categories.flatMap(category =>
        category.Skills.flatMap(skill => skill.Spells)
    ));

    const duplicateIDs = new Set();
    const uniqueIDs = new Set();

    spells.forEach(spell => {
        if (uniqueIDs.has(spell.id)) { duplicateIDs.add({ id: spell.id, spell: spell.spell }); }
        else { uniqueIDs.add(spell.id); }
    });

    if (duplicateIDs.size > 0) { console.warn('Duplicate Spell IDs:', duplicateIDs); }
    return duplicateIDs.size === 0;
}

// Chccks if the provided JSON data spell skill id definitions actualy exist in the vaardigheden
function hasExistingSkillIDs(jsonData) {
    const spellSkillIds = new Set(jsonData.Categories.flatMap(category => category.Skills.flatMap(skill => skill.id)));
    const faultyIDs = new Set();
    spellSkillIds.forEach(id => {
        const skill = getSkillById(id)
        if (!skill || skill === null) { faultyIDs.add(id); }
    });
 
    if (faultyIDs.size > 0) { console.warn('faulty Spell SkillIDs:', faultyIDs); }
    return faultyIDs.size === 0;
}

test('Spreuken JSON should have skill IDs per Spell that exist', () => {
    expect(hasExistingSkillIDs(sourceSpreuken)).toBe(true);
});


test('Spreuken JSON should have unique IDs per Spell', () => {
    expect(hasUniqueSpellIDs(sourceSpreuken)).toBe(true);
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
        console.log("Spreuken JSON is not valid:", validate.errors);
        return false;
    }
}

test('Skills in Spreuken JSON should have the correct format', () => {
    expect(hasCorrectFormat(sourceSpreuken, spreuken_schema)).toBe(true);
});