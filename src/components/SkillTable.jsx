import { useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTable, useSortBy } from 'react-table';
import { v4 as uuidv4 } from 'uuid';

// shared
import { useSharedState } from '../SharedStateContext.jsx';
import {
    getSkillById,
    isSkillAPrerequisiteToAnotherSkill,
    updateGridEigenschappenTiles,
    updateGridSpreukenTiles,
    updateGridReceptenTiles,
} from '../SharedActions.js';

import {
    totalXP,
    setTotalXP,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
    resetTotalXP,
    regeneratedBasisVaardigheden,
    regeneratedExtraVaardigheden,
    defaultProperties,
} from '../SharedObjects.js';

import { saveCharacterToStorage } from '../SharedStorage.js';

// Components
import { InfoTooltip } from './Tooltip.jsx';
import LoreSheet from './LoreSheet.jsx';


// SkillTabel Kolommen
const columns = [
    { Header: "ID", accessor: "id", id: "table-id", className: "col-id" },
    { Header: "Vaardigheid", accessor: "skill", id: "table-skill", className: "col-vaardigheid" },
    { Header: "XP Kosten", accessor: "xp", id: "table-xp", className: "col-xp" },
    { Header: "Loresheet", accessor: "loresheet", id: "table-loresheet", className: "col-loresheet", Cell: (table) => { return <LoreSheet pdf={table?.cell?.value?.pdf}></LoreSheet> } },
    { Header: "Aantal keer", accessor: "count", id: "table-count", className: "col-aantalkeer" },
    { Header: "Info", id: "table-info", className: "col-info", Cell: (table) => { return <InfoTooltip row={table.cell.row}></InfoTooltip> } }
];

