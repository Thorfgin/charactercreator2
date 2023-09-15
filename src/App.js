/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import { Tooltip } from './tooltip.js'
import {
    GridEigenschapItem,
    GenericTooltipItem,
    updateGridEigenschappenTiles,
    updateGridSpreukenTiles,
    updateGridReceptenTiles
} from './griditem.js'

import vaardigheden from './json/basisvaardigheden.json';
import spreuken from './json/spreuken.json';
import recepten from './json/recepten.json';
import './App.css';

let totalXP = 0; // Berekende totaal waarde

// Ophalen van de skills uit vaardigheden/spreuken/recepten
export const sourceVaardigheden = vaardigheden.Vaardigheden;
export const sourceSpreuken = [].concat(...spreuken.Categories.map(category => category.Skills));
export const sourceRecepten = [].concat(...recepten.Categories.map(category => category.Skills));
let skillOptions = sourceVaardigheden.map((record) => ({ value: record.skill, label: record.skill + " (" + record.xp + " xp)" }));

export const defaultProperties = [
    { name: "hitpoints", image: "./images/image_hp.png", text: "Totaal HP", value: 1 },
    { name: "armourpoints", image: "./images/image_ap.png", text: "Max AP", value: 0 },
    { name: "elemental_mana", image: "./images/image_em.png", text: "Elementaire Mana", value: 0 },
    { name: "elemental_ritual_mana", image: "./images/image_erm.png", text: "Rituele Elementaire Mana", value: 0 },
    { name: "spiritual_mana", image: "./images/image_sm.png", text: "Spirituele Mana", value: 0 },
    { name: "spiritual_ritual_mana", image: "./images/image_srm.png", text: "Rituele Spirituele Mana", value: 0 },
    { name: "inspiration", image: "./images/image_ins.png", text: "Inspiratie", value: 0 },
    { name: "willpower", image: "./images/image_wil.png", text: "Wilskracht", value: 0 },
    { name: "glyph_craft_cap", image: "./images/image_glp.png", text: "Glyph cap", value: 0 },
    { name: "glyph_imbue_cap", image: "./images/image_glp_imb.png", text: "Glyph Imbue cap", value: 0 },
    { name: "rune_craft_cap", image: "./images/image_run.png", text: "Rune cap", value: 0 },
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
    const [selectedSkill, setSelectedSkill] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMsg, setModalMsg] = useState("")
    const [gridEigenschappen, setGridEigenschappen] = useState(gridData);
    const [gridSpreuken, setGridSpreuken] = useState(emptyData)
    const [gridRecepten, setGridRecepten] = useState(emptyData)

    useEffect(() => { onUpdateTableData(); }, [tableData]);

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
            const allOptions = sourceVaardigheden.map((record) => ({ value: record.skill, label: record.skill + " (" + record.xp + " xp)" }));
            skillOptions = allOptions.filter((currentSkill) => !tableData.some((record) => record.skill === currentSkill.value));
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

    // Check of de Skill aan de vereisten vodloet
    function meetsAllPrerequisites(selectedSkill) {
        let result = false;
        if (selectedSkill) {
            const reqSkill = selectedSkill.Requirements.skill;
            const reqAny = selectedSkill.Requirements.any_list;

            // exit early
            if (reqSkill.length === 0 & reqAny.length === 0) { result = true; }
            else {
                result = true;

                // skill
                for (let i = 0; i < reqSkill.length; i++) {
                    let requiredSkill = tableData.some((record) => record.skill === reqSkill[i])
                    if (!requiredSkill) {
                        result = false;
                        setModalMsg("Dit item mist de vereiste vaardigheid: \n" + reqSkill[i] + ". \nToevoegen is niet toegestaan.\n");
                        break;
                    }
                }
                // any_list
                for (let i = 0; i < reqAny.length; i++) {
                    let requiredSkill = tableData.some((record) => record.skill.includes(reqAny[i]))
                    if (!requiredSkill) {
                        result = false;
                        setModalMsg("Dit item mist de vereiste vaardigheid: \neen van de " + reqAny[i] + ". \nToevoegen is niet toegestaan.\n");
                        break;
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
        // exist early
        if (tableData.length > 1) {
            for (const item of tableData) {
                if (item.skill === skillName) { continue; }
                else if (item.Requirements.skill.length === 0 &
                    item.Requirements.any_list.length === 0) { continue; }
                else {
                    // skill
                    const reqSkill = item.Requirements.skill;
                    for (let i = 0; i < reqSkill.length; i++) {
                        if (skillName === reqSkill[i]) {
                            isPrerequisite = true;
                            setModalMsg("Dit item is een vereiste voor vaardigheid:\n " + item.skill + " \nVerwijderen is niet toegestaan.\n");
                            break;
                        }
                    }
                    // any_list
                    const reqAny = item.Requirements.any_list;
                    for (let i = 0; i < reqAny.length; i++) {
                        if (skillName.includes(reqAny[i])) {
                            isPrerequisite = true;
                            setModalMsg("Dit item is een vereiste voor vaardigheid: \n" + item.skill + " \nVerwijderen is niet toegestaan.\n");
                            break;
                        }
                    }
                }
            }
        }
        return isPrerequisite;
    }

    /// --- TABLE CONTENT --- ///
    function handleAddToTable() {
        if (selectedSkill) {
            const selectedRecord = sourceVaardigheden.find((record) => record.skill === selectedSkill.value);
            const hasRequiredSkills = meetsAllPrerequisites(selectedRecord);

            // Check de XP limiet
            if ((totalXP + selectedRecord.xp) <= 15 | selectedRecord.xp === 0) {
                const cannotBeAdded = tableData.some((record) => record.skill === selectedSkill.value);

                // exit early
                if (cannotBeAdded) {
                    setModalMsg("Dit item is al geselecteerd. \nToevoegen is niet toegestaan.\n");
                    setShowModal(true);
                }
                else if (!hasRequiredSkills) { setShowModal(true); }
                else {
                    setTableData((prevData) => [...prevData, selectedRecord]);
                    setSelectedSkill('');
                }
            }
            else {
                if (!hasRequiredSkills) {
                    // function heeft de modal msg al gezet.
                }
                else if (totalXP < 15) {
                    setModalMsg("Maximum xp (15) zal worden overschreden. \nDeze skill kost: " + selectedRecord.xp + ". \nToevoegen is niet toegestaan.\n");
                }
                else if (totalXP === 15) {
                    setModalMsg("Maximum XP (15) bereikt. \nToevoegen is niet toegestaan.\n");
                }
                else {
                    console.warn("There should be a reason, but no reason was set.")
                    setModalMsg("Er ging iets fout...");
                }
                setShowModal(true);
            }
        }
    };

    // Verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        // check of het een vereiste is
        const isPrerequiriste = isSkillAPrerequisiteToAnotherSkill(row.skill);
        if (isPrerequiriste) { setShowModal(true); }
        else {
            // Item weghalen uit grid
            setTableData((prevData) => prevData.filter((item) => item.skill !== row.skill));
        }
    };

    function handleAdd(row) {
        if (totalXP < 15) {
            // Source data
            const sourceRecord = sourceVaardigheden.find((record) => record.skill === row.skill);
            const currentRecord = tableData.find((record) => record.skill === row.skill);

            if (currentRecord.count < sourceRecord.maxcount) {
                // Updated Table Data here skill matches and record has multi_purchase === true
                const updatedTableData = tableData.map((record) => record.skill === row.skill
                    ? { ...record, count: record.count + 1, xp: sourceRecord.xp * (record.count + 1) }
                    : record
                );
                setTableData(updatedTableData);
            }
            else {
                // Inbouwen extra zekerheid dat items niet twee keer in het grid komen.
                setModalMsg("Maximum bereikt. \nToevoegen is niet toegestaan.\n");
                setShowModal(true);
            }
        }
        else {
            setModalMsg("Maximum XP (15) bereikt. \nToevoegen is niet toegestaan.\n");
            setShowModal(true);
        }
    };

    function handleSubtract(row) {
        // Source data
        const sourceRecord = sourceVaardigheden.find((record) => record.skill === row.skill);
        const isPresent = tableData.some((record) => record.skill === row.skill);
        const currentRecord = tableData.find((record) => record.skill === row.skill);

        // exit early
        if (isPresent) {
            if (currentRecord.count <= 1) {
                handleDelete(row);
            }
            // bestaande item aanpassen
            else {
                const updatedTableData = tableData.map((record) => record.skill === row.skill && record.multi_purchase === true
                    ? { ...record, count: record.count - 1, xp: sourceRecord.xp * (record.count - 1) }
                    : record
                );
                setTableData(updatedTableData);
            }
        }
    };

    // Plaats Acties in de kolom op basis van de multipurchase property
    function requestActions(row) {
        const currentItem = sourceVaardigheden.find((record) => record.id === row.original.id);
        if (currentItem.multi_purchase) {
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
                    <div className="select-container">
                        <Select
                            className="form-select"
                            options={skillOptions}
                            value={selectedSkill}
                            onChange={(selectedOption) => setSelectedSkill(selectedOption)}
                            placeholder="Selecteer een vaardigheid"
                            isClearable
                            isSearchable
                        />
                        <button className="btn-primary" onClick={handleAddToTable}>
                            Toevoegen
                        </button>
                    </div>

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
                <div>2023 v1</div>
                <div>Design by Deprecated Dodo{'\u2122'}</div>
                <div className="disclaimer" onClick={showDisclaimer}>Disclaimer</div>
            </footer>
        </div>
    );
}

export default App;


