/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import data from './json/basisvaardigheden.json';
import './App.css';

const sourceData = data["Vaardigheden"];

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

// Karakter eigenschappen griditem
function GridEigenschapItem({ image, text, value }) {
    return (
        <div className="grid-eigenschap-item">
            <div className="grid-eigenschap-image" style={{ backgroundImage: `url(${image})` }} />
            <div className="grid-eigenschap-text">{text}: {value}</div>
        </div>
    );
}

// Karakter eigenschappen griditem
function GridSpreukItem({ text }) {
    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  "+text}</div>
            <img
                className="grid-spreuk-image"
                src="./images/img-info.png"
                alt="Info">
            </img>
        </div>
    );
}

// Op basis van de Eigenschappen, voeg nieuwe tegels toe.
function updateGridEigenschappenTiles(tableData) {
    const propertySums = defaultProperties.map((property) => (
        {
            ...property, value: tableData.reduce((sum, record) => {
                console.log(sum, record);
                const vaardigheid = sourceData.find((vaardigheid) => vaardigheid.skill === record.skill);
                const propertyValue = vaardigheid.Eigenschappen?.find((prop) => prop.name === property.name)?.value || 0;
                return sum + propertyValue * record.count;
            }, property.name === "hitpoints" ? 1 : 0)
        }));
    return propertySums;
}

// Op basis van de Spreuken, voeg nieuwe tegels toe.
function updateGridSpreukenTiles(tableData) {
    const spellProperties = tableData.reduce((spellsAccumulator, record) => {
        const vaardigheid = sourceData.find((vaardigheid) => vaardigheid.skill === record.skill);
        const spells = vaardigheid.Spreuken || [];

        spells.forEach((spell) => {
            const existingSpell = spellsAccumulator.find((existing) => existing.name === spell.name);
            if (existingSpell) {
                existingSpell.count += spell.count;
            } else {
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
        const vaardigheid = sourceData.find((vaardigheid) => vaardigheid.skill === record.skill);
        const recepten = vaardigheid.Recepten || [];

        recepten.forEach((recipy) => {
            const existingRecipy = recipyAccumulator.find((existing) => existing.name === recipy.name);
            if (existingRecipy) {
                existingRecipy.count += recipy.count;
            } else {
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

    // SELECT related
    let skillOptions = sourceData.map((record) => ({
        value: record.skill,
        label: record.skill
    }));

    /// --- GRID CONTENT --- ///
    function onUpdateTableData() {
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

        // spreuken & techieken container
        const updatedGridReceptenContent = updateGridReceptenTiles(tableData).filter((property) => {
            return property.value !== ""
        });
        setGridRecepten(updatedGridReceptenContent);
    };

    /// --- TABLE CONTENT --- ///
    const handleAddToTable = () => {
        if (selectedSkill) {
            const cannotBeAdded = tableData.some((record) => record.skill === selectedSkill.value);

            // exit early
            if (cannotBeAdded) {
                setModalMsg("Dit item is al geselecteerd en kan niet vaker aangekocht worden.");
                setShowModal(true);
            }
            else {
                const selectedRecord = sourceData.find((record) => record.skill === selectedSkill.value);
                setTableData((prevData) => [...prevData, selectedRecord]);
                setSelectedSkill('');
            }
        }
    };

    // verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        setTableData((prevData) => prevData.filter((item) => item.skill !== row.skill));
    };

    function handleAdd(row) {
        // Source data
        const sourceRecord = sourceData.find((record) => record.skill === row.skill);
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
            setModalMsg("Maximum bereikt, dit item mag niet vaker aangekocht worden.");
            setShowModal(true);
        }
    };

    function handleSubtract(row) {
        // Source data
        const sourceRecord = sourceData.find((record) => record.skill === row.skill);
        const isPresent = tableData.some((record) => record.skill === row.skill);
        const currentRecord = tableData.find((record) => record.skill === row.skill);

        // exit early
        if (isPresent) {
            if (currentRecord.count <= 1) {
                handleDelete(row);
            }
            // modify the existing item
            else {
                const updatedTableData = tableData.map((record) => record.skill === row.skill && record.multi_purchase === true
                    ? { ...record, count: record.count - 1, xp: sourceRecord.xp * (record.count - 1) }
                    : record
                );
                setTableData(updatedTableData);
            }
        }
    };

    const requestActions = (row) => {
        const currentItem = sourceData.find((record) => record.id === row.original.id);
        if (currentItem.multi_purchase) {
            return (
                <div className="image-cell">
                    <img
                        className="row-image"
                        onClick={() => handleAdd(currentItem)}
                        src="./images/button_add.png"
                        alt="Add">

                    </img>
                    <img
                        className="row-image"
                        onClick={() => handleSubtract(currentItem)}
                        src="./images/button_subtract.png"
                        alt="Subtract">
                    </img>
                    <img
                        className="row-image"
                        onClick={() => handleDelete(currentItem)}
                        src="./images/button_remove.png"
                        alt="Remove">
                    </img>
                </div>
            );
        }
        return (
            <div className="image-cell">
                <img
                    className="row-image"
                    onClick={() => handleDelete(currentItem)}
                    src="./images/button_remove.png"
                    alt="Remove">
                </img>
            </div>
        )

    };

    const closeModal = () => { setShowModal(false); };
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: tableData, });

    /// --- HTML CONTENT --- ///
    return (
        <div className="App">
            <header className="App-header">
                <h2>Character Creator</h2>
            </header>
            <main>
                <div className="side-container">
                    <div className="summary-title">
                        <h5>Spreuken & Techieken</h5>
                    </div>
                    <div className="grid-spreuken">
                        {gridSpreuken.map((item, index) => (
                            <GridSpreukItem
                                name={item.name}
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
                            <GridSpreukItem
                                name={item.name}
                                key={index}
                                text={item.name}
                            />
                        ))}
                    </div>
                </div>
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
                        </tbody>
                    </table>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <p>{modalMsg}</p>
                                <button className="btn-primary" onClick={closeModal}>
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="side-container">
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
            </main>
            <footer></footer>
        </div>
    );
}

export default App;
