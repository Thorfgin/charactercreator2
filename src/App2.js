import React, { useState } from 'react';
import { useTable } from 'react-table';
import './App.css';

const sourceData = [
    { id: 1, skill: 'Eenhandig wapens', xp: 25, loresheet: false, multi_purchase: false, count: 1 },
    { id: 2, skill: 'Stafwapens', xp: 30, loresheet: false, multi_purchase: false, count: 1 },
    { id: 3, skill: 'Kruiden zoeken', xp: 28, loresheet: true, multi_purchase: false, count: 1 },
    { id: 4, skill: 'Spiritueel ritualist', xp: 1, loresheet: false, multi_purchase: true, count: 1 },
];

const emptyData = []

const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Vaardigheid', accessor: 'skill' },
    { Header: 'XP Kosten', accessor: 'xp' },
    { Header: 'Loresheet', accessor: 'loresheet', Cell: ({ value }) => (value ? 'Ja' : ''), },
    { Header: 'Aantal keer', accessor: 'count' },
];

function App() {
    const [tableData, setTableData] = useState(emptyData);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleAddToTable = () => {
        const selectedRecord = sourceData.find((record) => record.skill === selectedSkill);

        // if the skill actually exists
        if (selectedRecord) {
            const cannotBeAdded = tableData.some((record) => record.skill === selectedSkill);

            // exit early
            if (cannotBeAdded) { setShowModal(true); }
            else {
                setTableData((prevData) => [...prevData, selectedRecord]);
                setSelectedSkill('');
            }
        }
    };

    const handleDelete = (row) => { setTableData((prevData) => prevData.filter((item) => item.skill !== row.skill)); };

    const handleAdd = (row) => {
        // Source data
        const sourceRecord = sourceData.find((record) => record.skill === row.skill);

        // Updated Table Data here skill matches and record has multi_purchase === true
        const updatedTableData = tableData.map((record) => record.skill === row.skill
            ? { ...record, count: record.count + 1, xp: sourceRecord.xp * record.count + 1 }
            : record
        );
        setTableData(updatedTableData);
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
                    ? { ...record, count: record.count - 1, xp: sourceRecord.xp * record.count - 1 }
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
                <div className="select-container">
                    <select
                        className="form-select"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                        <option value="">Selecteer een vaardigheid</option>
                        {sourceData.map((record) => (
                            <option key={record.id} value={record.skill}>
                                {record.skill}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={handleAddToTable}>
                        Toevoegen
                    </button>
                </div>

                <table {...getTableProps()} className="App-table">
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                                <th>Acties</th>
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
                            <p>Dit item is al geselecteerd en kan niet vaker aangekocht worden.</p>
                            <button className="btn btn-primary" onClick={closeModal}>
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <footer></footer>
        </div>
    );
}

export default App;
