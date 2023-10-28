// Shared
import {
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
} from './SharedObjects.js';

/// --- SELECT --- ///

// Bewust verborgen. Exports worden verderop geregeld.
// Ophalen van de skills uit vaardigheden/spreuken/recepten
export function generateOptions(source) {
    return source.map((record) => ({
        value: record.skill,
        label: `${record.skill} (${record.xp} xp)`
    }));
}

// Bewust verborgen. Exports worden verderop geregeld.
// Ophalen van de skills uit vaardigheden/spreuken/recepten, minus geselecteerde skills
export function regenerateOptions(source, tableData) {
    return source.map((record) => ({
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
        meetsPrerequisite = sourceExtraVaardigheden.some((record) => record.skill.toLowerCase() === tableDataSkill.skill.toLowerCase());
        if (meetsPrerequisite === true) { break; }
    }
    return meetsPrerequisite;
}

// Check of de skills in Requirements.skill aanwezig zijn in de tabel
function verifyTableContainsRequiredSkills(reqSkills, tableData) {
    let meetsPrerequisite = false;
    for (const reqSkill of reqSkills) {
        meetsPrerequisite = tableData.some((record) => record.skill.toLowerCase() === reqSkill.toLowerCase());
        if (meetsPrerequisite === false) { break; }
    }
    return meetsPrerequisite;
}

// Check of tenminste een van de skills in Requirements.any_list aanwezig zijn in de tabel
function verifyTableContainsOneofAnyList(reqAny, tableData) {
    let meetsAnyListPrerequisite = false;
    for (const req of reqAny) {
        meetsAnyListPrerequisite = tableData.some((record) => record.skill.toLowerCase().includes(req.toLowerCase()));
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
        const matchingSkills = tableData.filter(skillTableData =>
            skillTableData.skill.toLowerCase().includes(reqException.toLowerCase()));
        if (matchingSkills.length > 0) {
            meetsException = true;
            break;
        }
    }
    return meetsException;
}

// Check of de skill een vereiste is voor een van de gekozen skills
export function isSkillAPrerequisiteToAnotherSkill(nameSkillToRemove, isRemoved, tableData, setModalMsg) {
    let isPrerequisite = false;

    if (tableData.length > 1) {
        // Check leermeester expertise afhankelijkheden
        const containsTeacherSkill = tableData.some((record) => record.skill === "Leermeester Expertise");
        if (containsTeacherSkill) {
            const extraSkills = getExtraSkillsFromTable(tableData);
            const filteredSkills = extraSkills.filter(extraSkill => extraSkill.toLowerCase() !== nameSkillToRemove.toLowerCase())
            if (filteredSkills.length === 0) {
                isPrerequisite = true;
                setModalMsg("Dit item is een vereiste voor vaardigheid:\n Leermeester Expertise \nVerwijderen is niet toegestaan.\n");
            }
        }

        // check overige vereisten
        if (isPrerequisite === false &&
            (!containsTeacherSkill || tableData.length > 1)) {
            for (const skillTableData of tableData) {
                const reqSkill = skillTableData.Requirements.skill;
                const reqAny = skillTableData.Requirements.any_list;
                const reqCategory = skillTableData.Requirements.Category;
                const reqException = skillTableData.Requirements.exception;

                if (isRemoved === true &&
                    skillTableData.skill.toLowerCase() === nameSkillToRemove.toLowerCase()) { continue; }
                else if (
                    reqSkill.length === 0 &&
                    reqAny.length === 0 &&
                    (!reqCategory || (reqCategory && reqCategory.name.length === 0))
                ) { continue; }
                else {
                    // skill
                    if (reqSkill.length > 0 && isPrerequisite === false) {
                        isPrerequisite = verifyRemovedSkillIsNotSkillPrerequisite(reqSkill, skillTableData, nameSkillToRemove, isRemoved);
                        if (isPrerequisite === true) {
                            setModalMsg("Dit item is een vereiste voor vaardigheid:\n " + skillTableData.skill + " \nVerwijderen is niet toegestaan.\n");
                            break;
                        }
                    }

                    // any_list
                    if (reqAny.length > 0 && isPrerequisite === false) {
                        isPrerequisite = verifyRemovedSkillIsNotOnlyAnyListPrerequisite(reqAny, nameSkillToRemove, tableData);
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
                            isPrerequisite = verifyRemovedSkillIsNotARitualismPrerequisite(nameSkillToRemove, tableData, isRemoved, totalReqXP);
                        }
                        // Standaard werking categorie
                        else {
                            isPrerequisite = verifyRemovedSkillIsNotACategoryPrerequisite(tableData, categories, skillTableData, nameSkillToRemove, totalReqXP);
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
                        isPrerequisite = verifyTableExceptionSkillMeetsPrerequisite(tableData, reqException, skillTableData, nameSkillToRemove,);
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

// Ophalen van alle vaardigheden uit de basis vaardigheden die aanwezig zijn in de tabel
export function getBasicSkillsFromTable(tableData) {
    const basicSkills = []
    for (const tableSkill of tableData) {
        const isBasicSkill = sourceBasisVaardigheden.some((record) => record.skill.toLowerCase() === tableSkill.skill.toLowerCase());
        if (isBasicSkill) { basicSkills.push(tableSkill.skill); }
    }
    return basicSkills;
}

// Ophalen van alle vaardigheden uit de extra vaardigheden die aanwezig zijn in de tabel
export function getExtraSkillsFromTable(tableData) {
    const extraSkills = []
    for (const tableSkill of tableData) {
        const isExtraSkill = sourceExtraVaardigheden.some((record) => record.skill.toLowerCase() === tableSkill.skill.toLowerCase());
        if (isExtraSkill) { extraSkills.push(tableSkill.skill); }
    }
    return extraSkills;
}

// Check of de skill niet een prequisite is uit de Any_Skill
function verifyRemovedSkillIsNotSkillPrerequisite(reqSkills, currentSkill, nameSkillToRemove, isRemoved) {
    let isPrerequisite = false;
    for (const reqSkill of reqSkills) {
        if (isRemoved) {
            if (nameSkillToRemove.toLowerCase() === reqSkill.toLowerCase()) {
                isPrerequisite = true;
                break;
            }
        }
        else if (!isRemoved && currentSkill.skill.toLowerCase() === nameSkillToRemove.toLowerCase()) {
            if (currentSkill.count === 1) { isPrerequisite = true; }
        }
    }
    return isPrerequisite;
}

// Check of na verwijderen de overige skills nog voldoen voor de item.Any-List
function verifyRemovedSkillIsNotOnlyAnyListPrerequisite(reqAny, nameSkillToRemove, tableData) {
    let hasOtherSkillThatIsPrerequisite = false;
    const cleanSkillName = nameSkillToRemove.includes("(") ? nameSkillToRemove.split(" (")[0] : nameSkillToRemove;

    if (!reqAny.includes(cleanSkillName) &&
        !reqAny.includes(nameSkillToRemove)) {
        hasOtherSkillThatIsPrerequisite = true;
    }
    else {
        for (const req of reqAny) {
            hasOtherSkillThatIsPrerequisite = tableData.some((record) =>
                record.skill.toLowerCase().includes(req.toLowerCase()) &&
                record.skill.toLowerCase() !== nameSkillToRemove.toLowerCase());
            if (hasOtherSkillThatIsPrerequisite === true) { break; }
        }
    }
    // Return inverse, as it nameSkillToRemove is NOT a prerequisite
    return !hasOtherSkillThatIsPrerequisite;
}

// Check of een Category prerequisite behouden wordt wanneer de skill verwijdert/verlaagd wordt
function verifyRemovedSkillIsNotACategoryPrerequisite(tableData, categories, item, nameSkillToRemove, totalReqXP) {
    let isPrerequisite = false;
    let selectedSkillsXP = 0;

    const selectedSkills = tableData.filter(tableItem => categories.includes(tableItem.category) && // van de juiste categorie
        (tableItem.Spreuken.length > 2 || tableItem.Recepten.length > 2) && // alleen skills met recepten of spreuken zijn doorgaans relevant                             
        tableItem.skill.toLowerCase() !== item.skill.toLowerCase() && // item waarvan pre-reqs gecheckt worden uitsluiten
        tableItem.skill.toLowerCase() !== nameSkillToRemove.toLowerCase()); // Skip zelf, deze is wordt verwijderd.

    selectedSkills.forEach(item => selectedSkillsXP += item.xp); // calculate XP
    if (totalReqXP > selectedSkillsXP) { isPrerequisite = true; }
    return isPrerequisite;
}

// Check of de uitgezonderde skills aanwezig zijn in tableData en of deze nog voldoen zonder verwijderde vaardigheid
// Dit is specifiek voor Druid/Necro die bepaalde vereisten mogen negeren
function verifyTableExceptionSkillMeetsPrerequisite(tableData, reqExceptions, skillTableData, nameSkillToRemove) {
    let isExceptionPrerequisite = false;

    for (const exception of reqExceptions) {
        if (nameSkillToRemove.toLowerCase() === exception.toLowerCase()) {
            const filteredTableData = []
            for (const oldSkill of tableData) {
                if (oldSkill.skill.toLowerCase() !== skillTableData.skill.toLowerCase() &&
                    oldSkill.skill.toLowerCase() !== nameSkillToRemove.toLowerCase())
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
function verifyRemovedSkillIsNotARitualismPrerequisite(nameSkillToRemove, tableData, isRemoved, totalReqXP) {
    let isPrerequisite = false;

    if (nameSkillToRemove.includes("Ritualisme")) {
        let tableSkillTotalXP = 0;
        const tableSkills = tableData.filter(tableItem => tableItem.category.includes("Ritualism"));

        // exit early
        if (isRemoved === true && tableSkills.length === 1) { isPrerequisite = true; }
        else {
            for (const tableSkill of tableSkills) {
                // Check of skill die vermindert wordt nog voldoet
                if (tableSkill.skill === nameSkillToRemove) {
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

// Op basis van de Eigenschappen, voeg nieuwe tegels toe.
export function updateGridEigenschappenTiles(tableData, defaultProperties) {
    const propertySums = defaultProperties.map((property) => (
        {
            ...property, value: tableData.reduce((sum, record) => {
                let vaardigheid = sourceBasisVaardigheden.find((vaardigheid) =>
                    vaardigheid.skill.toLowerCase() === record.skill.toLowerCase());
                if (!vaardigheid) {
                    vaardigheid = sourceExtraVaardigheden.find((vaardigheid) =>
                        vaardigheid.skill.toLowerCase() === record.skill.toLowerCase());
                }

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
        let vaardigheid = sourceBasisVaardigheden.find((vaardigheid) =>
            vaardigheid.skill.toLowerCase() === record.skill.toLowerCase());
        if (!vaardigheid) {
            vaardigheid = sourceExtraVaardigheden.find((vaardigheid) =>
                vaardigheid.skill.toLowerCase() === record.skill.toLowerCase());
        }

        const spells = vaardigheid.Spreuken || [];

        spells.forEach((spell) => {
            const existingSpell = spellsAccumulator.find((existing) =>
                existing.name.toLowerCase() === spell.name.toLowerCase());
            if (existingSpell) { existingSpell.count += spell.count; }
            else {
                spell.skill = vaardigheid.skill;
                spell.alt_skill = vaardigheid.alt_skill;
                spellsAccumulator.push({ ...spell });
            }
        });
        return spellsAccumulator;
    }, []);
    return spellProperties;
}

// Op basis van de Recepten, voeg nieuwe tegels toe.
export function updateGridReceptenTiles(tableData) {
    const recipyProperties = tableData.reduce((recipyAccumulator, record) => {
        let vaardigheid = sourceBasisVaardigheden.find((vaardigheid) =>
            vaardigheid.skill.toLowerCase() === record.skill.toLowerCase());
        if (!vaardigheid) {
            vaardigheid = sourceExtraVaardigheden.find((vaardigheid) =>
                vaardigheid.skill.toLowerCase() === record.skill.toLowerCase());
        }

        const recepten = vaardigheid ? vaardigheid.Recepten : [];

        for (const recipy of recepten) {
            const existingRecipy = recipyAccumulator.find((existing) =>
                existing?.name.toLowerCase() === recipy.name.toLowerCase());
            if (existingRecipy) {
                existingRecipy.count += recipy.count;
            } else {
                recipy.skill = vaardigheid.skill;
                recipyAccumulator.push({ ...recipy });
            }
        }
        return recipyAccumulator;
    }, []);
    return recipyProperties;
}

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