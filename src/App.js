import React, { useState } from 'react';
import { useTable } from 'react-table';
import './App.css';

const initialData = [
    { id: 1, skill: 'Eenhandig wapens', xp: 25, loresheet: false, multi_purchase: false },
    { id: 2, skill: 'Stafwapens', xp: 30, loresheet: false, multi_purchase: false },
    { id: 3, skill: 'Kruiden zoeken', xp: 28, loresheet: true, multi_purchase: false },
    { id: 4, skill: 'Spiritueel ritualist', xp: 1, loresheet: false, multi_purchase: true },
];

const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Vaardigheid', accessor: 'skill' },
    { Header: 'XP Kosten', accessor: 'xp' },
    { Header: 'Loresheet', accessor: 'loresheet', Cell: ({ value }) => (value ? 'Ja' : ''), },
];

function App() {
    const [tableData, setTableData] = useState(initialData);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleDelete = (row) => {
        setTableData((prevData) =>
            prevData.filter((item) => item.id !== row.original.id));
    };

    const handleAdd = () => {
        const selectedRecord = initialData.find((record) => record.skill === selectedSkill);

        // if it exists and is allowed to purchase multiple times
        if (selectedRecord) {
            const isAlreadyAdded = tableData.some((record) => record.skill === selectedSkill && record.multi_purchase === false);

            if (isAlreadyAdded) { setShowModal(true); }
            else {
                const nextId = Math.max(...tableData.map((record) => record.id)) + 1;
                const updatedRecord = { ...selectedRecord, id: nextId };
                setTableData((prevData) => [...prevData, updatedRecord]);
                setSelectedSkill('');
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: tableData, });

    return (
        <div className="App">
            <header className="App-header">
                <h1>React Table Demo</h1>
            </header>
            <main>
                <table {...getTableProps()} className="App-table">
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                                <th>Verwijder</th>
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
                                        <div className="image-cell">
                                            <img
                                                className="row-image"
                                                onClick={() => handleDelete(row)}
                                                src="button_close.png"
                                                alt="Close">
                                            </img>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="select-container">
                    <select
                        className="form-select"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                        <option value="">Selecteer een vaardigheid</option>
                        {initialData.map((record) => (
                            <option key={record.id} value={record.skill}>
                                {record.skill}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        Toevoegen
                    </button>
                </div>

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
