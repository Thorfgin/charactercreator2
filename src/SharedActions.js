import PropTypes from 'prop-types';

// Shared
import {
    defaultProperties,
    sourceSpreuken,
    sourceRecepten,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
} from './SharedObjects.js';

import {
    teacherSkill,
    ritualismSkills
} from './SharedConstants.js';

/// --- SKILLS --- ///

getSkillById.propTypes = {
    id: PropTypes.number.isRequired
};

// Ophalen van een vaardigheid op id
export function getSkillById(id) {
    let sourceSkill = null;
    sourceSkill = sourceBasisVaardigheden.find((record) => record.id === id);
    if (!sourceSkill) { sourceSkill = sourceExtraVaardigheden.find((record) => record.id === id); }
    return sourceSkill;
}

getBasicSkillsFromTable.propTypes = {
    tableData: PropTypes.array.isRequired
};

// Ophalen van alle vaardigheden uit de basis vaardigheden die aanwezig zijn in de tabel
export function getBasicSkillsFromTable(tableData) {
    const basicSkills = []
    tableData.forEach((tableSkill) => {
        if (sourceBasisVaardigheden.some((record) => record.id === tableSkill.id)) { basicSkills.push(tableSkill) }
    });
    return basicSkills;
}

getExtraSkillsFromTable.propTypes = {
    tableData: PropTypes.array.isRequired
};

// Ophalen van alle vaardigheden uit de extra vaardigheden die aanwezig zijn in de tabel
export function getExtraSkillsFromTable(tableData) {
    if (!tableData || !tableData.length === 0) { return []; }
    const extraSkills = []
    tableData.forEach((tableSkill) => {
        if (sourceExtraVaardigheden.some((record) =>
            record.id === tableSkill.id)) { extraSkills.push(tableSkill) }
    });
    return extraSkills;
}

/// --- SPELLS & RECIPE --- ///
// Ophalen van een spreuk op basis van de skill
export function getSpellBySkill(skillId, spellId) {
    if (!skillId || !spellId) { return; }
    const sourceSpells = getSpellsBySkill(skillId);
    return sourceSpells?.find((item) => item.id === spellId);
}

// Ophalen van alle spreuken op basis van de skill
export function getSpellsBySkill(skillId) {
    if (!skillId) { return; }
    const sourceSpell = sourceSpreuken.find((item) => item.id.includes(skillId));
    return sourceSpell?.Spells;
}

// Ophalen van een recept op bases van de skill
export function getRecipyBySkill(skillId, recipyId) {
    if (!skillId || !recipyId) { return; }
    const sourceRecipies = getRecipesBySkill(skillId);
    return sourceRecipies?.find((item) => item.id === recipyId);
}

// Ophalen van alle recepten op basis van de skill
export function getRecipesBySkill(skillId) {
    if (!skillId) { return; }
    const sourceRecipy = sourceRecepten.find((item) => item.id === skillId);
    return sourceRecipy?.Recipes;
}

export function getPropertyByName(name) {
    return defaultProperties.find((item) => item.name === name);
}

/// --- SELECT --- ///

// Ophalen van de skills uit vaardigheden/spreuken/recepten
export function generateOptions(source) {
    return source.map((record) => ({
        id: record.id,
        value: record.skill,
        label: `${record.skill} (${record.xp} xp)`
    }));
}

// Ophalen van de skills uit vaardigheden/spreuken/recepten, minus geselecteerde skills
export function regenerateOptions(source, tableData) {
    return source.map((record) => ({
        id: record.id,
        value: record.skill,
        label: `${record.skill} (${record.xp} xp)`
    })).filter((currentSkill) =>
        !tableData.some((record) =>
            record.skill.toLowerCase() === currentSkill.value.toLowerCase()
        )
    );
}

/// --- VEREISTEN --- ///

