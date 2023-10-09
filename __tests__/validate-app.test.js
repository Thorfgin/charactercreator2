import * as React from 'react';
import { 
    jest,
    describe,
    test,
    beforeEach,
    expect
} from '@jest/globals';

import {
    isSkillAPrerequisiteToAnotherSkill,
    meetsAllPrerequisites,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden
} from '../src/App.jsx';

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

// Prepare for useState Mock
const setModalMsg = jest.fn();

/// --- Pre-Requisites --- ///

describe('Using isSkillAPrerequisiteToAnotherSkill', () => {
    beforeEach(() => {
        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation((init) => [init, setModalMsg]);
    })

    // No Prerequisites
    test('Can remove a Skill that has no prerequisites', () => {
        const mockTableData = getSkillsFromBasisVaardigheden(["Runen Gebruiken"]);

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Runen Gebruiken", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // Single Skill
    test('Cannot remove a Skill that is a prerequisite of type: skill', () => {
        const mockTableData = getSkillsFromBasisVaardigheden(["Runen Gebruiken", "Runen Gewenning"]);

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Runen Gebruiken", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Runen Gewenning", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // Any-List
    test('Cannot remove a Skill that is the only matching prerequisite of type: any-list', () => {
        const skills = [
            "Harnas I",
            "Genezingsspreuken A (EL)",
            "Paladijn",
            "Paladijnspreuken A"
        ]
        const mockTableData = getSkillsFromBasisVaardigheden(skills);

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken A (EL)", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);
    });

    test('Can remove a Skill that still has a skill matching same prerequisite of type: any-list', () => {
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
    });

    test('Can remove a Skill that still has a skill matching a different prerequisite of type: any-list', () => {
        const basisSkills = ["Genezingsspreuken A (EL)", "Eerste hulp bij gevechten", "Diagnostiek"];
        const extraSkills = ["Genees andere wezens"]

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
    });

    // Category
    test('Cannot remove a Skill that is a prerequisite of type: by Category: 4 XP', () => {
        const mageA = replaceChar("Magiërspreuken A - Wit");
        const mageB = replaceChar("Magiërspreuken B - Metaal");
        const mockTableData = getSkillsFromBasisVaardigheden([mageA, mageB]);

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(mageA, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(mageB, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    test('Cannot remove a Skill that is a prerequisite of type: by Category: 8 XP', () => {
        const basisSkills = ["Genezingsspreuken A (EL)", "Genezingsspreuken B (EL)"];
        const extraSkills = ["Genezingsspreuken C (EL)"]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken A (EL)", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken B (EL)", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Genezingsspreuken C (EL)", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    test('Cannot remove a Ritualism Skill that is a prerequisite of type: by Category: 5 XP', () => {
        const basisSkills = ["Elementair Ritualisme", "Spiritueel Ritualisme"];
        const extraSkills = ["Cirkel Vinden"]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        tableDataBasis[0].xp = 5;
        tableDataBasis[0].count = 5;
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Elementair Ritualisme", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Spiritueel Ritualisme", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Cirkel Vinden", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    test('Cannot remove a extra skill that is a prerequisite to Teacher Expertise', () => {
        const basisSkills = ["Doorzettingsvermogen", "Leermeester Expertise"];
        const extraSkills = ["Extra Wilskracht"]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Doorzettingsvermogen", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Leermeester Expertise", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Extra Wilskracht", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);
    });

    // Exception (Druid/Necro)
    test('Cannot remove a Skill that is an Exception to the prerequisites', () => {
        const mageB = replaceChar("Magiërspreuken B - Metaal");
        const basisSkills = ["Priesterspreuken A - Dood", "Priesterspreuken B - Dood", mageB];
        const extraSkills = ["Doods Druidisme A"] 

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTableData = [...tableDataBasis, ...tableDataExtra]
        
        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Doods Druidisme A", true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);
    });
});

// SUBTRACT SKILL //

// Single Skill
test('Can remove a Skill Count when it is a Skill prerequisite with Count > 1', () => {
    const basisSkills = ["Harnas I", "Genezingsspreuken A (EL)", "Paladijn", "Paladijnspreuken A", "Paladijnspreuken B"];
    const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
    let mockPaladijn = mockTableData[2];
    mockPaladijn.xp = 3;
    mockPaladijn.count = 3;

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Paladijn", false, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);
});

test('Cannot remove a Skill Count when it is a Skill prerequisite with Count = 1', () => {
    const basisSkills = ["Harnas I", "Genezingsspreuken A (EL)", "Paladijn", "Paladijnspreuken A", "Paladijnspreuken B"];
    const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
    let mockPaladijn = mockTableData[2];
    mockPaladijn.xp = 1;
    mockPaladijn.count = 1;

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill("Paladijn", false, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);
});

// Any-list


// Category


describe('Using meetsAllPrerequisites', () => {

    // Teacher
    test('Can add Teacher Expertise when an Extra Skill is present', () => {
        const basisSkills = ["Doorzettingsvermogen"];
        const extraSkills = ["Extra Wilskracht"]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTeacherExpertise = getSkillsFromBasisVaardigheden(["Leermeester Expertise"])[0];

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let meetsPrerequisite = meetsAllPrerequisites(mockTeacherExpertise, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(true);
    });

    test('Cannot add Teacher Expertise when an Extra Skill is not present', () => {
        const basisSkills = ["Doorzettingsvermogen"];

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockTeacherExpertise = getSkillsFromBasisVaardigheden(["Leermeester Expertise"])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockTeacherExpertise, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(false);
    });

    // Single Skill
    test('Can add a Skill that meets its Skill prerequisite', () => {
        const basisSkills = ["Harnas I"];
        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockHarnasII = getSkillsFromBasisVaardigheden(["Harnas II"])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockHarnasII, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(true);
    });

    test('Cannot add a Skill that does not meet its Skill prerequisite', () => {
        const basisSkills = ["Rekenen"];
        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockHarnasII = getSkillsFromBasisVaardigheden(["Harnas II"])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockHarnasII, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(false);
    });

    // Any-list
    test('Can add an extra skill that meets its Any-List prerequisite', () => {
        const basisSkills = ["Doorzettingsvermogen"];
        const extraSkills = ["Extra wilskracht"]

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockExtraWilskracht = tableDataExtra[0]

        let meetsPrerequisites = meetsAllPrerequisites(mockExtraWilskracht, mockTableData, setModalMsg);
        expect(meetsPrerequisites).toBe(true);
    });

    test('Cannot add an extra skill that does not meets its Any-List prerequisite', () => {
        const basisSkills = ["Rekenen"];
        const extraSkills = ["Extra wilskracht"]

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockExtraWilskracht = tableDataExtra[0]

        let meetsPrerequisites = meetsAllPrerequisites(mockExtraWilskracht, mockTableData, setModalMsg);
        expect(meetsPrerequisites).toBe(false);
    });

    // Category
    test('Can add an extra Ritualism skill that meets its Categorie prerequisite', () => {
        const basisSkills = ["Elementair Ritualisme"];
        const extraSkills = ["Ritueel Leider"]

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockRitualLeader = getSkillsFromExtraVaardigheden(extraSkills)[0];

        mockTableData[0].xp = 3;
        mockTableData[0].count = 3;

        let meetsPrerequisites = meetsAllPrerequisites(mockRitualLeader, mockTableData, setModalMsg);
        expect(meetsPrerequisites).toBe(true);
    });

    test('Cannot add an extra Ritualism skill that does not meet its Categorie prerequisite', () => {
        const basisSkills = [];
        const extraSkills = ["Cirkel Vinden"]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]
        const mockCirkelVinden = tableDataExtra[0];

        let meetsPrerequisites = meetsAllPrerequisites(mockCirkelVinden, mockTableData, setModalMsg);
        expect(meetsPrerequisites).toBe(false);
    });

    test('Can add a Skill that meets its prerequisite of type: by Category: 4 XP', () => {
        const mageA = replaceChar("Magiërspreuken A - Wit");
        const mageB = replaceChar("Magiërspreuken B - Metaal");
        const mockTableData = getSkillsFromBasisVaardigheden([mageA]);
        const mockMageB = getSkillsFromBasisVaardigheden([mageB])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockMageB, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(true);
    });

    test('Cannot add a Skill does not meet its prerequisite of type: by Category: 4 XP', () => {
        const math = replaceChar("Rekenen");
        const mageB = replaceChar("Magiërspreuken B - Metaal");
        const mockTableData = getSkillsFromBasisVaardigheden([math]);
        const mockMageB = getSkillsFromBasisVaardigheden([mageB])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockMageB, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(false);
    });

    test('Can add a Skill that meets its prerequisite of type: by Category: 8 XP', () => {
        const basisSkills = ["Genezingsspreuken A (EL)", "Genezingsspreuken B (EL)"];

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockGenezingsSpreukenC = getSkillsFromExtraVaardigheden(["Genezingsspreuken C (EL)"])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockGenezingsSpreukenC, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(true);
    });

    // Exception (Druid/Necro)
    test('Can add a Skill that is an Exception to the prerequisites', () => {
        const basisSkills = ["Priesterspreuken A - Dood", "Priesterspreuken B - Dood"];
        const extraSkills = ["Doods Druidisme A"]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        const mageB = replaceChar("Magiërspreuken B - Metaal");
        const mockMageB = getSkillsFromBasisVaardigheden([mageB])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockMageB, mockTableData, setModalMsg);
        expect(meetsPrerequisite).toBe(true);
    });
})