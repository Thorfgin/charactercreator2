import { test } from '@jest/globals';


// Globals
import {
    sourceSpreuken,
    sourceRecepten,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden
} from '../src/SharedObjects.js';


function returnIdAndSkill(jsonData) {
    const uniqueIDs = { skills: [] }
    jsonData.forEach((skill) => {
        const currentSkill = { id: skill.id, skill: skill.skill }
        uniqueIDs.skills.push(currentSkill)
    });
    
    return uniqueIDs;
}

function returnIdSkillAndSpell(jsonData) {
    const uniqueIDs = { spells: [] }

    jsonData.forEach((skill) => {
        const currentSpells = [];
        skill.Spells.forEach((spell) => { currentSpells.push({ id: spell.id, spell: spell.spell }) });
        const currentSkill = { id: skill.id, skill: skill.skill, spells: currentSpells }
        uniqueIDs.spells.push(currentSkill)
    });
    return JSON.stringify(uniqueIDs);
}

test('List all skill IDs in readbable format', () => {
    // console.log(returnIdAndSkill(sourceBasisVaardigheden));
    // console.log(returnIdAndSkill(sourceExtraVaardigheden));
    // console.log(returnIdSkillAndSpell(sourceSpreuken));
    // console.log(returnIdAndSkill(sourceRecepten));
});