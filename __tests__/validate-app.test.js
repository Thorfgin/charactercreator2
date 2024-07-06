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
} from '../src/SharedActions.js';

import {
    sourceBasisVaardigheden,
    sourceExtraVaardigheden
} from '../src/SharedObjects.js';

// Replace ë with the Unicode
function replaceChar(word) { return word.replace(/ë/g, '\u00EB') }

// Fetch skills from BasisVaardigheden
function getSkillsFromBasisVaardigheden(skillIds) {
    const mockTableData = []
    for (const skillId of skillIds) {
        const sourceRecord = sourceBasisVaardigheden.find((record) => record.id === skillId);
        mockTableData.push(sourceRecord);
    }
    return mockTableData;
}

// Fetch skills from BasisVaardigheden
function getSkillsFromExtraVaardigheden(skillIds) {
    const mockTableData = []
    for (const skillId of skillIds) {
        const sourceRecord = sourceExtraVaardigheden.find((record) => record.id === skillId);
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
    // 103 Runen gebruiken, 
    test('Can remove a Skill that has no prerequisites', () => {
        const mockTableData = getSkillsFromBasisVaardigheden([103]);

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(103, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // Single Skill
    // 103 Runen gebruiken, 
    // 104 Runen gewenning,
    test('Cannot remove a Skill that is a prerequisite of type: skill', () => {
        const mockTableData = getSkillsFromBasisVaardigheden([103, 104]); 

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(103, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(104, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // Any-List
    // 126 Harnas I
    // 350 Genezingsspreuken A (EL)
    // 131 Paladijn
    // 300 Paladijnspreuken A
    test('Cannot remove a Skill that is the only matching prerequisite of type: any-list', () => {
        const skills = [126, 350, 131, 300 ]
        const mockTableData = getSkillsFromBasisVaardigheden(skills);
        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(350, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);
    });


    // 126 Harnas I
    // 350 Genezingsspreuken A (EL)
    // 351 Genezingsspreuken A (SP)
    // 131 Paladijn
    // 300 Paladijnspreuken A
    test('Can remove a Skill that still has a skill matching same prerequisite of type: any-list', () => {
        const skills = [126, 350, 351, 131, 300]
        const mockTableData = getSkillsFromBasisVaardigheden(skills);
        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(350, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });


    // 350 Genezingsspreuken A (EL)
    // 200 Eerste hulp bij gevechten
    // 203 Diagnostiek
    // 400 Genees andere wezens
    test('Can remove a Skill that still has a skill matching a different prerequisite of type: any-list', () => {
        const basisSkills = [350, 200, 203];
        const extraSkills = [400]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(350, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(200, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(203, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(400, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // Category
    // 275 Magiërspreuken A - Wit
    // 279 Magiërspreuken B - Metaal
    test('Cannot remove a Skill that is a prerequisite of type: by Category: 4 XP', () => {
        const mockTableData = getSkillsFromBasisVaardigheden([275, 279]);

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(275, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(279, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // 350 Genezingsspreuken A (EL)
    // 352 Genezingsspreuken B (EL)
    // 502 Genezingsspreuken C (EL)
    test('Cannot remove a Skill that is a prerequisite of type: by Category: 8 XP', () => {
        const basisSkills = [350, 352];
        const extraSkills = [502]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(350, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(352, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(502, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });

    // 375 Elementair Ritualisme
    // 376 Spiritueel Ritualisme
    // 578 Cirkel Vinden
    test('Cannot remove a Ritualism Skill that is a prerequisite of type: by Category: 5 XP', () => {
        const basisSkills = [375, 376];
        const extraSkills = [578]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        tableDataBasis[0].xp = 5;
        tableDataBasis[0].count = 5;
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(375, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(376, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(578, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);
    });


    // 175 Doorzettingsvermogen
    // 111 Leermeester Expertise
    // 425 Extra Wilskracht
    test('Cannot remove a extra skill that is a prerequisite to Teacher Expertise', () => {
        const basisSkills = [175, 111];
        const extraSkills = [425]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(175, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(111, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(false);

        isPrerequisite = isSkillAPrerequisiteToAnotherSkill(425, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);
    });

    // Exception (Druid/Necro)
    // 327 Priesterspreuken A - Dood
    // 330 Priesterspreuken B - Dood
    // 279 Magiërspreuken B - Metaal
    // 651 Doods Druidisme A
    test('Cannot remove a Skill that is an Exception to the prerequisites', () => {
        const basisSkills = [327, 330, 279];
        const extraSkills = [651] 

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTableData = [...tableDataBasis, ...tableDataExtra]
        
        let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(651, true, mockTableData, setModalMsg);
        expect(isPrerequisite).toBe(true);
    });
});

// SUBTRACT SKILL //

// Single Skill
// 126 Harnas I
// 350 Genezingsspreuken A (EL)
// 131 Paladijn
// 300 Paladijnspreuken A
// 301 Paladijnspreuken B
test('Can remove a Skill Count when it is a Skill prerequisite with Count > 1', () => {
    const basisSkills = [126, 350, 131, 300, 301];
    const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
    let mockPaladijn = mockTableData[2];
    mockPaladijn.xp = 3;
    mockPaladijn.count = 3;

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(131, false, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(false);
});


// 126 Harnas I
// 350 Genezingsspreuken A (EL)
// 131 Paladijn
// 300 Paladijnspreuken A
// 301 Paladijnspreuken B
test('Cannot remove a Skill Count when it is a Skill prerequisite with Count = 1', () => {
    const basisSkills = [126, 350, 131, 300, 301];
    const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
    let mockPaladijn = mockTableData[2];
    mockPaladijn.xp = 1;
    mockPaladijn.count = 1;

    let isPrerequisite = isSkillAPrerequisiteToAnotherSkill(131, false, mockTableData, setModalMsg);
    expect(isPrerequisite).toBe(true);
});

// Any-list


// Category


describe('Using meetsAllPrerequisites', () => {

    // Teacher
    // 175 Doorzettingsvermogen
    // 425 Extra Wilskracht
    // 111 Leermeester Expertise
    test('Can add Teacher Expertise when an Extra Skill is present', () => {
        const basisSkills = [175];
        const extraSkills = [425]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTeacherExpertise = getSkillsFromBasisVaardigheden([111])[0];

        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        let meetsPrerequisite = meetsAllPrerequisites(mockTeacherExpertise, mockTableData);
        expect(meetsPrerequisite).toBe(true);
    });

    // 175 Doorzettingsvermogen
    // 111 Leermeester Expertise
    test('Cannot add Teacher Expertise when an Extra Skill is not present', () => {
        const basisSkills = [175];

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockTeacherExpertise = getSkillsFromBasisVaardigheden([111])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockTeacherExpertise, mockTableData);
        expect(meetsPrerequisite).toBe(false);
    });

    // Single Skill
    // 126 Harnas I
    // 127 Harnas II
    test('Can add a Skill that meets its Skill prerequisite', () => {
        const basisSkills = [126];
        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockHarnasII = getSkillsFromBasisVaardigheden([127])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockHarnasII, mockTableData);
        expect(meetsPrerequisite).toBe(true);
    });

    // 107 Rekenen
    test('Cannot add a Skill that does not meet its Skill prerequisite', () => {
        const basisSkills = [107];
        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockHarnasII = getSkillsFromBasisVaardigheden([127])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockHarnasII, mockTableData);
        expect(meetsPrerequisite).toBe(false);
    });

    // Any-list
    // 175 Doorzettingsvermogen
    // 425 Extra Wilskracht
    test('Can add an extra skill that meets its Any-List prerequisite', () => {
        const basisSkills = [175];
        const extraSkills = [425]

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockExtraWilskracht = tableDataExtra[0]

        let meetsPrerequisites = meetsAllPrerequisites(mockExtraWilskracht, mockTableData);
        expect(meetsPrerequisites).toBe(true);
    });


    // 107 Rekenen
    // 425 Extra Wilskracht
    test('Cannot add an extra skill that does not meets its Any-List prerequisite', () => {
        const basisSkills = [107];
        const extraSkills = [425]

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockExtraWilskracht = tableDataExtra[0]

        let meetsPrerequisites = meetsAllPrerequisites(mockExtraWilskracht, mockTableData);
        expect(meetsPrerequisites).toBe(false);
    });

    // Category
    // 375 Elementair Ritualisme
    // 576 Ritueel Leider
    test('Can add an extra Ritualism skill that meets its Categorie prerequisite', () => {
        const basisSkills = [375];
        const extraSkills = [576]

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockRitualLeader = getSkillsFromExtraVaardigheden(extraSkills)[0];

        mockTableData[0].xp = 3;
        mockTableData[0].count = 3;

        let meetsPrerequisites = meetsAllPrerequisites(mockRitualLeader, mockTableData);
        expect(meetsPrerequisites).toBe(true);
    });

    // 578 Cirkel Vinden
    test('Cannot add an extra Ritualism skill that does not meet its Categorie prerequisite', () => {
        const basisSkills = [];
        const extraSkills = [578]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);

        const mockTableData = [...tableDataBasis, ...tableDataExtra]
        const mockCirkelVinden = tableDataExtra[0];

        let meetsPrerequisites = meetsAllPrerequisites(mockCirkelVinden, mockTableData);
        expect(meetsPrerequisites).toBe(false);
    });

    // 275 Magiërspreuken A - Wit
    // 279 Magiërspreuken B - Metaal
    test('Can add a Skill that meets its prerequisite of type: by Category: 4 XP', () => {
        const mockTableData = getSkillsFromBasisVaardigheden([275]);
        const mockMageB = getSkillsFromBasisVaardigheden([279])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockMageB, mockTableData);
        expect(meetsPrerequisite).toBe(true);
    });

    // 107 Rekenen
    // 279 Magiërspreuken B - Metaal
    test('Cannot add a Skill does not meet its prerequisite of type: by Category: 4 XP', () => {
        const mockTableData = getSkillsFromBasisVaardigheden([107]);
        const mockMageB = getSkillsFromBasisVaardigheden([279])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockMageB, mockTableData);
        expect(meetsPrerequisite).toBe(false);
    });

    // 350 Genezingsspreuken A (EL)
    // 352 Genezingsspreuken B (EL)
    // 502 Genezingsspreuken C (EL)
    test('Can add a Skill that meets its prerequisite of type: by Category: 8 XP', () => {
        const basisSkills = [350, 352];

        const mockTableData = getSkillsFromBasisVaardigheden(basisSkills);
        const mockGenezingsSpreukenC = getSkillsFromExtraVaardigheden([502])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockGenezingsSpreukenC, mockTableData);
        expect(meetsPrerequisite).toBe(true);
    });

    // Exception (Druid/Necro)
    // 327 Priesterspreuken A - Dood
    // 330 Priesterspreuken B - Dood
    // 279 Magiërspreuken B - Metaal
    // 651 Doods Druidisme A
    test('Can add a Skill that is an Exception to the prerequisites', () => {
        const basisSkills = [327, 330];
        const extraSkills = [651]

        const tableDataBasis = getSkillsFromBasisVaardigheden(basisSkills);
        const tableDataExtra = getSkillsFromExtraVaardigheden(extraSkills);
        const mockTableData = [...tableDataBasis, ...tableDataExtra]

        const mockMageB = getSkillsFromBasisVaardigheden([279])[0];

        let meetsPrerequisite = meetsAllPrerequisites(mockMageB, mockTableData);
        expect(meetsPrerequisite).toBe(true);
    });
})