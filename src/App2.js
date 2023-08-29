import React, { useState } from 'react';
import { useTable } from 'react-table';
import './App.css';

const data = [
    { id: 1, skill: 'Eenhandig wapens', xp: 25, loresheet: false },
    { id: 2, skill: 'Stafwapens', xp: 30, loresheet: false },
    { id: 3, skill: 'Kruiden zoeken', xp: 28, loresheet: true },
];

const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Vaardigheid', accessor: 'skill' },
    { Header: 'XP Kosten', accessor: 'xp' },
    { Header: 'Loresheet', accessor: 'loresheet', Cell: ({ value }) => (value ? 'Ja' : ''), },
];

function App() {
    const [tableData, setTableData] = useState(data);

    const handleDelete = (row) => {
        setTableData((prevData) => prevData.filter((item) => item.id !== row.original.id));
    };

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data: tableData,
    });

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
            </main>
            <footer></footer>
        </div>
    );
}

export default App;
