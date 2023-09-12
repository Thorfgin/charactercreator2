/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import vaardigheden from './json/basisvaardigheden.json';
import spreuken from './json/spreuken.json';
import recepten from './json/recepten.json';
import './App.css';

let totalXP = 0; // Berekende totaal waarde

// Ophalen van de skills uit vaardigheden/spreuken/recepten
const sourceVaardigheden = vaardigheden.Vaardigheden;
let skillOptions = sourceVaardigheden.map((record) => ({ value: record.skill, label: record.skill }));

const sourceSpreuken = [].concat(...spreuken.Categories.map(category => category.Skills));
const sourceRecepten = [].concat(...recepten.Categories.map(category => category.Skills));

const defaultProperties = [
    { name: 'hitpoints', image: 'images/image_hp.jpg', text: 'HP', value: 1 },
    { name: 'armourpoints', image: 'images/image_ap.jpg', text: 'Max AP', value: 0 },
    { name: 'elemental_mana', image: 'images/image_em.jpg', text: 'Elementaire Mana', value: 0 },
    { name: 'elemental_ritual_mana', image: 'images/image_erm.jpg', text: 'Rituele Elementaire Mana', value: 0 },
    { name: "spiritual_mana", image: 'images/image_sm.jpg', text: 'Spirituele Mana', value: 0 },
    { name: "spiritual_ritual_mana", image: 'images/image_srm.jpg', text: 'Rituele Spirituele Mana', value: 0 },
    { name: "inspiration", image: 'images/image_ins.jpg', text: 'Inspiratie', value: 0 },
    { name: "willpower", image: 'images/image_wil.jpg', text: 'Wilskracht', value: 0 },
    { name: "glyph_craft_cap", image: 'images/image_glp.jpg', text: 'Glyph cap', value: 0 },
    { name: "glyph_imbue_cap", image: 'images/image_glp_imb.jpg', text: 'Glyph Imbue cap', value: 0 },
    { name: "rune_craft_cap", image: 'images/image_run.jpg', text: 'Rune cap', value: 0 },
    { name: "rune_imbue_cap", image: 'images/image_run_imb_.jpg', text: 'Rune Imbue cap', value: 0 }
]

const gridData = [defaultProperties[0], defaultProperties[1]];
const emptyData = [];

// Tabel Vaardigheden
const columns = [
    { Header: 'ID', accessor: 'id', className: "col-id" },
    { Header: 'Vaardigheid', accessor: 'skill', className: "col-vaardigheid" },
    { Header: 'XP Kosten', accessor: 'xp', className: "col-xp" },
    { Header: 'Loresheet', accessor: 'loresheet', className: "col-loresheet", Cell: ({ value }) => (value ? 'Ja' : ''), },
    { Header: 'Aantal keer', accessor: 'count', className: "col-aantalkeer" },
];


