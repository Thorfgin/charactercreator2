import {
    test,
    expect
} from '@jest/globals';
import sourceVaardigheden from '../src/json/vaardigheden.json';

// Test for Unique Skill id's
function hasUniqueSpellIDs(jsonArray) {
    const skills = [];
    for (const skill of jsonArray) {
        skills.push(skill.id);
    }

    const duplicateIDs = new Set();
    const set = new Set();
    for (const id of skills) {
        if (set.has(id)) {
            duplicateIDs.add(id);
        } else {
            set.add(id);
        }
    }
    if (duplicateIDs.size > 0) { console.warn('Duplicate IDs:', duplicateIDs); }
    return duplicateIDs.size === 0;
}

// Test cases
test('BasisVaardigheden JSON should have unique IDs per Skill', () => {
    expect(hasUniqueSpellIDs(sourceVaardigheden.BasisVaardigheden)).toBe(true);
});

test('ExtraVaardigheden JSON should have unique IDs per Skill', () => {
    expect(hasUniqueSpellIDs(sourceVaardigheden.ExtraVaardigheden)).toBe(true);
});