// Check of de Skill aan de vereisten voldoet
export function meetsAllPrerequisites(selectedSkill, tableData) {
    let meetsPrerequisite = true;
    if (selectedSkill) {
        const reqSkill = selectedSkill.Requirements.skill;
        const reqAny = selectedSkill.Requirements.any_list;
        const reqCategory = selectedSkill.Requirements.Category;
        const reqException = selectedSkill.Requirements.exception;

        // exit early
        if (reqSkill.length === 0 &&
            reqAny.length === 0 &&
            (!reqCategory || (reqCategory && reqCategory.name.length === 0)) &&
            selectedSkill.skill !== "Leermeester Expertise") {
            return meetsPrerequisite;
        }
        else {
            // uitzondering eerst
            if (selectedSkill.skill === "Leermeester Expertise") {
                meetsPrerequisite = verifyTableContainsExtraSkill(tableData);
            }

            // skill
            if (reqSkill.length > 0 && meetsPrerequisite === true) {
                meetsPrerequisite = verifyTableContainsRequiredSkills(reqSkill, tableData);
            }

            // any_list
            if (reqAny.length > 0 && meetsPrerequisite === true) {
                meetsPrerequisite = verifyTableContainsOneofAnyList(reqAny, tableData);
            }

            // category
            if (reqCategory && meetsPrerequisite === true) {
                meetsPrerequisite = verifyTableMeetsPrerequisiteCategoryXP(reqCategory, tableData);
            }

            // exception
            if (reqException && meetsPrerequisite === false) {
                const isValidException = verifyTableMeetsPrerequisiteException(reqException, tableData);
                if (isValidException === true) { meetsPrerequisite = true }
            }
        }
    }
    else {
        console.warn("This skill should have been found, but was undefined");
    }
    return meetsPrerequisite;
}

// Check of er minimaal 1 vaardigheid uit de extra vaardigheden aanwezig is in de tabel
export function verifyTableContainsExtraSkill(tableData) {
    let meetsPrerequisite = false;
    for (const tableDataSkill of tableData) {
        meetsPrerequisite = sourceExtraVaardigheden.some((record) => record.id === tableDataSkill.id);
        if (meetsPrerequisite === true) { break; }
    }
    return meetsPrerequisite;
}

// Check of de skills in Requirements.skill aanwezig zijn in de tabel
function verifyTableContainsRequiredSkills(reqSkills, tableData) {
    let meetsPrerequisite = false;
    for (const reqSkill of reqSkills) {
        meetsPrerequisite = tableData.some((record) => record.id === reqSkill);
        if (meetsPrerequisite === false) { break; }
    }
    return meetsPrerequisite;
}

// Check of tenminste een van de skills in Requirements.any_list aanwezig zijn in de tabel
function verifyTableContainsOneofAnyList(reqAnyIds, tableData) {
    let meetsAnyListPrerequisite = false;
    for (const reqId of reqAnyIds) {
        meetsAnyListPrerequisite = tableData.some((record) => record.id === reqId);
        if (meetsAnyListPrerequisite === true) { break; }
    }
    return meetsAnyListPrerequisite;
}

// Check of het minimum totaal aan XP van de Requirements.Category aanwezig is in de tabel 
function verifyTableMeetsPrerequisiteCategoryXP(reqCategory, tableData) {
    let meetsPrerequisite = false;
    const categories = reqCategory.name;
    const totalReqXP = reqCategory.value;

    // Afhandelen uitzondering
    if (categories.length === 1 &&
        categories.includes("Ritualisme")) {
        const tableDataSkills = tableData.filter(tableItem => categories.includes(tableItem.category));

        for (const skill of tableDataSkills) {
            if (skill.xp >= totalReqXP) {
                meetsPrerequisite = true;
                break;
            }
        }
    }
    // Standaard werking categorie
    else {
        let selectedSkillsXP = 0;
        const selectedSkills = tableData.filter(skillTableData =>
            categories.includes(skillTableData.category) &&                                 // van de juiste categorie
            (skillTableData.Spreuken.length > 0 || skillTableData.Recepten.length > 0));    // alleen skills met recepten of spreuken zijn doorgaans relevant
        selectedSkills.forEach(item => selectedSkillsXP += item.xp);                        // optellen totaal XP
        if (selectedSkillsXP >= totalReqXP) { meetsPrerequisite = true; }
    }
    return meetsPrerequisite;
}

