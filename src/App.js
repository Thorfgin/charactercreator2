import React, { useState } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import data from './json/basisvaardigheden.json';
import './App.css';

const sourceData = data["Vaardigheden"];
const sourceProperties = [
    { name: 'hitpoints', image: 'image_hp.jpg', text: 'HP', value: 1 },
    { name: 'armourpoints', image: 'image_ap.jpg', text: 'Max AP', value: 0 },
    { name: 'elemental_mana', image: 'image_em.jpg', text: 'Elementaire Mana', value: 0 },
    { name: 'elemental_ritual_mana', image: 'image_erm.jpg', text: 'Rituele Elementaire Mana', value: 0 },
    { name: "spiritual_mana", image: 'image_sm.jpg', text: 'Spirituele Mana', value: 0 },
    { name: "spiritual_ritual_mana", image: 'image_srm.jpg', text: 'Rituele Spirituele Mana', value: 0 },
    { name: "inspiration", image: 'image_ins.jpg', text: 'Inspiratie', value: 0 },
    { name: "willpower", image: 'image_wil.jpg', text: 'Wilskracht', value: 0 },
    { name: "glyph_cap", image: 'image_glp.jpg', text: 'Glyph cap', value: 0 },
    { name: "glyph_imbue_cap", image: 'image_glp_imb.jpg', text: 'Glyph Imbue cap', value: 0 },
    { name: "rune_cap", image: 'image_run.jpg', text: 'Rune cap', value: 0 },
    { name: "rune_imbue_cap", image: 'image_run_imb_.jpg', text: 'Rune Imbue cap', value: 0 }
]

const gridData = [sourceProperties[0], sourceProperties[1]];
const emptyData = [];

// Tabel Vaardigheden
const columns = [
    { Header: 'ID', accessor: 'id', className: "col-id" },
    { Header: 'Vaardigheid', accessor: 'skill', className: "col-vaardigheid" },
    { Header: 'XP Kosten', accessor: 'xp', className: "col-xp" },
    { Header: 'Loresheet', accessor: 'loresheet', className: "col-loresheet", Cell: ({ value }) => (value ? 'Ja' : ''), },
    { Header: 'Aantal keer', accessor: 'count', className: "col-aantalkeer" },
];

// Karakter eigenschappen grid
function GridItem({ image, text, value }) {
    return (
        <div className="grid-item">
            <div className="grid-image" style={{ backgroundImage: `url(${image})` }} />
            <div className="grid-text">{text}: {value}</div>
        </div>
    );
}

function App() {
    const [tableData, setTableData] = useState(emptyData);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMsg, setModalMsg] = useState("")
    const [gridContent, setGridContent] = useState(gridData);

    // SELECT related
    let skillOptions = sourceData.map((record) => ({
        value: record.skill,
        label: record.skill
    }));

    /// --- GRID CONTENT --- ///
    // karakter eigenschappen container
    function gridItemExists(itemName) {
        return gridContent.some(item => item.name === itemName);
    }

    // Een \eigenschap toevoegen aan/bijwerken in de Grid container
    function addGridItem(setName, setImage, setText, setValue) {
        const newItem = { name: setName, image: setImage, text: setText, value: setValue };
        if (!gridItemExists(newItem.name)) { setGridContent(prevGridContent => [...prevGridContent, newItem]); }
        else { updateGridItemValue(newItem.name, true, newItem.value) }
    };

    // Een bestaande eigenschap waarde verlagen
    function subtractGridItem(name, value) {
        if (gridItemExists(name)) { updateGridItemValue(name, false, value) }
    };

    // Een value van een eigenschap aanpassen
    function updateGridItemValue(itemName, shouldAdd, valueToAdd) {
        // Add
        if (shouldAdd) {
            setGridContent(prevGridContent => prevGridContent.map(item =>
                item.name === itemName ? { ...item, value: item.value + valueToAdd } : item));
        }
        // Subtract
        else {
            setGridContent(prevGridContent => prevGridContent.map(item =>
                item.name === itemName ? { ...item, value: item.value - valueToAdd } : item));
            // Remove if <= zero
            const gridItem = gridContent.find((griditem) => griditem.name === itemName);
            if (gridItem && gridItem.value <= 0) {
                removeGridItem(itemName);
            }
        }
    }

    // Werk de eigenschappen bij op basis van de toegevoegde vaardigheid
    function updateProperties(properties, ) {
        for (let i = 0; i < properties.length; i++) {
            const sourceProperty = sourceProperties.find((skill) => skill.name === properties[i].name);
            // alleen toevoegen aan bestaande eigenschappen, met positieve waarde
            if (properties[i].value > 0) {
                addGridItem(
                    sourceProperty.name,
                    sourceProperty.image,
                    sourceProperty.text,
                    sourceProperty.value + properties[i].value);
            } // else if 0 skip
        };
    }

    // Een bestaande eigenschap verwijderen uit de Grid container
    function removeGridItem(itemName) {
        if (itemName !== sourceProperties[0].name && itemName !== sourceProperties[1].name) {
            setGridContent(prevGridContent => prevGridContent.filter(item => item.name !== itemName));
        }
    }

    /// --- TABLE CONTENT --- ///
    function handleAddToTable() {
        if (selectedSkill !== null) {
            const selectedRecord = sourceData.find((record) => record.skill === selectedSkill.value);
            const cannotBeAdded = tableData.some((record) => record.skill === selectedSkill.value);

            // exit early
            if (cannotBeAdded) {
                setModalMsg("Dit item is al geselecteerd en kan niet vaker aangekocht worden.");
                setShowModal(true);
            }
            else {
                // Toevoegen aan Character eigenschappen
                if (selectedRecord !== null && selectedRecord.hasOwnProperty('Eigenschappen')) {
                    updateProperties(selectedRecord['Eigenschappen']);
                }
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

            // Toevoegen aan Character eigenschappen
            if (sourceRecord !== null && sourceRecord.hasOwnProperty('Eigenschappen')) {
                updateProperties(sourceRecord['Eigenschappen']);
            }
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
                subtractGridItem()
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
                        src="button_add.png"
                        alt="Add">

                    </img>
                    <img
                        className="row-image"
                        onClick={() => handleSubtract(currentItem)}
                        src="button_subtract.png"
                        alt="Subtract">
                    </img>
                    <img
                        className="row-image"
                        onClick={() => handleDelete(currentItem)}
                        src="button_remove.png"
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
                    src="button_remove.png"
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
                    <div className="grid-character-eigenschappen">
                        {gridContent.map((item, index) => (
                            <GridItem
                                name={item.name}
                                className="grid-item"
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
