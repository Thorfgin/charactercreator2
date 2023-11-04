import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';

import {
    test,
    expect
} from '@jest/globals';

// shared
import { getSpreuken } from '../src/SharedObjects.js';

// json
import spreuken_schema from './schemas/spreuken-schema.json';

// globals
const sourceSpreuken = getSpreuken();

/// --- UNIQUE SPELL ID'S --- ///
function hasUniqueIDs(jsonData) {
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

test('Spreuken JSON should have unique IDs per Spell', () => {
    expect(hasUniqueIDs(sourceSpreuken)).toBe(true);
});

/// --- FORMATTING --- ///

function hasCorrectFormat(jsonData, schema) {
    const ajv = new Ajv({ allErrors: true });
    ajvKeywords(ajv);
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