// Als er een vaardigheid is (Druid/Necro) die prerequisite mag negeren
function verifyTableMeetsPrerequisiteException(reqExceptions, tableData) {
    let meetsException = false;
    for (const reqException of reqExceptions) {
        const matchingSkills = tableData.filter(skillTableData => skillTableData.id === reqException);
        if (matchingSkills.length > 0) {
            meetsException = true;
            break;
        }
    }
    return meetsException;
}

// Check of de skill een vereiste is voor een van de gekozen skills
export function isSkillAPrerequisiteToAnotherSkill(removedSkillId, isRemoved, tableData, setModalMsg) {
    let isPrerequisite = false;

    if (tableData.length > 1) {
        // Check leermeester expertise afhankelijkheden
        const containsTeacherSkill = tableData.some((record) => record.id === teacherSkill);
        if (containsTeacherSkill) {
            const extraSkills = getExtraSkillsFromTable(tableData);
            const filteredSkills = extraSkills.filter(extraSkill => extraSkill.id !== removedSkillId)
            if (filteredSkills.length === 0) {
                isPrerequisite = true;
                setModalMsg("Dit item is een vereiste voor vaardigheid:\n Leermeester Expertise \nVerwijderen is niet toegestaan.\n");
            }
        }

        // check overige vereisten
        if (isPrerequisite === false &&
            (!containsTeacherSkill || tableData.length > 1)) {
            for (const skillTableData of tableData) {
                const reqSkills = skillTableData.Requirements.skill;
                const reqAny = skillTableData.Requirements.any_list;
                const reqCategory = skillTableData.Requirements.Category;
                const reqException = skillTableData.Requirements.exception;

                if (isRemoved === true && skillTableData.id === removedSkillId) { continue; }
                else if (
                    reqSkills.length === 0 &&
                    reqAny.length === 0 &&
                    (!reqCategory || (reqCategory && reqCategory.name.length === 0))
                ) { continue; }
                else {
                    // skill
                    if (reqSkills.length > 0 && isPrerequisite === false) {
                        isPrerequisite = verifyRemovedSkillIsNotSkillPrerequisite(reqSkills, skillTableData, removedSkillId, isRemoved);
                        if (isPrerequisite === true) {
                            setModalMsg("Dit item is een vereiste voor vaardigheid:\n " + skillTableData.skill + " \nVerwijderen is niet toegestaan.\n");
                            break;
                        }
                    }

                    // any_list
                    if (reqAny.length > 0 && isPrerequisite === false) {
                        isPrerequisite = verifyRemovedSkillIsNotOnlyAnyListPrerequisite(reqAny, removedSkillId, tableData);
                        if (isPrerequisite === true) {
                            setModalMsg("Dit item is een vereiste voor vaardigheid: \n" + skillTableData.skill + " \nVerwijderen is niet toegestaan.\n");
                            break;
                        }
                    }

                    // category
                    if (reqCategory && isPrerequisite === false) {
                        const categories = reqCategory.name;
                        const totalReqXP = reqCategory.value;

                        // Afhandelen uitzondering
                        if (categories.length === 1 &&
                            categories.includes("Ritualisme")) {
                            isPrerequisite = verifyRemovedSkillIsNotARitualismPrerequisite(removedSkillId, tableData, isRemoved, totalReqXP);
                        }
                        // Standaard werking categorie
                        else {
                            isPrerequisite = verifyRemovedSkillIsNotACategoryPrerequisite(tableData, categories, skillTableData, removedSkillId, totalReqXP);
                        }

                        if (isPrerequisite === true) {
                            setModalMsg("Dit item is nodig voor de vereiste XP (" + totalReqXP + ")\n" +
                                "voor de vaardigheid: \n" + skillTableData.skill + "\n" +
                                "Verwijderen is niet toegestaan.");
                            break;
                        }
                    }

                    // exception
                    if (reqException && isPrerequisite === false) {
                        isPrerequisite = verifyTableExceptionSkillMeetsPrerequisite(tableData, reqException, skillTableData, removedSkillId,);
                        if (isPrerequisite === true) {
                            setModalMsg("Dit item is nodig voor als uitzondering" +
                                " voor de vaardigheid: \n" + skillTableData.skill + "\n" +
                                "Verwijderen is niet toegestaan.");
                            break;
                        }
                    }
                }
            }
        }
    }
    return isPrerequisite;
}