// Tooltip component voor GridItems
function Tooltip({ skillName, itemName, isSpell, isRecipy, isSkill }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const handleMouseOver = () => setShowTooltip(true);
    const handleMouseOut = () => setShowTooltip(false);
    const closeTooltip = () => setShowTooltip(false);

    // ophalen Skill & Spreuk of Recept data uit bronbestand
    let sourceSkill = sourceVaardigheden.find((item) => item.skill === skillName);
    let data = getData(isSpell, sourceSkill, itemName, isRecipy, isSkill, skillName);

    return (
        <div className="tooltip-container" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <img
                className="btn-image"
                src="./images/img-info.png"
                alt="info"
            />
            {showTooltip && (
                <div className="tooltip-overlay">
                    <div className="tooltip" onClick={closeTooltip}>
                        <h5>Vaardigheid: {skillName}</h5>
                        {isSpell ? <h5>Spreuk/Techniek: {itemName}</h5> : isRecipy ? <h5>Recept: {itemName}</h5> : null}
                        <table className="tooltip-table">
                            <tbody>
                                {getMappingFromData(data, isSkill, isSpell, isRecipy)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Data ophalen uit basisvaardigheden, spreuken of recepten
function getData(isSpell, sourceSkill, itemName, isRecipy, isSkill, skillName) {
    let data = {};

    // Data kiezen voor spreuk, recept of vaardigheid
    // Tooltip spreuk
    if (isSpell === true) {
        const skillFound = sourceSpreuken.find((item) =>
            item.skill.toLowerCase() === sourceSkill.skill.toLowerCase() ||
            item.skill.toLowerCase() === sourceSkill.alt_skill.toLowerCase());

        data = skillFound.Spells.find((item) => item.spell.toLowerCase() === itemName.toLowerCase());
        data = data !== {} ? data : {
            name: itemName ? itemName : '',
            description: 'Spreuk/Techniek informatie kon niet gevonden worden.'
        };
    }

    // Tooltip recept
    else if (isRecipy === true) {
        const skillFound = sourceRecepten.find((item) =>
            item.skill.toLowerCase() === sourceSkill.skill.toLowerCase() ||
            item.skill.toLowerCase() === sourceSkill.alt_skill.toLowerCase());

        data = skillFound.Recipies.find((item) => item.recipy.toLowerCase() === itemName.toLowerCase());
        data = data !== {} ? data : {
            recipy: itemName ? itemName : '', 
            effect: 'Recept informatie kon niet gevonden worden.'
        };
    }

    // Tooltip vaardigheid
    else if (isSkill === true) {
        let requirements = "";
        if (sourceSkill.Requirements.skill.length > 0) { sourceSkill.Requirements.skill.join(", "); }
        if (sourceSkill.Requirements.any_list.length > 0) {
            requirements += ", een van de " + sourceSkill.Requirements.any_list.join(", een van de ");
        }

        data = [
            { label: 'xp', value: sourceSkill.xp },
            { label: 'requirements', value: requirements },
            { label: 'description', value: sourceSkill.description }
        ].map((item) => (data[item.label] = item.value));

        data = data !== {} ? data : { description: 'Vaardigheid informatie kon niet gevonden worden.' };
    }
    else {
        console.warn("This item should have been found: ", skillName, "isSpell: ", isSpell, "isSkill: ", isSkill, "Data: ", sourceSkill);
    }
    return data;
}

// Data verwerken tot een Tooltip definitie voor basisvaardigheid, spreuk of recept
function getMappingFromData(data, isSkill, isSpell, isRecipy) {
    if (!data) { return; }

    if (isSkill === true) {
        return [
            { label: 'XP kosten', value: data.xp },
            { label: 'Vereisten', value: data.requirements },
            { label: 'Omschrijving', value: data.description },
        ].map((item, index) => (
            <tr key={index}>
                <td className="tooltip-property">{item.label}:</td>
                <td className="tooltip-value">{item.value}</td>
            </tr>
        ))
    }
    else if (isSpell === true) {
        return [
            { label: 'Mana kosten', value: data.mana_cost },
            { label: 'Incantatie', value: data.incantation },
            { label: 'Omschrijving', value: data.description },
            { label: 'Effect', value: data.spell_effect },
            { label: 'Duur', value: data.spell_duration },
        ].map((item, index) => (
            <tr key={index}>
                <td className="tooltip-property">{item.label}:</td>
                <td className="tooltip-value">{item.value}</td>
            </tr>
        ))
    }
    else if (isRecipy === true) {
        return [
            { label: 'Omschrijving', value: data.effect },
            { label: 'Inspiratie kosten', value: data.inspiration },
            { label: 'Benodigdheden', value: data.components },
        ].map((item, index) => (
            <tr key={index}>
                <td className="tooltip-property">{item.label}:</td>
                <td className="tooltip-value">{item.value}</td>
            </tr>
        ))
    }
    else {
        console.warn("Expected either isSkill, isSpell or isRecipy to be true, but found none")
    }
}

// Karakter eigenschappen griditem
function GridEigenschapItem({ image, text, value }) {
    return (
        <div className="grid-eigenschap-item">
            <div className="grid-eigenschap-image" style={{ backgroundImage: `url(${image})` }} />
            <div className="grid-eigenschap-text">{text}: {value}</div>
        </div>
    );
}

// Generiek aanmaken van een tooltip knop op basis van type
function GenericTooltipItem({ skill, name, text, type }) {
    let img = <div></div>;

    // Toevoegen INFO MODAL >>  Spreuken
    if (type === "grid-spreuken") {
        img = (<Tooltip
            skillName={skill}
            itemName={name}
            isSpell={true}
            isRecipy={false}
            isSkill={false}
        />);
    }

    // Toevoegen INFO MODAL >> Recepten
    else if (type === "grid-recepten") {
        img = (<Tooltip
            skillName={skill}
            itemName={name}
            isSpell={false}
            isRecipy={true}
            isSkill={false}
        />);
    }

    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + text}</div>
            {img}
        </div>
    );
}

// Op basis van de Eigenschappen, voeg nieuwe tegels toe.
function updateGridEigenschappenTiles(tableData) {
    const propertySums = defaultProperties.map((property) => (
        {
            ...property, value: tableData.reduce((sum, record) => {
                const vaardigheid = sourceVaardigheden.find((vaardigheid) => vaardigheid.skill === record.skill);
                const propertyValue = vaardigheid.Eigenschappen?.find((prop) => prop.name === property.name)?.value || 0;
                return sum + propertyValue * record.count;
            }, property.name === "hitpoints" ? 1 : 0)
        }));
    return propertySums;
}

// Op basis van de Spreuken, voeg nieuwe tegels toe.
function updateGridSpreukenTiles(tableData) {
    const spellProperties = tableData.reduce((spellsAccumulator, record) => {
        const vaardigheid = sourceVaardigheden.find((vaardigheid) => vaardigheid.skill === record.skill);
        const spells = vaardigheid.Spreuken || [];

        spells.forEach((spell) => {
            const existingSpell = spellsAccumulator.find((existing) => existing.name === spell.name);
            if (existingSpell) {
                existingSpell.count += spell.count;
            } else {
                spell.skill = vaardigheid.skill;
                spellsAccumulator.push({ ...spell });
            }
        });
        return spellsAccumulator;
    }, []);
    return spellProperties;
}

// Op basis van de Recepten, voeg nieuwe tegels toe.
function updateGridReceptenTiles(tableData) {
    const recipyProperties = tableData.reduce((recipyAccumulator, record) => {
        const vaardigheid = sourceVaardigheden.find((vaardigheid) => vaardigheid.skill === record.skill);
        const recepten = vaardigheid.Recepten || [];

        recepten?.forEach((recipy) => {
            const existingRecipy = recipyAccumulator.find((existing) => existing.name === recipy.name);
            if (existingRecipy) {
                existingRecipy.count += recipy.count;
            } else {
                recipy.skill = vaardigheid.skill;
                recipyAccumulator.push({ ...recipy });
            }
        });

        return recipyAccumulator;
    }, []);
    return recipyProperties;
}

/// --- MAIN APP --- ///
function App() {
    const [tableData, setTableData] = useState(emptyData);
    const [selectedSkill, setSelectedSkill] = useState('');
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
            const allOptions = sourceVaardigheden.map((record) => ({ value: record.skill, label: record.skill }));
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

    /// --- TABLE CONTENT --- ///
    const handleAddToTable = () => {
        if (selectedSkill) {
            const selectedRecord = sourceVaardigheden.find((record) => record.skill === selectedSkill.value);
            if (totalXP < 15 | selectedRecord.xp === 0) {
                const cannotBeAdded = tableData.some((record) => record.skill === selectedSkill.value);

                // exit early
                if (cannotBeAdded) {
                    setModalMsg("Dit item is al geselecteerd en kan niet vaker aangekocht worden.");
                    setShowModal(true);
                }
                else {
                    setTableData((prevData) => [...prevData, selectedRecord]);
                    setSelectedSkill('');
                }
            }
            else {
                setModalMsg("Maximum XP (15) bereikt. Dit item mag niet aangekocht worden.");
                setShowModal(true);
            }
        }
    };

    // Verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        setTableData((prevData) => prevData.filter((item) => item.skill !== row.skill));
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
                setModalMsg("Maximum bereikt, dit item mag niet vaker aangekocht worden.");
                setShowModal(true);
            }
        }
        else {
            setModalMsg("Maximum XP (15) bereikt. Dit item mag niet aangekocht worden.");
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
                            <h5>Spreuken & Techieken</h5>
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


