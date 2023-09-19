/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import { Tooltip } from './tooltip.js';
import {
    GridEigenschapItem,
    GenericTooltipItem,
    updateGridEigenschappenTiles,
    updateGridSpreukenTiles,
    updateGridReceptenTiles
} from './griditem.js';

import vaardigheden from './json/vaardigheden.json';
import spreuken from './json/spreuken.json';
import recepten from './json/recepten.json';
import './App.css';

let totalXP = 0; // Berekende totaal waarde

// Ophalen van de skills uit vaardigheden/spreuken/recepten
export const sourceBasisVaardigheden = vaardigheden.BasisVaardigheden;
let optionsBasisVaardigheden = sourceBasisVaardigheden.map((record) => (
    {
        value: record.skill,
        label: record.skill + " (" + record.xp + " xp)"
    }));

export const sourceExtraVaardigheden = vaardigheden.ExtraVaardigheden;
let optionsExtraVaardigheden = sourceExtraVaardigheden.map((record) => (
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

const gridData = [defaultProperties[0], defaultProperties[1]];
const emptyData = [];

// Tabel Vaardigheden
const columns = [
    { Header: "ID", accessor: "id", className: "col-id" },
    { Header: "Vaardigheid", accessor: "skill", className: "col-vaardigheid" },
    { Header: "XP Kosten", accessor: "xp", className: "col-xp" },
    { Header: "Loresheet", accessor: "loresheet", className: "col-loresheet", Cell: ({ value }) => (value ? "Ja" : ""), },
    { Header: "Aantal keer", accessor: "count", className: "col-aantalkeer" },
];

/// --- MAIN APP --- ///
function App() {
    const [tableData, setTableData] = useState(emptyData);
    const [selectedBasicSkill, setSelectedBasicSkill] = useState("");
    const [selectedExtraSkill, setSelectedExtraSkill] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMsg, setModalMsg] = useState("")
    const [gridEigenschappen, setGridEigenschappen] = useState(gridData);
    const [gridSpreuken, setGridSpreuken] = useState(emptyData)
    const [gridRecepten, setGridRecepten] = useState(emptyData)
    const [isChecked, setIsChecked] = useState(true);
    const [MAX_XP, setMAX_XP] = useState(15);

    useEffect(() => { onUpdateTableData(); }, [tableData]);

    // CHECKBOX
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        if (!isChecked) {
            setMAX_XP(15);
            setTableData([]);
        }
    };

    // INPUT    
    const handleInputChange = (event) => {
        if (isChecked) { event.preventDefault(); } // stop bewerking 
        else if (event.target.value && event.target.value > event.target.min) {
            const newValue = parseFloat(event.target.value);
            let roundedValue = Math.floor(newValue * 4) / 4;
            roundedValue = roundedValue.toFixed(2)

            if (roundedValue > parseFloat(event.target.max)) {
                roundedValue = event.target.max;
            }
            setMAX_XP(roundedValue);
        }
        else { setMAX_XP(1); }
    };

    // TABLE gerelateerd
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
                    <td>
                        <button className="btn-secondary" onClick={() => setTableData([])}>
                            Wissen
                        </button>
                    </td>
                </tr>
            );
        }
    }

    /// --- GRID CONTENT --- ///
    function onUpdateTableData() {
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
    };

    // Check of de Skill aan de vereisten voldoet
    function meetsAllPrerequisites(selectedSkill) {
        let result = false;
        if (selectedSkill) {
            const reqSkill = selectedSkill.Requirements.skill;
            const reqAny = selectedSkill.Requirements.any_list;
            const reqCategory = selectedSkill.Requirements.Category;

            // exit early
            if (reqSkill.length === 0 &&
                reqAny.length === 0 &&
                (!reqCategory || (reqCategory && reqCategory.name.length === 0)) &&
                selectedSkill.skill !== "Leermeester Expertise") {
                result = true;
            }
            else {
                result = true;

                // uitzondering eerst
                if (selectedSkill.skill === "Leermeester Expertise") {
                    let containsSkill = false;
                    for (const item of tableData) {
                        const requiredSkill = sourceExtraVaardigheden.some((record) =>
                            record.skill.toLowerCase() === item.skill.toLowerCase());
                        if (requiredSkill) {
                            containsSkill = true;
                            break;
                        }
                    }
                    if (containsSkill === false) {
                        setModalMsg("Deze vaardigheid kan alleen geselecteerd worden \n wanneer een Extra vaardigheid aangeleerd is.");
                        result = false;
                    }
                }

                // skill
                if (reqSkill.length > 0) {
                    for (let i = 0; i < reqSkill.length; i++) {
                        const requiredSkill = tableData.some((record) =>
                            record.skill.toLowerCase() === reqSkill[i].toLowerCase())
                        if (!requiredSkill) {
                            result = false;
                            setModalMsg("Deze vaardigheid mist een vereiste vaardigheid: \n" + reqSkill[i] + ". \nToevoegen is niet toegestaan.\n");
                            break;
                        }
                    }
                }

                // any_list
                if (reqAny.length > 0) {
                    let reqAnySkill = false;
                    for (let i = 0; i < reqAny.length; i++) {
                        const requiredSkill = tableData.some((record) =>
                            record.skill.toLowerCase().includes(reqAny[i].toLowerCase()));

                        if (requiredSkill === true) {
                            reqAnySkill = true;
                            break;
                        }
                    }

                    // wanneer er niet voldaan is aan een van de Any_list dan niet vrijgeven.
                    if (reqAnySkill === false && result === true) {
                        result = false;
                        setModalMsg("Dit item mist een vereiste vaardigheid. \n" +
                            "een van de volgende:" +
                            reqAny.map((item) => "\n" + item) + "\n" +
                            "Toevoegen is niet toegestaan.\n");
                    }
                }

                // category
                if (reqCategory) {
                    let selectedSkillsXP = 0;
                    const categories = reqCategory.name;
                    const totalReqXP = reqCategory.value;

                    // Afhandelen uitzondering
                    if (categories.length === 1 &&
                        categories.includes("Ritualisme")) {
                        const selectedSkills = tableData.filter(tableItem => categories.includes(tableItem.category));

                        let meetsPreReq = false;
                        for (const skill of selectedSkills) {
                            if (skill.xp >= totalReqXP) {
                                meetsPreReq = true;
                                break;
                            }
                        };
                        if (meetsPreReq === false) {
                            result = false;
                            setModalMsg("Dit item mist de vereiste XP (" + totalReqXP + ") in een van de volgende categorien:" +
                                categories.map((item) => "\n" + item) +
                                "\nToevoegen is niet toegestaan.");
                        }
                    }
                    // Standaard werking categorie
                    else {
                        const selectedSkills = tableData.filter(item =>
                            categories.includes(item.category) &&                       // van de juiste categorie
                            (item.Spreuken.length > 0 || item.Recepten.length > 0));    // alleen skills met recepten of spreuken zijn doorgaans relevant
                        selectedSkills.forEach(item => selectedSkillsXP += item.xp);

                        if (totalReqXP > selectedSkillsXP) {
                            result = false;
                            setModalMsg("Dit item mist de vereiste XP (" + totalReqXP + ") in een van de volgende categorien:" +
                                categories.map((item) => "\n" + item) +
                                "\nToevoegen is niet toegestaan.");
                        }
                    }
                }
            }
        }
        else {
            console.warn("This skill should have been found, but was undefined");
        }
        return result;
    }

    // Check of de skill een vereiste is voor een van de gekozen skills
    function isSkillAPrerequisiteToAnotherSkill(skillName) {
        let isPrerequisite = false;
        const containsTeacherSkill = tableData.some((record) => record.skill === "Leermeester Expertise");

        if (tableData.length > 1) {
            let extraSkill = [];
            // Check leermeester expertise afhankelijkheden
            if (containsTeacherSkill) {
                for (const tableSkill of tableData) {
                    const isExtraSkill = sourceExtraVaardigheden.some((record) =>
                        record.skill.toLowerCase() === tableSkill.skill.toLowerCase())
                    if (isExtraSkill) { extraSkill.push(tableSkill.skill); }
                }
                if (extraSkill.length === 1) {
                    isPrerequisite = true;
                    setModalMsg("Dit item is een vereiste voor vaardigheid:\n Leermeester Expertise \nVerwijderen is niet toegestaan.\n");
                }
            }
            // check overige vereisten
            else if (!containsTeacherSkill || extraSkill.length > 1) {
                for (const item of tableData) {
                    const reqSkill = item.Requirements.skill;
                    const reqAny = item.Requirements.any_list;
                    const reqCategory = item.Requirements.Category;

                    if (item.skill.toLowerCase() === skillName.toLowerCase()) { continue; }
                    else if (
                        reqSkill.length === 0 &&
                        reqAny.length === 0 &&
                        (!reqCategory || (reqCategory && reqCategory.name.length === 0))
                    ) { continue; }
                    else {

                        // skill
                        if (reqSkill.length > 0) {
                            for (let i = 0; i < reqSkill.length; i++) {
                                if (skillName.toLowerCase() === reqSkill[i].toLowerCase()) {
                                    isPrerequisite = true;
                                    setModalMsg("Dit item is een vereiste voor vaardigheid:\n " + item.skill + " \nVerwijderen is niet toegestaan.\n");
                                    break;
                                }
                            }
                        }

                        // any_list
                        if (reqAny.length > 0) {
                            let countMultipleAny = 0;
                            for (let i = 0; i < reqAny.length; i++) {
                                const skills = tableData.filter(item => item.skill.toLowerCase().includes(reqAny[i].toLowerCase()));
                                if (skills.length === 0) { continue; }
                                else if (skills.length === 1) { countMultipleAny += 1; }
                                else if (skills.length > 1) {
                                    countMultipleAny = skills.length;
                                    break;
                                }
                            }
                            if (countMultipleAny <= 1) {
                                isPrerequisite = true;
                                setModalMsg("Dit item is een vereiste voor vaardigheid: \n" + item.skill + " \nVerwijderen is niet toegestaan.\n");
                                break;
                            }
                        }

                        // category
                        if (reqCategory) {
                            let selectedSkillsXP = 0;
                            const categories = reqCategory.name;
                            const totalReqXP = reqCategory.value;

                            // Afhandelen uitzondering
                            if (categories.length === 1 &&
                                categories.includes("Ritualisme")) {
                                const selectedSkills = tableData.filter(tableItem => categories.includes(tableItem.category));
                                
                                let meetsPreReq = false;
                                for (const skill of selectedSkills) {
                                    if (skill.xp - (skill.xp / skill.count) >= totalReqXP) {
                                        meetsPreReq = true;
                                        break;
                                    }
                                };
                                if (meetsPreReq === false) {
                                    isPrerequisite = true;
                                    setModalMsg("Dit item is nodig voor de vereiste XP (" + totalReqXP + ")\n" +
                                        "voor de vaardigheid: \n" + item.skill + "\n" +
                                        "Verwijderen is niet toegestaan.");
                                }
                            }
                            // Standaard werking categorie
                            else {
                                const selectedSkills = tableData.filter(tableItem =>
                                    categories.includes(tableItem.category) &&                              // van de juiste categorie
                                    (tableItem.Spreuken.length > 2 || tableItem.Recepten.length > 2) &&     // alleen skills met recepten of spreuken zijn doorgaans relevant                             
                                    tableItem.skill.toLowerCase() !== item.skill.toLowerCase() &&           // item waarvan pre-reqs gecheckt worden uitsluiten
                                    tableItem.skill.toLowerCase() !== skillName.toLowerCase());             // Skip zelf, deze is wordt verwijderd.

                                selectedSkills.forEach(item => selectedSkillsXP += item.xp);                // calculate XP

                                if (totalReqXP > selectedSkillsXP) {
                                    isPrerequisite = true;
                                    setModalMsg("Dit item is nodig voor de vereiste XP (" + totalReqXP + ")\n" +
                                        "voor de vaardigheid: \n" + item.skill + "\n" +
                                        "Verwijderen is niet toegestaan.");
                                }
                            }
                        }
                    }
                }
            }
        }
        return isPrerequisite;
    }

    /// --- TABLE CONTENT --- ///

    // Voeg de geselecteerde Basis vaardigheid toe aan de tabel
    function handleBasicSkillSelection() {
        if (selectedBasicSkill) {
            const selectedBasicRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === selectedBasicSkill.value.toLowerCase());
            const wasSuccesfull = handleAddToTable(selectedBasicRecord)
            if (wasSuccesfull) { setSelectedBasicSkill(''); }
        }
        else {
            console.warn("Selected Basic skill could not be found.")
        }
    }

    // Voeg de geselecteerde Extra vaardigheid toe aan de tabel
    function handleExtraSkillSelection() {
        if (selectedExtraSkill) {
            const selectedExtraRecord = sourceExtraVaardigheden.find((record) =>
                record.skill.toLowerCase() === selectedExtraSkill.value.toLowerCase());
            const wasSuccesfull = handleAddToTable(selectedExtraRecord)
            if (wasSuccesfull) { setSelectedExtraSkill(''); }
        }
        else {
            console.warn("Selected Extra skill could not be found.")
        }
    }

    // Handel alle controles af, alvorens het opgevoerde Record toe te voegen aan de tabel
    function handleAddToTable(selectedRecord) {
        const wasAlreadySelected = tableData.some((record) =>
            record.skill.toLowerCase() === selectedRecord.skill.toLowerCase());
        const hasSufficientFreeXP = (totalXP + selectedRecord.xp) <= Math.floor(MAX_XP) || selectedRecord.xp === 0;

        if (wasAlreadySelected) {
            setModalMsg("Dit item is al geselecteerd. \nToevoegen is niet toegestaan.\n");
            setShowModal(true);
        }
        // TODO: UNCOMMENT THE CODE
        else if (!meetsAllPrerequisites(selectedRecord)) { setShowModal(true); }
        else if (!hasSufficientFreeXP) {
            if (totalXP === Math.floor(MAX_XP)) {
                setModalMsg(
                    "Maximum XP (" + MAX_XP + ") bereikt. \n" +
                    "Toevoegen is niet toegestaan.\n");
            }
            else if (totalXP < Math.floor(MAX_XP)) {
                setModalMsg(
                    "Maximum xp (" + MAX_XP + ") zal worden overschreden. \n" +
                    "Deze skill kost: " + selectedRecord.xp + ". \n" +
                    "Toevoegen is niet toegestaan.\n");
            } else {
                console.warn("There should be a reason, but no reason was set.")
                setModalMsg("Er ging iets fout...");
            }
            setShowModal(true);
            return false;
        }
        else {
            setTableData((prevData) => [...prevData, selectedRecord]);
            return true;
        }
    };

    // Verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.skill);
        if (isPrerequisite) { setShowModal(true); }
        else {
            // Item weghalen uit grid
            setTableData((prevData) => prevData.filter((item) =>
                item.skill.toLowerCase() !== row.skill.toLowerCase()));
        }
    };

    // Aanvullende aankopen van reeds bestaande vaardigheid
    function handleAdd(row) {
        if (totalXP < Math.floor(MAX_XP)) {
            // Source data
            let sourceRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());
            if (!sourceRecord) {
                sourceRecord = sourceExtraVaardigheden.find((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase())
            };
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
    };

    function handleSubtract(row) {

        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.skill);
        if (isPrerequisite) { setShowModal(true); }
        else {
            // Source data
            let sourceRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());
            if (!sourceRecord) {
                sourceRecord = sourceExtraVaardigheden.find((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase())
            };
            const isPresent = tableData.some((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());
            const currentRecord = tableData.find((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());

            // exit early
            if (isPresent) {
                if (currentRecord.count <= 1) {
                    handleDelete(row);
                }
                // bestaande item aanpassen
                else {
                    const updatedTableData = tableData.map((record) =>
                        record.skill.toLowerCase() === row.skill.toLowerCase() &&
                            record.multi_purchase === true
                            ? { ...record, count: record.count - 1, xp: sourceRecord.xp * (record.count - 1) }
                            : record
                    );
                    setTableData(updatedTableData);
                }
            }
        }
    };

    // Plaats Acties in de kolom op basis van de multipurchase property
    function requestActions(row) {
        let currentItem = sourceBasisVaardigheden.find((record) => record.id === row.original.id);
        if (!currentItem) { currentItem = sourceExtraVaardigheden.find((record) => record.id === row.original.id); }

        if (currentItem && currentItem.multi_purchase === true) {
            return (
                <div className="acties">
                    <div className="acties-tooltip">
                        <Tooltip
                            skillName={currentItem.skill}
                            isSpell={false}
                            isRecipy={false}
                            isSkill={true}
                        />
                    </div>
                    <div className="acties-overige">
                        <img
                            className="btn-image"
                            onClick={() => handleAdd(currentItem)}
                            src="./images/button_add.png"
                            alt="Add">

                        </img>
                        <img
                            className="btn-image"
                            onClick={() => handleSubtract(currentItem)}
                            src="./images/button_subtract.png"
                            alt="Subtract">
                        </img>
                        <img
                            className="btn-image"
                            onClick={() => handleDelete(currentItem)}
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
                    <div className="acties-tooltip">
                        <Tooltip
                            skillName={currentItem.skill}
                            isSpell={false}
                            isRecipy={false}
                            isSkill={true}
                        />
                    </div>
                    <div className="acties-overige">
                        <img
                            className="btn-image"
                            onClick={() => handleDelete(currentItem)}
                            src="./images/button_remove.png"
                            alt="Remove">
                        </img>
                    </div>
                </div>
            );
        }
    }

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

    function modalContent(modalMsg, closeModal) {
        const msgBlocks = modalMsg.split('\n');
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return (
            <div className="modal-overlay">
                <div className="modal">
                    {msgBlocks.map((block, index) => (
                        <div key={index} className="modal-block">
                            {block === '' ? <br /> : block.match(urlRegex) ? <a target="_blank" rel="noopener noreferrer" href={block}>{block}</a> : block}
                        </div>
                    ))}
                    <button className="btn-primary" onClick={closeModal}>
                        OK
                    </button>
                </div>
            </div>);
    }

    const closeModal = () => { setShowModal(false); };
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: tableData, });

    /// --- HTML CONTENT --- ///
    return (
        <div className="App">
            <header className="App-header">
                <h2>Character Creator</h2>
            </header>
            <main>
                <div className="main-container">
                    <div className="select-settings">
                        <div>
                            <label className="settings-label">
                                Nieuw personage:
                            </label>
                            <input className="settings-checkbox"
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                            />{' '}
                        </div>
                        <div>
                            <label className="settings-label">
                                Max XP:
                            </label>
                            <input className="settings-input-xp"
                                type="number"
                                value={MAX_XP}
                                min={1}
                                max={100}
                                onChange={handleInputChange}
                                disabled={isChecked}
                                step={0.25}
                            />
                        </div>
                    </div>
                    <div className="select-basic-container">
                        <Select
                            className="form-select"
                            options={optionsBasisVaardigheden}
                            value={selectedBasicSkill}
                            onChange={(selectedBasicOption) => setSelectedBasicSkill(selectedBasicOption)}
                            placeholder="Selecteer een Basis vaardigheid"
                            isClearable
                            isSearchable
                        />

                        {   // Conditionele tooltip
                            selectedBasicSkill &&
                            selectedBasicSkill.value !== "" &&
                            <div className="select-info">
                                <Tooltip
                                    skillName={selectedBasicSkill.value}
                                    isSpell={false}
                                    isRecipy={false}
                                    isSkill={true}
                                />
                            </div>
                        }

                        <button className="btn-primary" onClick={handleBasicSkillSelection}>
                            Toevoegen
                        </button>
                    </div>

                    {
                        // Bij uitzettend Checkbox worden Extra skills beschikbaar
                        !isChecked && (
                            <div className="select-extra-container">
                                <Select
                                    className="form-select"
                                    options={optionsExtraVaardigheden}
                                    value={selectedExtraSkill}
                                    onChange={(selectedExtraOption) => setSelectedExtraSkill(selectedExtraOption)}
                                    placeholder="Selecteer een Extra vaardigheid"
                                    isClearable
                                    isSearchable
                                />

                                {   // Conditionele tooltip
                                    selectedExtraSkill &&
                                    selectedExtraSkill.value !== "" &&
                                    <div className="select-info">
                                        <Tooltip
                                            skillName={selectedExtraSkill.value}
                                            isSpell={false}
                                            isRecipy={false}
                                            isSkill={true}
                                        />
                                    </div>
                                }

                                <button className="btn-primary" onClick={handleExtraSkillSelection}>
                                    Toevoegen
                                </button>
                            </div>
                        )}

                    <table {...getTableProps()} className="App-table">
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                        <th {...column.getHeaderProps()} className={column.className}>{column.render('Header')}</th>
                                    ))}
                                    <th className="col-acties">Acties</th>
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map((cell) => {
                                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                        })}

                                        <td>
                                            {requestActions(row)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {
                                getTableDataSums()
                            }
                        </tbody>
                    </table>

                    {showModal && modalContent(modalMsg, closeModal)}
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
            </main>
            <div className="flex-filler"></div>
            <footer>
                <div>2023 v0.1-alpha</div>
                <div>Design by Deprecated Dodo{'\u2122'}</div>
                <div className="disclaimer" onClick={showDisclaimer}>Disclaimer</div>
            </footer>
        </div>
    );
}

export default App;


