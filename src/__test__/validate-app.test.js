import { useState} from 'react';
import {
    meetsAllPrerequisites,
    isSkillAPrerequisiteToAnotherSkill,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden
    } from '../../src/App.js';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))


// Replace ë with the Unicode
function replaceChar(word) { return word.replace(/ë/g, '\u00EB') }


// Fetch skills from BasisVaardigheden
function getSkillsFromBasisVaardigheden(skillNames) {
    const mockTableData = []
    for (const skillName of skillNames) {
        const sourceRecord = sourceBasisVaardigheden.find((record) => record.skill.toLowerCase() === skillName.toLowerCase());
        mockTableData.push(sourceRecord);
    }
    return mockTableData;
}

// Fetch skills from BasisVaardigheden
function getSkillsFromExtraVaardigheden(skillNames) {
    const mockTableData = []
    for (const skillName of skillNames) {
        const sourceRecord = sourceExtraVaardigheden.find((record) => record.skill.toLowerCase() === skillName.toLowerCase());
        mockTableData.push(sourceRecord);
    }
    return mockTableData;
}


/// --- Pre-Requisites --- ///

// DELETE SKILL // 

// Single Skill
test('Cannot remove a Skill that is a prerequisite of type: skill', () => {
    const setStateMock = jest.fn();
    useState.mockImplementation(init => [init, setStateMock])
    const [modalMsg, setModalMsg] = useState("");    

    const mockTableData = getSkillsFromBasisVaardigheden(["Runen Gebruiken", "Runen Gewenning"]);

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Runen Gebruiken", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Runen Gewenning", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);
})

// Any-List
test('Cannot remove a Skill that is the only matching prerequisite of type: any-list', () => {
    const setStateMock = jest.fn();
    useState.mockImplementation(init => [init, setStateMock])
    const [modalMsg, setModalMsg] = useState("");

    const skills = [
        "Harnas I",
        "Genezingsspreuken A (EL)",
        "Paladijn",
        "Paladijnspreuken A"
]
    const mockTableData = getSkillsFromBasisVaardigheden(skills);

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken A (EL)", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);
})

test('Can remove a Skill that still has a skill matching same prerequisite of type: any-list', () => {
    const setStateMock = jest.fn();
    useState.mockImplementation(init => [init, setStateMock])
    const [modalMsg, setModalMsg] = useState("");

    const skills = [
        "Harnas I",
        "Genezingsspreuken A (EL)",
        "Genezingsspreuken A (SP)",
        "Paladijn",
        "Paladijnspreuken A"
    ];
    const mockTableData = getSkillsFromBasisVaardigheden(skills);

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken A (EL)", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);
})

test('Can remove a Skill that still has a skill matching a different prerequisite of type: any-list', () => {
    const setStateMock = jest.fn();
    useState.mockImplementation(init => [init, setStateMock])
    const [modalMsg, setModalMsg] = useState("");

    const basisSkills = [ "Genezingsspreuken A (EL)", "Eerste hulp bij gevechten", "Diagnostiek" ];
    const extraSkills = [ "Genees andere wezens" ]

    const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
    const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

    const mockTableData = [...tableDataBasis, ...tableDataExtra]

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken A (EL)", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Eerste hulp bij gevechten", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Diagnostiek", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genees andere wezens", true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);

})

// Category
test('Cannot remove a Skill that is a prerequisite of type: by Category: 4 XP', () => {
    const setStateMock = jest.fn();
    useState.mockImplementation(init => [init, setStateMock])
    const [modalMsg, setModalMsg] = useState("");

    const mageA = replaceChar("Magiërspreuken A - Wit");
    const mageB = replaceChar("Magiërspreuken B - Metaal");
    const mockTableData = getSkillsFromBasisVaardigheden([mageA, mageB]);

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(mageA, true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill(mageB, true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);
})

test('Cannot remove a Skill that is a prerequisite of type: by Category: 8 XP', () => {
    const setStateMock = jest.fn();
    useState.mockImplementation(init => [init, setStateMock])
    const [modalMsg, setModalMsg] = useState("");

    const basisSkills = [ "Genezingsspreuken A (EL)", "Genezingsspreuken B (EL)" ];
    const extraSkills = [ "Genezingsspreuken C (EL)" ]

    const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
    const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

    const mockTableData = [...tableDataBasis, ...tableDataExtra]

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(basisSkills[0], true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill(basisSkills[1], true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);

    isPrerequisite = isSkillAPrerequisiteToAnotherSkill(extraSkills[0], true, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);
})

// SUBTRACT SKILL //

    // Single Skill


    // Any-list


    // Category