import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';

import {
    test,
    expect
} from '@jest/globals';

// shared
import { getRecepten } from '../src/SharedObjects.js';

// json
import recepten_schema from './schemas/recepten-schema.json';

// globals
const sourceRecepten = getRecepten();

/// --- UNIQUE SPELL ID'S --- ///
function hasUniqueIDs(jsonData) {
    const recipes = new Set(jsonData.Categories.flatMap(category =>
        category.Skills.flatMap(skill => skill.Recipes)
    ));
    const duplicateIDs = new Set();
    const uniqueIDs = new Set();

    recipes.forEach(recipy => {
        if (uniqueIDs.has(recipy.id)) { duplicateIDs.add({ id: recipy.id, recipy: recipy.recipy }); }
        else { uniqueIDs.add(recipy.id); }
    });

    if (duplicateIDs.size > 0) { console.warn('Duplicate Recipy IDs:', duplicateIDs); }
    return duplicateIDs.size === 0;
}

// Test cases
test('Recepten JSON should have unique IDs per Recipy', () => {
    expect(hasUniqueIDs(sourceRecepten)).toBe(true);
});


/// --- FORMATTING --- ///
function hasCorrectFormat(jsonData, schema) {
    const ajv = new Ajv(); // { allErrors: true });
    ajvKeywords(ajv);
    const validate = ajv.compile(schema);
    const result = validate(jsonData)

    if (result === true) { return true; }
    else
    {
        console.warn("Recepten JSON is not valid:", validate.errors);
        return false;
    }
}

test('Skills in Recepten JSON should have the correct format', () => {
    expect(hasCorrectFormat(sourceRecepten, recepten_schema)).toBe(true);
});