// Check of de skill niet een prequisite is uit de Any_Skill
function verifyRemovedSkillIsNotSkillPrerequisite(reqSkillIds, currentSkill, removedSkillId, isRemoved) {
    let isPrerequisite = false;
    for (const reqSkillId of reqSkillIds) {
        if ((isRemoved && removedSkillId === reqSkillId) ||
            (!isRemoved && currentSkill.id === removedSkillId && currentSkill.count === 1)
        ) {
            return true;
        }
    }
    return isPrerequisite;
}

// Check of na verwijderen de overige skills nog voldoen voor de item.Any-List
function verifyRemovedSkillIsNotOnlyAnyListPrerequisite(reqAnyIds, removedSkillId, tableData) {
    let hasOtherSkillThatIsPrerequisite = false;

    if (!reqAnyIds.includes(removedSkillId)) { hasOtherSkillThatIsPrerequisite = true; }
    else {
        for (const reqAnyId of reqAnyIds) {
            hasOtherSkillThatIsPrerequisite = tableData.some((record) =>
                record.id === reqAnyId &&
                record.id !== removedSkillId);
            if (hasOtherSkillThatIsPrerequisite === true) { break; }
        }
    }
    // Return inverse, as it nameSkillToRemove is NOT a prerequisite
    return !hasOtherSkillThatIsPrerequisite;
}

// Check of een Category prerequisite behouden wordt wanneer de skill verwijdert/verlaagd wordt
function verifyRemovedSkillIsNotACategoryPrerequisite(tableData, categories, item, removedSkillId, totalReqXP) {
    let isPrerequisite = false;
    let selectedSkillsXP = 0;

    const selectedSkills = tableData.filter(tableItem => categories.includes(tableItem.category) && // van de juiste categorie
        (tableItem.Spreuken.length > 2 || tableItem.Recepten.length > 2) && // alleen skills met recepten of spreuken zijn doorgaans relevant                             
        tableItem.id !== item.id && // item waarvan pre-reqs gecheckt worden uitsluiten
        tableItem.id !== removedSkillId); // Skip zelf, deze is wordt verwijderd.

    selectedSkills.forEach(item => selectedSkillsXP += item.xp); // calculate XP
    if (totalReqXP > selectedSkillsXP) { isPrerequisite = true; }
    return isPrerequisite;
}

// Check of de uitgezonderde skills aanwezig zijn in tableData en of deze nog voldoen zonder verwijderde vaardigheid
// Dit is specifiek voor Druid/Necro die bepaalde vereisten mogen negeren
function verifyTableExceptionSkillMeetsPrerequisite(tableData, reqExceptions, skillTableData, removedSkillId) {
    let isExceptionPrerequisite = false;

    for (const exceptionId of reqExceptions) {
        if (removedSkillId === exceptionId) {
            const filteredTableData = []
            for (const oldSkill of tableData) {
                if (oldSkill.id !== skillTableData.id &&
                    oldSkill.id !== removedSkillId)
                    filteredTableData.push(oldSkill)
            }

            const meetsPrequisites = meetsAllPrerequisites(skillTableData, filteredTableData)
            if (meetsPrequisites === false) {
                isExceptionPrerequisite = true;
                break;
            }
        }
    }
    return isExceptionPrerequisite;
}

// Check of de ritualisme vaardigheid verwijdert wordt, en zo ja of deze een prerequisite is.
// Zo ja, check ook of de vereiste door een andere ritualisme vaardigheid nog behaald wordt.
function verifyRemovedSkillIsNotARitualismPrerequisite(removedSkillId, tableData, isRemoved, totalReqXP) {
    let isPrerequisite = false;

    // List all Ritualism skills
    if (ritualismSkills.includes(removedSkillId)) {
        let tableSkillTotalXP = 0;
        const tableSkills = tableData.filter(tableItem => tableItem.category.includes("Ritualism"));

        // exit early
        if (isRemoved === true && tableSkills.length === 1) { isPrerequisite = true; }
        else {
            for (const tableSkill of tableSkills) {
                // Check of skill die vermindert wordt nog voldoet
                if (tableSkill.id === removedSkillId) {
                    if (!isRemoved) {
                        tableSkillTotalXP = tableSkill.xp - (tableSkill.xp / tableSkill.count);
                        isPrerequisite = totalReqXP > tableSkillTotalXP;
                    }
                }
                // Check of andere ritualisme skills garant staan voor pre-reqs
                else { isPrerequisite = totalReqXP > tableSkill.xp; }
            }
        }
    }
    return isPrerequisite;
}

