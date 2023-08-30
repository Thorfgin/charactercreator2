import React, { useState } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import data from './json/basisvaardigheden.json';
import './App.css';

const sourceData = data["Vaardigheden"];
const emptyData = [];

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

    // ReactToolTip related
    let skillOptions = sourceData.map((record) => ({
        value: record.skill,
        label: record.skill
    }));

    // karakter eigenschappen container
    const [gridContent, setGridContent] = useState([
        { image: 'image1.jpg', text: 'HP', value: 1 },
        { image: 'image2.jpg', text: 'Max AP', value: 0 },
        { image: 'image3.jpg', text: 'Elementaire Mana', value: 0 },
        { image: 'image4.jpg', text: 'Rituele Elementaire Mana', value: 0 },
    ]);

    // nieuwe eigenschap toevoegen aan de container
    const addGridItem = (setImage, setText, setValue) => {
        const newItem = { image: setImage, text: setText, value: setValue, };
        setGridContent([...gridContent, newItem]);
    };

    const handleAddToTable = () => {
        if (selectedSkill !== null) {
            const selectedRecord = sourceData.find((record) => record.skill === selectedSkill.value);

            // if the skill actually exists
            if (selectedRecord) {
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
        }
    };

    const handleDelete = (row) => { setTableData((prevData) => prevData.filter((item) => item.skill !== row.skill)); };

    const handleAdd = (row) => {
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

    const handleSubtract = (row) => {
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

    return (
        <div className="App">
            <header className="App-header">
                <h1>Character Creator</h1>
            </header>
            <main>
                <div className="side-container">
                    <div className="summary-title">
                        <h4>Spreuken & Techieken</h4>
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
                        <h4>Character eigenschappen</h4>
                    </div>
                    <div className="grid-character-eigenschappen">
                        {gridContent.map((item, index) => (
                            <GridItem
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
