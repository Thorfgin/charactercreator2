/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Tooltip from './tooltip.jsx';
import Toolbar from './toolbar.jsx';
import ModalMessage from './modalmessage.jsx'
import FileUploadModal from './fileupload.jsx'
import LoadCharacterModal from './loadcharacter.jsx'

import openPage from './openPdf.jsx';
import {
    GridEigenschapItem,
    GenericTooltipItem,
    updateGridEigenschappenTiles,
    updateGridSpreukenTiles,
    updateGridReceptenTiles
} from './griditem.jsx';

import { setLocalStorage, getLocalStorage } from './localstorage.jsx';

import vaardigheden from './json/vaardigheden.json';
import spreuken from './json/spreuken.json';
import recepten from './json/recepten.json';
import packageInfo from '../package.json';

export let totalXP = 0; // Berekende totaal waarde

// Ophalen van de skills uit vaardigheden/spreuken/recepten
export const sourceBasisVaardigheden = vaardigheden.BasisVaardigheden;
export let optionsBasisVaardigheden = sourceBasisVaardigheden.map((record) => (
    {
        value: record.skill,
        label: record.skill + " (" + record.xp + " xp)"
    }));

export const sourceExtraVaardigheden = vaardigheden.ExtraVaardigheden;
export let optionsExtraVaardigheden = sourceExtraVaardigheden.map((record) => (
    {
        value: record.skill,
        label: record.skill + " (" + record.xp + " xp)"
    }));


export const sourceSpreuken = [].concat(...spreuken.Categories.map(category => category.Skills));
export const sourceRecepten = [].concat(...recepten.Categories.map(category => category.Skills));

export const defaultProperties = [
    { name: "hitpoints", image: "./images/image_hp.png", text: "Totaal HP", value: 1 },
    { name: "armourpoints", image: "./images/image_ap.png", text: "Max AP", value: 0 },
    { name: "elemental_mana", image: "./images/image_em.png", text: "Elementaire Mana", value: 0 },
    { name: "elemental_ritual_mana", image: "./images/image_erm.png", text: "Rituele Elementaire Mana", value: 0 },
    { name: "spiritual_mana", image: "./images/image_sm.png", text: "Spirituele Mana", value: 0 },
    { name: "spiritual_ritual_mana", image: "./images/image_srm.png", text: "Rituele Spirituele Mana", value: 0 },
    { name: "inspiration", image: "./images/image_ins.png", text: "Inspiratie", value: 0 },
    { name: "willpower", image: "./images/image_wil.png", text: "Wilskracht", value: 0 },
    { name: "glyph_craft_cap", image: "./images/image_glp_cra.png", text: "Glyph Craft cap", value: 0 },
    { name: "glyph_imbue_cap", image: "./images/image_glp_imb.png", text: "Glyph Imbue cap", value: 0 },
    { name: "rune_craft_cap", image: "./images/image_run_cra.png", text: "Rune Craft cap", value: 0 },
    { name: "rune_imbue_cap", image: "./images/image_run_imb.png", text: "Rune Imbue cap", value: 0 }
];

/// --- LOCAL STORAGE --- ///

// De locale storage with gemarkeerd met een regelset versie, zoals opgenomen in de packageInfo
// Hiermee kan (in de toekomst) onderscheid gemaakt worden tussen verschillende versies van regels 
if (typeof (Storage) !== "undefined") {
    Storage.prototype.setObject = function (key, value) {
        if (!key || !value) { return; }
        if (typeof value === "object") { value = JSON.stringify(value); }
        var encodedValue = encodeURIComponent(value);
        var unreadableValue = btoa(encodedValue);
        localStorage.setItem(key, unreadableValue);
    }

    // Op dit moment wordt alleen de versie uitgelezen. Afwijkende versie nummers worden vooralsnog niet getoond.
    Storage.prototype.getObject = function (key) {
        if (!key) { return; }
        var value = this.getItem(key);
        if (!value) { return; }
        var readableValue = atob(value);
        var decodedValue = decodeURIComponent(readableValue);
        if (decodedValue && decodedValue.length >= 0) {
            if (decodedValue[0] === "{" || decodedValue[1] === "{") { decodedValue = JSON.parse(decodedValue); }
            return decodedValue;
        }
        else {
            return [];
        }
    }
}


