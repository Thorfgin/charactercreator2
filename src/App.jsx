import { useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

// Shared
import { useSharedState } from './SharedStateContext.jsx';
import {
    setLocalStorage,
    isSkillAPrerequisiteToAnotherSkill,
    updateGridEigenschappenTiles,
    updateGridSpreukenTiles,
    updateGridReceptenTiles,
} from './SharedActions.js';

import {
    totalXP,
    setTotalXP,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
    regeneratedBasisVaardigheden,
    regeneratedExtraVaardigheden,
    defaultProperties,
} from './SharedObjects.js';

// Components
import Toolbar from './components/Toolbar.jsx';

import {
    GridEigenschapItem,
    GenericTooltipItem,
} from './components/GridItem.jsx';

// --- 
import { InfoTooltip } from './tooltip.jsx';
import LoreSheet from './openloresheet.jsx';
import ModalMessage from './modalmessage.jsx'
import FAQModal from './faq.jsx'
import FileUploadModal from './fileupload.jsx'
import LoadCharacterModal from './loadcharacter.jsx'
import LoadPresetModal from './loadpreset.jsx'

// Tabel Vaardigheden
const columns = [
    { Header: "ID", accessor: "id", className: "col-id" },
    { Header: "Vaardigheid", accessor: "skill", className: "col-vaardigheid" },
    { Header: "XP Kosten", accessor: "xp", className: "col-xp" },
    { Header: "Loresheet", accessor: "loresheet", className: "col-loresheet", Cell: ({ value }) => (LoreSheet(value)), },
    { Header: "Aantal keer", accessor: "count", className: "col-aantalkeer" },
    { Header: "Info", className: "col-info", Cell: (table) => { return <InfoTooltip row={table.cell.row}></InfoTooltip> } }
];

/// --- MAIN APP --- ///
export default function App() {
    const {
        version,
        ruleset_version,
        creator,
        tableData, setTableData,
        isChecked, setIsChecked,
        MAX_XP, setMAX_XP,
        setCharName,
        showModal, setShowModal,
        showFAQModal, setShowFAQModal,
        showUploadModal, setShowUploadModal,
        showLoadCharacterModal, setShowLoadCharacterModal,
        showLoadPresetModal, setShowLoadPresetModal,
        modalMsg, setModalMsg,
        gridEigenschappen, setGridEigenschappen,
        gridSpreuken, setGridSpreuken,
        gridRecepten, setGridRecepten
    } = useSharedState();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { onUpdateTableData(); }, [tableData]);

    // Wanneer er iets aan de tableData verandert, wordt de nieuwe data opgeslagen.
    // Op basis van de nieuwe tableData worden de Selects, Grid en Spreuken/Recepten bijewerkt.
    function onUpdateTableData() {
        // LocalStorage bijwerken
        setLocalStorage('CCdata', [{
            ruleset_version: ruleset_version,
            isChecked: isChecked,
            MAX_XP: MAX_XP,
            data: tableData
        }]);

        // SELECT skill options bijwerken | reeds geselecteerde items worden uitgesloten.
        regeneratedBasisVaardigheden(tableData);
        regeneratedExtraVaardigheden(tableData);

        // karakter eigenschappen container
        const updatedGridEigenschappenContent = updateGridEigenschappenTiles(tableData, defaultProperties).filter((property) => {
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
    }

    /// --- TABLE CONTENT --- ///
    function getTableDataSums() {
        if (tableData.length > 0) {
            const totalXP = tableData.reduce((accumulator, skill) => accumulator + skill.xp, 0);
            return (
                <tr>
                    <td /><td>Aantal vaardigheden: {tableData.length} </td>
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
    }

    // Verwijderen uit de tabel, updaten van grid
    function handleDelete(row) {
        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.skill, true, tableData, setModalMsg);
        if (isPrerequisite) { setShowModal(true); }
        else {
            // Item weghalen uit grid
            setTableData((prevData) => prevData.filter((item) =>
                item.skill.toLowerCase() !== row.skill.toLowerCase()));
        }
    }

    // Aanvullende aankopen van reeds bestaande vaardigheid
    function handleAdd(row) {
        if (totalXP < Math.floor(MAX_XP)) {
            // Source data
            let sourceRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === row.skill.toLowerCase());
            if (!sourceRecord) {
                sourceRecord = sourceExtraVaardigheden.find((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase())
            }
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
    }

    function handleSubtract(row) {
        // check of het een vereiste is
        const isPrerequisite = isSkillAPrerequisiteToAnotherSkill(row.skill, false, tableData, setModalMsg);
        if (isPrerequisite) { setShowModal(true); }
        else {
            const currentSkill = tableData.find(currentSkill => currentSkill.skill === row.skill);
            if (currentSkill.count === 1) {
                // Item weghalen uit grid
                setTableData((prevData) => prevData.filter((item) =>
                    item.skill.toLowerCase() !== row.skill.toLowerCase()));
            }
            else {
                const updatedTableData = tableData.map((record) =>
                    record.skill.toLowerCase() === row.skill.toLowerCase() &&
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
        let currentItem = sourceBasisVaardigheden.find((record) => record.id === row.original.id);
        if (!currentItem) { currentItem = sourceExtraVaardigheden.find((record) => record.id === row.original.id); }

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

    function showDisclaimer() {
        if (showModal !== true) {
            setModalMsg(
                "De character creator geeft een indicatie van de mogelijkheden.\n " +
                "Er kunnen altijd afwijkingen zitten tussen de teksten\n" +
                "in de character creator en de VA regelset.\n\n" +
                "Check altijd de laatste versie van de regelset op:\n" +
                "https://the-vortex.nl/het-spel/regels/" +
                "\n");
            setShowModal(true);
        }
    }
    const determineSortinSymbol = (isSorted) => { return isSorted ? ' \u25BC' : ' \u25B2' }

    const closeModal = () => { setShowModal(false); };
    const closeUploadModal = () => { setShowUploadModal(false); };
    const closeFAQModal = () => { setShowFAQModal(false); };
    const openFAQModal = () => { setShowFAQModal(true); };
    const closeLoadCharacterModal = () => { setShowLoadCharacterModal(false); };
    const closeLoadPresetModal = () => { setShowLoadPresetModal(false); };

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: tableData }, useSortBy);

    /// --- HTML CONTENT --- ///
    return (
        <div className="App">
            <header className="App-header">
                <img id="App-VA-logo" src="./images/logo_100.png" alt="Logo" />
                <h2>Character Creator</h2>
            </header>
            <main>
                <div className="main-container">
                    <Toolbar clearCharacterBuild={clearCharacterBuild} />
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <table {...getTableProps()} className="App-table">
                            <thead>
                                {headerGroups.map((headerGroup) => (
                                    <tr key={uuidv4()} {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            <th
                                                key={uuidv4()}
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className={column.className}
                                            >
                                                {column.render('Header')}
                                                <span>
                                                    {column.isSorted ? determineSortinSymbol(column.isSortedDesc) : ''}
                                                </span>
                                            </th>
                                        ))}
                                        <th key={uuidv4()} className="col-acties">Acties</th>
                                    </tr>
                                ))}
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
                                                    index={index}>
                                                    {(provided) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {row.cells.map((cell) => (
                                                                // eslint-disable-next-line react/jsx-key
                                                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                            ))}
                                                            <td role="cell">
                                                                {requestActions(row)}
                                                            </td>
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

                    {showModal && (<ModalMessage
                        modalMsg={modalMsg}
                        closeModal={closeModal} />
                    )}

                    {showUploadModal && (
                        <FileUploadModal
                            closeModal={closeUploadModal}
                            ruleset_version={ruleset_version}
                            setCharName={setCharName}
                            setIsChecked={setIsChecked}
                            setMAX_XP={setMAX_XP}
                            setTableData={setTableData} />
                    )}

                    {showFAQModal && (<FAQModal
                        closeModal={closeFAQModal} />
                    )}

                    {showLoadCharacterModal && (
                        <LoadCharacterModal
                            closeModal={closeLoadCharacterModal}
                            setTableData={setTableData}
                            setCharName={setCharName}
                            setIsChecked={setIsChecked}
                            setMAX_XP={setMAX_XP}
                            version={ruleset_version}
                        />
                    )}

                    {showLoadPresetModal && (
                        <LoadPresetModal
                            closeModal={closeLoadPresetModal}
                            setTableData={setTableData}
                            setCharName={setCharName}
                            setIsChecked={setIsChecked}
                            setMAX_XP={setMAX_XP}
                            version={ruleset_version}
                        />
                    )}

                </div>
                <div className="side-containers">
                    <div className="side-container-b">
                        <div className="summary-title">
                            <h5>Character eigenschappen</h5>
                        </div>
                        <div className="grid-eigenschappen">
                            {gridEigenschappen.map((item) => (
                                <GridEigenschapItem
                                    name={item.name}
                                    key={uuidv4()}
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
                            {gridSpreuken?.map((item) => (
                                <GenericTooltipItem
                                    skill={item.skill}
                                    name={item.name}
                                    type={"grid-spreuken"}
                                    page={item.page}
                                    key={uuidv4()}
                                    text={item.name}
                                />
                            ))}
                        </div>

                        <div className="summary-title">
                            <h5>Recepten</h5>
                        </div>
                        <div className="grid-recepten">
                            {gridRecepten.map((item) => (
                                <GenericTooltipItem
                                    skill={item.skill}
                                    name={item.name}
                                    type={"grid-recepten"}
                                    key={uuidv4()}
                                    text={item.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main >
            <div className="flex-filler"></div>
            <footer>
                <div>{version}</div>
                <div>{creator}{'\u2122'}</div>
                <div>
                    <label className="disclaimer" onClick={showDisclaimer}>Disclaimer</label>
                    <label className="faq" onClick={openFAQModal}>F.A.Q.</label>
                </div>

            </footer>
        </div >
    );
}