export default function SkillTable() {
    // SharedStateContext
    const {
        tableData, setTableData,
        isChecked, setIsChecked,
        MAX_XP, setMAX_XP,
        charName, setCharName,
        setSelectedBasicSkill,
        setSelectedExtraSkill,

        setShowModal,
        setModalMsg,

        setGridEigenschappen,
        setGridEnergiePerDag,
        setGridSpreuken,
        setGridRecepten
    } = useSharedState();

    /// --- TABLE CONTENT --- ///
    function getTableDataSums() {
        if (tableData.length > 0) {
            setTotalXP(tableData.reduce((accumulator, skill) => accumulator + skill.xp, 0));
            return (
                <tr key={uuidv4()}>
                    <td />
                    <td>Aantal vaardigheden: {tableData.length} </td>
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
        else {
            setTotalXP(0);
            return null;
        }
    }

    // Wissen van tabel + naam
    function clearCharacterBuild() {
        setTableData([]);
        setCharName("");
        setMAX_XP(15);
        setIsChecked(true);
        setSelectedBasicSkill(null);
        setSelectedExtraSkill(null);
    }

    // Verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.id, true, tableData, setModalMsg);
        if (isPrerequisite) { setShowModal(true); }
        else { // Item weghalen uit grid
            setTableData((prevData) =>
                prevData.filter((item) => item.id !== row.id));
        }
    }

    // Aanvullende aankopen van reeds bestaande vaardigheid
    function handleAdd(row) {
        if (totalXP < Math.floor(MAX_XP)) {
            // Source data
            let sourceRecord = sourceBasisVaardigheden.find((record) => record.id === row.id);
            if (!sourceRecord) { sourceRecord = sourceExtraVaardigheden.find((record) => record.id === row.id); }
            const currentRecord = tableData.find((record) => record.id === row.id);

            if (currentRecord.count < sourceRecord.maxcount) {
                const updatedTableData = tableData.map((record) => record.id === row.id
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
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.id, false, tableData, setModalMsg);
        if (isPrerequisite) { setShowModal(true); }
        else {
            const currentSkill = tableData.find(currentSkill => currentSkill.id === row.id);
            if (currentSkill.count === 1) {
                setTableData((prevData) =>
                    prevData.filter((item) => item.id !== row.id)); // Item weghalen uit grid
            }
            else {
                const updatedTableData = tableData.map((record) => record.id === row.id &&
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
        const currentItem = getSkillById(row.original.id);
        if (currentItem && currentItem.multi_purchase === true) {
            return (
                <div className="acties">
                    <div className="acties-overige">
                        <img
                            className="btn-image"
                            title="Toevoegen"
                            onClick={() => handleAdd(currentItem)}
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
                    <div className="acties-overige">
                        <img
                            className="btn-image"
                            title={currentItem.skill + " verwijderen"}
                            onClick={() => handleDelete(currentItem)}
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

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data: tableData,
            initialState: [],
            autoResetSortBy: false
        },
        useSortBy
    );

    const determineSortinSymbol = (column) => {
        if (column.isSorted) {
            return column.isSortedDesc ? ' \u25B2' : ' \u25BC';
        }
    }

    // Wanneer er iets aan de tableData verandert, wordt de nieuwe data opgeslagen.
    // Op basis van de nieuwe tableData worden de Selects, Grid en Spreuken/Recepten bijewerkt.
    const onUpdateTableData = useCallback(() => {
        // LocalStorage bijwerken
        saveCharacterToStorage('CCdata', charName, isChecked, MAX_XP, tableData);

        // SELECT skill options bijwerken | reeds geselecteerde items worden uitgesloten.
        // INPUT resterende XP bijwerken
        regeneratedBasisVaardigheden(tableData);
        regeneratedExtraVaardigheden(tableData);
        resetTotalXP(tableData);

        // karakter eigenschappen container
        const updatedAllGridContent = updateGridEigenschappenTiles(tableData, defaultProperties)
        const updatedGridEigenschappenContent = updatedAllGridContent.filter((property) => {
            return property.name === 'hitpoints'
                || property.name === 'armourpoints'
                || (property.value !== 0 && property.name.includes('glyph'))
                || (property.value !== 0 && property.name.includes('rune'))
        });

        const updatedGridEnergiePerDag = updatedAllGridContent.filter((property) => {
            return (property.value !== 0 && property.name === 'willpower')
                || (property.value !== 0 && property.name === 'inspiration')
                || (property.value !== 0 && property.name.includes('elemental'))
                || (property.value !== 0 && property.name.includes('spiritual'))
        });

        setGridEigenschappen(updatedGridEigenschappenContent);
        setGridEnergiePerDag(updatedGridEnergiePerDag)

        // spreuken & techieken container
        const updatedGridSpreukenContent = updateGridSpreukenTiles(tableData).filter((property) => {
            return property.value !== ""
        });
        setGridSpreuken(updatedGridSpreukenContent);

        // recepten container
        const updatedGridReceptenContent = updateGridReceptenTiles(tableData).filter((property) => {
            return property.value !== ""
        });
        setGridRecepten(updatedGridReceptenContent);
    }, [charName, isChecked, MAX_XP, tableData, setGridEigenschappen, setGridEnergiePerDag, setGridSpreuken, setGridRecepten]);

    // Wanneer tableData aangepast wordt, aanpassingen doorvoeren.
    useEffect(() => {
        onUpdateTableData();
    }, [tableData, onUpdateTableData]);


    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <table {...getTableProps()} className="App-table" id="App-table">
                <thead>
                    {headerGroups.map((headerGroup) => {
                        const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                        return (
                            <tr key={uuidv4()} {...headerGroupProps}>
                                {headerGroup.headers.map((column) => {
                                    const { key: columnKey, ...headerProps } = column.getHeaderProps(column.getSortByToggleProps());
                                    return (
                                        <th
                                            key={uuidv4()}
                                            {...headerProps}
                                            className={column.className}
                                        >
                                            {column.render('Header')}
                                            <span>{determineSortinSymbol(column)}</span>
                                        </th>
                                    );
                                })}
                                <th key={uuidv4()} className="col-acties">Acties</th>
                            </tr>
                        );
                    })}
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
                                        key={row.id}
                                        draggableId={row.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <tr
                                                key={row.id}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                {row.cells.map((cell) => (
                                                    <td key={uuidv4()}>{cell.render('Cell')}</td>
                                                ))}
                                                <td>{requestActions(row)}</td>
                                            </tr>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {getTableDataSums()}
                            {provided.placeholder}
                        </tbody>
                    )}
                </Droppable>
            </table>
        </DragDropContext>
    );
}