// Tabel Data
const gridData = [defaultProperties[0], defaultProperties[1]];
const emptyData = [];

// Tabel Vaardigheden
const columns = [
    { Header: "ID", accessor: "id", className: "col-id" },
    { Header: "Vaardigheid", accessor: "skill", className: "col-vaardigheid" },
    { Header: "XP Kosten", accessor: "xp", className: "col-xp" },
    { Header: "Loresheet", accessor: "loresheet", className: "col-loresheet", Cell: ({ value }) => (requestLoreSheet(value)), },
    { Header: "Aantal keer", accessor: "count", className: "col-aantalkeer" },
    { Header: "Info", className: "col-info", Cell: ({ row }) => requestInfo(row) },
];

// Check of de Skill aan de vereisten voldoet
export function meetsAllPrerequisites(selectedSkill, tableData, setModalMsg) {
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
            meetsPrerequisite = true;
        }
        else {
            // uitzondering eerst
            if (selectedSkill.skill === "Leermeester Expertise") {
                meetsPrerequisite = verifyTableContainsExtraSkill(tableData);
                if (meetsPrerequisite === false) {
                    setModalMsg(
                        "Deze vaardigheid kan alleen geselecteerd worden \n" +
                        "wanneer een Extra vaardigheid aangeleerd is.");
                }
            }

            // skill
            if (reqSkill.length > 0 && meetsPrerequisite === true) {
                meetsPrerequisite = verifyTableContainsRequiredSkills(reqSkill, tableData, setModalMsg);
            }

            // any_list
            if (reqAny.length > 0 && meetsPrerequisite === true) {
                meetsPrerequisite = verifyTableContainsOneofAnyList(reqAny, tableData);
                if (meetsPrerequisite === false) {
                    setModalMsg("Dit item mist een vereiste vaardigheid. \n" +
                        "een van de volgende:" +
                        reqAny.map((item) => "\n" + item) + "\n" +
                        "Toevoegen is niet toegestaan.\n");
                }
            }

            // category
            if (reqCategory && meetsPrerequisite === true) {
                meetsPrerequisite = verifyTableMeetsPrerequisiteCategoryXP(reqCategory, tableData);
                if (meetsPrerequisite === false) {
                    setModalMsg(
                        "Dit item mist de vereiste XP (" + reqCategory.value + ") in een van de volgende categorien:" +
                        reqCategory.name.map((item) => "\n" + item) +
                        "\nToevoegen is niet toegestaan.");
                }
            }

            // exception
            if (reqException && meetsPrerequisite === false) {
                const isValidException = verifyTableMeetsPrerequisiteException(reqException, tableData);
                if (isValidException === true) {
                    meetsPrerequisite = true
                    setModalMsg('');
                }
            }

        }
    }
    else {
        console.warn("This skill should have been found, but was undefined");
    }
    return meetsPrerequisite;
}


// Check of de skill een vereiste is voor een van de gekozen skills
export function isSkillAPrerequisiteToAnotherSkill(nameSkillToRemove, isRemoved, tableData, setModalMsg) {
    let isPrerequisite = false;

    if (tableData.length > 1) {
        let extraSkills = [];

        // Check leermeester expertise afhankelijkheden
        const containsTeacherSkill = tableData.some((record) => record.skill === "Leermeester Expertise");
        if (containsTeacherSkill) {
            extraSkills = getExtraSkillsFromTable(tableData);
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
                        }
                    }

                    // exception
                    if (reqException && isPrerequisite === false) {
                        isPrerequisite = verifyTableExceptionSkillMeetsPrerequisite(tableData, reqException, skillTableData, nameSkillToRemove, setModalMsg);
                        if (isPrerequisite === true) {
                            setModalMsg("Dit item is nodig voor als uitzondering" +
                                " voor de vaardigheid: \n" + skillTableData.skill + "\n" +
                                "Verwijderen is niet toegestaan.");
                        }
                    }
                }
            }
        }
    }
    return isPrerequisite;
}