/// --- TILES --- ///

// Op basis van de Eigenschappen, voeg nieuwe tegels toe.
export function updateGridEigenschappenTiles(tableData, defaultProperties) {
    const propertySums = defaultProperties.map((property) => (
        {
            ...property, value: tableData.reduce((sum, record) => {
                const vaardigheid = getSkillById(record.id);
                const propertyValue = vaardigheid.Eigenschappen?.find((prop) =>
                    prop.name.toLowerCase() === property.name.toLowerCase())?.value || 0;
                return sum + propertyValue * record.count;
            }, property.name === "hitpoints" ? 1 : 0)
        }));
    return propertySums;
}

// Op basis van de Spreuken, voeg nieuwe tegels toe.
export function updateGridSpreukenTiles(tableData) {
    const spellProperties = tableData.reduce((spellsAccumulator, record) => {
        const vaardigheid = getSkillById(record.id);
        const spells = vaardigheid.Spreuken || [];
        spells.forEach((spell) => {
            const existingSpell = spellsAccumulator.find((existing) => existing.id === spell);
            if (existingSpell) { existingSpell.count += spells.count; }
            else {
                const newSpell = {
                    "skillId": vaardigheid.id,
                    "spellId": spell,
                    "alt_skill": vaardigheid.alt_skill
                };
                spellsAccumulator.push({ ...newSpell });
            }
        });
        return spellsAccumulator;
    }, []);
    return spellProperties;
}

// Op basis van de Recepten, voeg nieuwe tegels toe.
export function updateGridReceptenTiles(tableData) {
    const recipyProperties = tableData.reduce((recipyAccumulator, record) => {
        const vaardigheid = getSkillById(record.id);
        const recepten = vaardigheid ? vaardigheid.Recepten : [];

        recepten.forEach((recept) => {
            const existingRecipy = recipyAccumulator.find((existing) => existing?.id === recept);
            if (existingRecipy) { existingRecipy.count += recept.count; }
            else {
                const newRecipy = {
                    "skillId": vaardigheid.id,
                    "recipyId": recept,
                    "alt_skill": vaardigheid.alt_skill
                };
                recipyAccumulator.push({ ...newRecipy });
            }
        });
        return recipyAccumulator;
    }, []);
    return recipyProperties;
}

/// --- PDF --- ///

// Open het vaardigheden boekje op de juiste pagina
export function openPdfPage(pdfName, pageNumber) {
    let rootURL = getPdfURL(pdfName);
    const fullURL = rootURL + pdfName + "#page=" + pageNumber;
    window.open(fullURL, '_blank');
}

export function getPdfURL(pdfName) {
    let rootURL = "";
    if ([
        "Vaardigheden.pdf",
        "Crafting-loresheets.pdf",
        "Imbue-loresheet.pdf",
        "Armourpoint-kostuum-eisen.pdf",
        "priest_runes.ttf",
        "mage_glyphs.ttf"
    ].includes(pdfName)) { rootURL = "https://the-vortex.nl/wp-content/uploads/2022/04/" }
    else if ([
        "Spreuken.pdf",
        "Priest-Runes.pdf",
        "Mage-Glyphs.pdf",
        "Kennis-van-kruiden.pdf",
        "Genezende-Dranken.pdf",
        "Kruiden-Elixers.pdf",
        "Magische-Elixers.pdf",
        "Hallucinerende-Elixers.pdf",
        "Giffen.pdf",
        "Samenvatting-regelsysteem.pdf"
    ].includes(pdfName)) { rootURL = "https://the-vortex.nl/wp-content/uploads/2022/03/" }
    else { console.warn("PDF name was not recognized as a valid option.", pdfName) }
    return rootURL;
}