// Check of er minimaal 1 vaardigheid uit de extra vaardigheden aanwezig is in de tabel
function verifyTableContainsExtraSkill(tableData) {
    let meetsPrerequisite = false;
    for (const tableDataSkill of tableData) {
        meetsPrerequisite = sourceExtraVaardigheden.some((record) => record.skill.toLowerCase() === tableDataSkill.skill.toLowerCase());
        if (meetsPrerequisite === true) { break; }
    }
    return meetsPrerequisite;
}

// Ophalen van alle vaardigheden uit de extra vaardigheden die aanwezig zijn in de tabel
function getExtraSkillsFromTable(tableData) {
    const extraSkills = []
    for (const tableSkill of tableData) {
        const isExtraSkill = sourceExtraVaardigheden.some((record) => record.skill.toLowerCase() === tableSkill.skill.toLowerCase());
        if (isExtraSkill) { extraSkills.push(tableSkill.skill); }
    }
    return extraSkills;
}

// Check of de skills in Requirements.skill aanwezig zijn in de tabel
function verifyTableContainsRequiredSkills(reqSkill, tableData, setModalMsg) {
    let meetsPrerequisite = false;
    for (let i = 0; i < reqSkill.length; i++) {
        meetsPrerequisite = tableData.some((record) => record.skill.toLowerCase() === reqSkill[i].toLowerCase());
        if (meetsPrerequisite === false) {
            setModalMsg(
                "Deze vaardigheid mist een vereiste vaardigheid: \n"
                + reqSkill[i] + ". \n " +
                "Toevoegen is niet toegestaan.\n");
            break;
        }
    }
    return meetsPrerequisite;
}

// Check of de skill niet een prequisite is uit de Any_Skill
function verifyRemovedSkillIsNotSkillPrerequisite(reqSkill, currentSkill, nameSkillToRemove, isRemoved) {
    let isPrerequisite = false;
    for (let i = 0; i < reqSkill.length; i++) {
        if (isRemoved) {
            if (nameSkillToRemove.toLowerCase() === reqSkill[i].toLowerCase()) {
                isPrerequisite = true;
                break;
            }

        }
        else {
            if (!isRemoved &&
                currentSkill.skill.toLowerCase() === nameSkillToRemove.toLowerCase()) {
                if (currentSkill.count === 1) { isPrerequisite = true; }
            }
        }
    }
    return isPrerequisite;
}

// Check of tenminste een van de skills in Requirements.any_list aanwezig zijn in de tabel
function verifyTableContainsOneofAnyList(reqAny, tableData) {
    let meetsAnyListPrerequisite = false;
    for (let i = 0; i < reqAny.length; i++) {
        meetsAnyListPrerequisite = tableData.some((record) => record.skill.toLowerCase().includes(reqAny[i].toLowerCase()));
        if (meetsAnyListPrerequisite === true) { break; }
    }
    return meetsAnyListPrerequisite;
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
        for (let i = 0; i < reqAny.length; i++) {
            hasOtherSkillThatIsPrerequisite = tableData.some((record) =>
                record.skill.toLowerCase().includes(reqAny[i].toLowerCase()) &&
                record.skill.toLowerCase() !== nameSkillToRemove.toLowerCase());
            if (hasOtherSkillThatIsPrerequisite === true) { break; }
        }
    }
    // Return inverse, as it nameSkillToRemove is NOT a prerequisite
    return !hasOtherSkillThatIsPrerequisite;
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
function verifyTableExceptionSkillMeetsPrerequisite(tableData, reqExceptions, skillTableData, nameSkillToRemove, setModalMsg) {
    let isExceptionPrerequisite = false;

    for (const exception of reqExceptions) {
        if (nameSkillToRemove.toLowerCase() === exception.toLowerCase()) {
            const filteredTableData = []
            for (const oldSkill of tableData) {
                if (oldSkill.skill.toLowerCase() !== skillTableData.skill.toLowerCase() &&
                    oldSkill.skill.toLowerCase() !== nameSkillToRemove.toLowerCase())
                    filteredTableData.push(oldSkill)
            }

            const meetsPrequisites = meetsAllPrerequisites(skillTableData, filteredTableData, setModalMsg)
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

// Plaats Info in de kolom
function requestInfo(row) {
    let currentItem = sourceBasisVaardigheden.find((record) => record.id === row.original.id);
    if (!currentItem) { currentItem = sourceExtraVaardigheden.find((record) => record.id === row.original.id); }

    return (
        <div className="info">
            <div className="acties-info">
                <Tooltip
                    skillName={currentItem.skill}
                    isSpell={false}
                    isRecipe={false}
                    isSkill={true}
                />
                <img
                    className="btn-image"
                    title={"Open Vaardigheden.pdf - pagina " + currentItem.page}
                    onClick={() => openPage('Vaardigheden.pdf', currentItem.page)}
                    src="./images/img-pdf.png"
                    alt="PDF">
                </img>
            </div>
        </div>
    )
}

// Open PDF op basis van loresheet uit de vaardigheden.json
function requestLoreSheet({ pdf, page }) {

    if (!pdf || pdf === "") {
        <div className="info" />
    }
    else {
        return (
            <div className="info">
                <div className="loresheet-info">
                    <img
                        className="btn-image"
                        title={"Open " + pdf}
                        onClick={() => openPage(pdf, page ? page : 1)}
                        src="./images/img-pdf.png"
                        alt="PDF">
                    </img>
                </div>
            </div>
        )
    }
}

// Fetch data before the page is loaded
const rawData = getLocalStorage('CCdata');

/// --- MAIN APP --- ///
export default function App() {
    const [tableData, setTableData] = useState(getInitialData(true, false, false));
    const [charName, setCharName] = useState("");
    const [isChecked, setIsChecked] = useState(getInitialData(false, false, true));
    const [MAX_XP, setMAX_XP] = useState(getInitialData(false, true, false));
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLoadCharacterModal, setShowLoadCharacterModal] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const [gridEigenschappen, setGridEigenschappen] = useState(gridData);
    const [gridSpreuken, setGridSpreuken] = useState(emptyData);
    const [gridRecepten, setGridRecepten] = useState(emptyData);

    useEffect(() => { onUpdateTableData(); }, [tableData]);

    const toolbarContainer = new Toolbar(
        [tableData, setTableData],
        [MAX_XP, setMAX_XP],
        [charName, setCharName],
        [isChecked, setIsChecked],
        setModalMsg,
        setShowModal,
        setShowUploadModal,
        setShowLoadCharacterModal,
        clearCharacterBuild);

    /// --- GRID CONTENT --- ///
    function getInitialData(hasData, hasXP, wasChecked) {
        if (rawData && rawData.length > 0) {
            const charData = rawData[0]
            if (charData &&
                charData.ruleset_version &&
                charData.ruleset_version === packageInfo.ruleset_version) {

                if (hasData) { return charData.data; }
                if (hasXP) { return charData.MAX_XP }
                if (wasChecked) { return charData.isChecked }
            }
        }
        else {
            if (hasData) { return [] }
            if (hasXP) { return 15 }
            if (wasChecked) { return true }
        }
    }

    // Wanneer er iets aan de tableData verandert, wordt de nieuwe data opgeslagen.
    // Op basis van de nieuwe tableData worden de Selects, Grid en Spreuken/Recepten bijewerkt.
    function onUpdateTableData() {
        // LocalStorage bijwerken
        setLocalStorage('CCdata', [{
            ruleset_version: packageInfo.ruleset_version,
            isChecked: isChecked,
            MAX_XP: MAX_XP,
            data: tableData
        }]);

        // SELECT skill options bijwerken | reeds geselecteerde items worden uitgesloten.
        if (tableData.length >= 0) {
            const allBasicOptions = sourceBasisVaardigheden.map((record) =>
                ({ value: record.skill, label: record.skill + " (" + record.xp + " xp)" }));
            optionsBasisVaardigheden = allBasicOptions.filter((currentSkill) =>
                !tableData.some((record) =>
                    record.skill.toLowerCase() === currentSkill.value.toLowerCase()));

            const allExtraOptions = sourceExtraVaardigheden.map((record) =>
                ({ value: record.skill, label: record.skill + " (" + record.xp + " xp)" }));
            optionsExtraVaardigheden = allExtraOptions.filter((currentSkill) =>
                !tableData.some((record) =>
                    record.skill.toLowerCase() === currentSkill.value.toLowerCase()));
        }

        // karakter eigenschappen container
        const updatedGridEigenschappenContent = updateGridEigenschappenTiles(tableData).filter((property) => {
            return property.value !== 0
                || property.name === 'hitpoints'
                || property.name === 'armourpoints';
        });
        setGridEigenschappen(updatedGridEigenschappenContent);

        // spreuken & techieken container
        const updatedGridSpreukenContent = updateGridSpreukenTiles(tableData).filter((property) => {
            return property.value !== ""
        });
        setGridSpreuken(updatedGridSpreukenContent);

        // receptne container
        const updatedGridReceptenContent = updateGridReceptenTiles(tableData).filter((property) => {
            return property.value !== ""
        });
        setGridRecepten(updatedGridReceptenContent);
    }

    /// --- TABLE CONTENT --- ///
    function getTableDataSums() {
        // reset
        totalXP = 0;
        // herberekenen op basis van tabel data.
        const totalSkills = tableData.length;
        tableData.forEach(skill => { totalXP += skill.xp; });

        if (totalSkills > 0) {
            return (
                <tr>
                    <td /><td>Aantal vaardigheden: {totalSkills} </td>
                    <td>Totaal: {totalXP}</td>
                    <td />
                    <td />
                    <td />
                    <td>
                        <button
                            title="Alle vaardigheden verwijderen"
                            className="btn-secondary"
                            onClick={clearCharacterBuild}>
                            Wissen
                        </button>
                    </td>
                </tr>
            );
        }
    }

    // Wissen van tabel + naam
    function clearCharacterBuild() {
        setTableData([]);
        setCharName("");
        setMAX_XP(15);
        setIsChecked(true);
    }

    // Verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.skill, true, tableData, setModalMsg);
        if (isPrerequisite) { setShowModal(true); }
        else {
            // Item weghalen uit grid
            setTableData((prevData) => prevData.filter((item) =>
                item.skill.toLowerCase() !== row.skill.toLowerCase()));
        }
    }

    // Aanvullende aankopen van reeds bestaande vaardigheid
    function handleAdd(row) {
        if (totalXP < Math.floor(MAX_XP)) {
            // Source data
            let sourceRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());
            if (!sourceRecord) {
                sourceRecord = sourceExtraVaardigheden.find((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase())
            }
            const currentRecord = tableData.find((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());

            if (currentRecord.count < sourceRecord.maxcount) {
                // Updated Table Data here skill matches and record has multi_purchase === true
                const updatedTableData = tableData.map((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase()
                        ? { ...record, count: record.count + 1, xp: sourceRecord.xp * (record.count + 1) }
                        : record
                );
                setTableData(updatedTableData);
            }
            else {
                // Inbouwen extra zekerheid dat items niet twee keer in het grid komen.
                setModalMsg("Maximum aantal aankopen bereikt. \nToevoegen is niet toegestaan.\n");
                setShowModal(true);
            }
        }
        else {
            setModalMsg("Maximum XP (" + MAX_XP + ") bereikt. \nToevoegen is niet toegestaan.\n");
            setShowModal(true);
        }
    }

    function handleSubtract(row) {
        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.skill, false, tableData, setModalMsg);
        if (isPrerequisite) { setShowModal(true); }
        else {
            const currentSkill = tableData.find(currentSkill => currentSkill.skill === row.skill);
            if (currentSkill.count === 1) {
                // Item weghalen uit grid
                setTableData((prevData) => prevData.filter((item) =>
                    item.skill.toLowerCase() !== row.skill.toLowerCase()));
            }
            else {
                const updatedTableData = tableData.map((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase() &&
                        record.multi_purchase === true
                        ? { ...record, count: record.count - 1, xp: (record.xp / record.count) * (record.count - 1) }
                        : record
                );
                setTableData(updatedTableData);
            }
        }
    }

    // Plaats Acties in de kolom op basis van de multipurchase property
    function requestActions(row) {
        let currentItem = sourceBasisVaardigheden.find((record) => record.id === row.original.id);
        if (!currentItem) { currentItem = sourceExtraVaardigheden.find((record) => record.id === row.original.id); }

        if (currentItem && currentItem.multi_purchase === true) {
            return (
                <div className="acties">
                    <div className="acties-overige">
                        <img
                            className="btn-image"
                            title="Toevoegen"
                            onClick={() => handleAdd(currentItem, [tableData, setTableData], [modalMsg, setModalMsg], [showModal, setShowModal])}
                            src="./images/button_add.png"
                            alt="Add">
                        </img>
                        <img
                            className="btn-image"
                            title="Verminderen"
                            onClick={() => handleSubtract(currentItem)}
                            src="./images/button_subtract.png"
                            alt="Subtract">
                        </img>
                        <img
                            className="btn-image"
                            title={currentItem.skill + " verwijderen"}
                            onClick={() => handleDelete(currentItem, [tableData, setTableData], [modalMsg, setModalMsg], [showModal, setShowModal])}
                            src="./images/button_remove.png"
                            alt="Remove">
                        </img>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="acties">
                    <div className="acties-overige">
                        <img
                            className="btn-image"
                            title={currentItem.skill + " verwijderen"}
                            onClick={() => handleDelete(currentItem, [tableData, setTableData], [modalMsg, setModalMsg], [showModal, setShowModal])}
                            src="./images/button_remove.png"
                            alt="Remove">
                        </img>
                    </div>
                </div>
            );
        }
    }

    // TableData aanpassen op basis van Drag & Drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const updatedTableData = [...tableData];
        const [reorderedRow] = updatedTableData.splice(result.source.index, 1);
        updatedTableData.splice(result.destination.index, 0, reorderedRow);

        setTableData(updatedTableData);
    };

    function showDisclaimer() {
        setModalMsg(
            "De character creator geeft een indicatie van de mogelijkheden.\n " +
            "Er kunnen altijd afwijkingen zitten tussen de teksten\n" +
            "in de character creator en de VA regelset.\n\n" +
            "Check altijd de laatste versie van de regelset op:\n" +
            "https://the-vortex.nl/het-spel/regels/" +
            "\n");
        setShowModal(true);
    }

    const closeModal = () => { setShowModal(false); };
    const closeUploadModal = () => { setShowUploadModal(false); };
    const closeLoadCharacterModal = () => { setShowLoadCharacterModal(false); };

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: tableData }, useSortBy);

    /// --- HTML CONTENT --- ///
    return (
        <div className="App">
            <header className="App-header">
                <img id="App-VA-logo" src="./images/logo_100.png" alt="Logo" />
                <h2>Character Creator</h2>
            </header>
            <main>
                <div className="main-container">
                    {toolbarContainer}

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <table {...getTableProps()} className="App-table">
                            <thead>
                                {headerGroups.map((headerGroup) => (
                                    // eslint-disable-next-line react/jsx-key
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            // eslint-disable-next-line react/jsx-key
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className={column.className}
                                            >
                                                {column.render('Header')}
                                                <span>
                                                    {column.isSorted ? (column.isSortedDesc ? ' \u25BC' : ' \u25B2') : ''}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="col-acties">Acties</th>
                                    </tr>
                                ))}
                            </thead>
                            <Droppable droppableId="skillsDataTable">
                                {(provided) => (
                                    <tbody
                                        {...getTableBodyProps()}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {rows.map((row, index) => {
                                            prepareRow(row);
                                            return (
                                                <Draggable
                                                    key={row.id.toString()}
                                                    draggableId={row.id.toString()}
                                                    index={index}>
                                                    {(provided) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {row.cells.map((cell) => (
                                                                // eslint-disable-next-line react/jsx-key
                                                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                            ))}
                                                            <td role="cell">
                                                                {requestActions(row)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {
                                            getTableDataSums()
                                        }
                                        {provided.placeholder}
                                    </tbody>
                                )}
                            </Droppable>
                        </table>
                    </DragDropContext>

                    {showModal && (<ModalMessage
                        modalMsg={modalMsg}
                        closeModal={closeModal}/>
                    )}              
                    {showUploadModal && (
                        <FileUploadModal
                            closeModal={closeUploadModal}
                            ruleset_version={packageInfo.ruleset_version}
                            setCharName={setCharName}
                            setIsChecked={setIsChecked}
                            setMAX_XP={setMAX_XP}
                            setTableData={setTableData} />
                    )}
                    {showLoadCharacterModal && (
                        <LoadCharacterModal
                            closeModal={closeLoadCharacterModal}
                            setTableData={setTableData}
                            setCharName={setCharName}
                            setIsChecked={setIsChecked}
                            setMAX_XP={setMAX_XP}
                            version={packageInfo.ruleset_version}
                        />
                    )}

                </div>
                <div className="side-containers">
                    <div className="side-container-b">
                        <div className="summary-title">
                            <h5>Character eigenschappen</h5>
                        </div>
                        <div className="grid-eigenschappen">
                            {gridEigenschappen.map((item, index) => (
                                <GridEigenschapItem
                                    name={item.name}
                                    key={index}
                                    image={item.image}
                                    text={item.text}
                                    value={item.value}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="side-container-a">
                        <div className="summary-title">
                            <h5>Spreuken & Technieken</h5>
                        </div>
                        <div className="grid-spreuken">
                            {gridSpreuken?.map((item, index) => (
                                <GenericTooltipItem
                                    skill={item.skill}
                                    name={item.name}
                                    type={"grid-spreuken"}
                                    page={item.page}
                                    key={index}
                                    text={item.name}
                                />
                            ))}
                        </div>

                        <div className="summary-title">
                            <h5>Recepten</h5>
                        </div>
                        <div className="grid-recepten">
                            {gridRecepten.map((item, index) => (
                                <GenericTooltipItem
                                    skill={item.skill}
                                    name={item.name}
                                    type={"grid-recepten"}
                                    key={index}
                                    text={item.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main >
            <div className="flex-filler"></div>
            <footer>
                <div>{packageInfo.version}</div>
                <div>{packageInfo.creator}{'\u2122'}</div>
                <div>
                    <label className="disclaimer" onClick={showDisclaimer}>Disclaimer</label>
                    <label className="faq" onClick={() => { console.log("OK") }}>F.A.Q.</label>
                </div>

            </footer>
        </div >
    );
}