import { useState, useEffect, useRef, useCallback } from 'react';
import Select from 'react-select';

// Components
import {
    SkillTooltip,
    CustomTooltip
} from './Tooltip.jsx';
import ConfirmModal from './ConfirmModal.jsx';

// Functions
import ExportToPDF from '../ExportToPDF.js';

// Shared
import { useSharedState } from '../SharedStateContext.jsx';
import {
    getAllLocalStorageKeys,
    saveCharacterToStorage,
    removeCharacterFromStorage,
    exportCharacterToFile
} from '../SharedStorage.js';
import {
    meetsAllPrerequisites,
    verifyTableContainsExtraSkill
} from '../SharedActions.js';
import {
    totalXP,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
    optionsBasisVaardigheden,
    optionsExtraVaardigheden
} from '../SharedObjects.js'

// Zet een Toolbar klaar met daarin de mogelijkheid om:
// Settings te wijzigen, Vaarigheden te selecteren, Personages te bewaren/laden of Personages te exporteren/importeren
export default function Toolbar() {

    // Ophalen uit SharedStateContext
    const {
        // packageinfo
        ruleset_version,

        // table
        tableData, setTableData,
        charName, setCharName,
        isChecked, setIsChecked,
        MAX_XP, setMAX_XP,
        selectedBasicSkill, setSelectedBasicSkill,
        selectedExtraSkill, setSelectedExtraSkill,

        // modals
        setModalMsg, setShowModal,
        setShowUploadModal,
        setShowLoadCharacterModal,
        setShowLoadPresetModal,
        showConfirmRemoveModal, setShowConfirmRemoveModal,
        showConfirmUpdateModal, setShowConfirmUpdateModal,

        headerConfirmModal, setHeaderConfirmModal,
        msgConfirmModal, setMsgConfirmModal,

        // grids
        gridSpreuken,
        gridRecepten

    } = useSharedState();

    // SELECT & INFO
    const imageSrc = ["./images/img-info.png", "./images/img-info_red.png"]
    const [currentBasicImageIndex, setCurrentBasicImageIndex] = useState(0);
    const [currentExtraImageIndex, setCurrentExtraImageIndex] = useState(0);

    const btnAddBasicRef = useRef(null);
    const btnAddExtraRef = useRef(null);

    // MODALS
    const showUploadModal = () => { setShowUploadModal(true); }
    const showLoadCharacterModal = () => { setShowLoadCharacterModal(true); }
    const showLoadPresetModal = () => { setShowLoadPresetModal(true); }
    const closeConfirmRemoveModal = () => { setShowConfirmRemoveModal(false); }
    const closeConfirmUpdateModal = () => { setShowConfirmUpdateModal(false); }

    // CHECKBOX
    // ON/OFF: Toggled restrictie van XP en Select met Extra vaardigheden.
    // OFF: Wanneer er een Extra skills zijn, wist de tabel
    const handleCheckboxChange = () => {
        const newIsChecked = !isChecked;
        setIsChecked(newIsChecked);

        if (newIsChecked === true) {
            setMAX_XP(15);
            const hasExtraSkill = verifyTableContainsExtraSkill(tableData);
            if (hasExtraSkill === true) { setTableData([]); }
        }
    };

    // INPUT    
    // Personage naam opschonen op basis van de regex.
    const handleTextChange = (event) => {
        const inputValue = event.target.value;
        const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9._ -]/g, '');
        setCharName(sanitizedValue || "");
    };

    // Laat de gebruiker vrij de waarde wijzigen zonder interuptie
    const handleInputUpdate = (event) => {
        if (isChecked || !event.target.value || event.target.value < event.target.min) { return; }
        const newValue = parseFloat(event.target.value);
        const roundedValue = Math.floor(newValue * 4) / 4;
        setMAX_XP(roundedValue);
    };

    // Wanneer de Focus verloren gaat op de Input, valideer en corrigeer de input-waarde
    const handleInputValidate = (event) => {
        if (isChecked) {
            event.preventDefault(); // Stop bewerking 
            return;
        }

        const newValue = parseFloat(event.target.value);
        if (newValue >= event.target.min) {
            const { min, max } = event.target;
            const newValue = parseFloat(event.target.value);
            const roundedValue = (Math.floor(newValue * 4) / 4).toFixed(2);
            const clampedValue = Math.max(min, Math.min(max, roundedValue));
            setMAX_XP(clampedValue);
        }
        else { setMAX_XP(totalXP); }
    };

    // Op basis van de geselecteerde skill, bepaald de bijbehorende (i) afbeelding
    const onSelectSkill = useCallback((isBasicSkill, selectedSkill) => {
        if (!selectedSkill || selectedSkill.value === "") {
            if (btnAddBasicRef.current) btnAddBasicRef.current.disabled = false;
            if (btnAddExtraRef.current) btnAddExtraRef.current.disabled = false;
            return;
        }

        const selectedRecord =
            sourceBasisVaardigheden.find(record => record.id === selectedSkill.id) ||
            sourceExtraVaardigheden.find(record => record.id === selectedSkill.id);
        if (!selectedRecord) { return; }

        const meetsPrerequisites = meetsAllPrerequisites(selectedRecord, tableData);
        if (!meetsPrerequisites) {
            const btnRef = isBasicSkill ? btnAddBasicRef : btnAddExtraRef;
            btnRef.current.disabled = true;
            loop(isBasicSkill);
        } else {
            const btnRef = isBasicSkill ? btnAddBasicRef : btnAddExtraRef;
            btnRef.current.disabled = false;
        }

        if (isBasicSkill) { setCurrentBasicImageIndex(0); }
        else { setCurrentExtraImageIndex(0); }

    }, [tableData, btnAddBasicRef, btnAddExtraRef]);

    // Declare Use-effects
    useEffect(() => { onSelectSkill(true, selectedBasicSkill); }, [onSelectSkill, selectedBasicSkill]);
    useEffect(() => { onSelectSkill(false, selectedExtraSkill); }, [onSelectSkill, selectedExtraSkill]);

    // Voeg de geselecteerde Basis vaardigheid toe aan de tabel
    function handleBasicSkillSelection() {
        if (selectedBasicSkill) {
            const selectedBasicRecord = sourceBasisVaardigheden.find((record) => record.id === selectedBasicSkill.id);
            const wasSuccesfull = handleAddToTable(selectedBasicRecord)
            if (wasSuccesfull) { setSelectedBasicSkill(''); }
        }
        else {
            setSelectedBasicSkill('');
        }
    }

    // Acteer op een Key Press op de geselecteerde Basis vaaardigheid
    const handleBasicSkillSelectKeyPress = (event) => {
        if (event.key === "Enter") { handleBasicSkillSelection(); }
        else if (event.key === "Escape") { setSelectedBasicSkill(''); }
    };

    // Voeg de geselecteerde Extra vaardigheid toe aan de tabel
    function handleExtraSkillSelection() {
        if (!selectedExtraSkill) {
            setSelectedBasicSkill('');
            return;
        }

        const selectedExtraRecord = sourceExtraVaardigheden.find((record) => record.id === selectedExtraSkill.id );
        if (selectedExtraRecord && handleAddToTable(selectedExtraRecord)) { setSelectedExtraSkill(''); }
    }

    // Acteer op een Key Press op de geselecteerde Extra vaaardigheid
    const handleExtraSkillSelectKeyPress = (event) => {
        if (event.key === "Enter") { handleExtraSkillSelection(); }
        else if (event.key === "Escape") { setSelectedExtraSkill(''); }
    };


    // Handel alle controles af, alvorens het opgevoerde Record toe te voegen aan de tabel
    // Werkt voor zowel de basis- als extra vaardigheden.
    function handleAddToTable(selectedRecord) {
        const hasSufficientFreeXP = (totalXP + selectedRecord.xp) <= Math.floor(MAX_XP) || selectedRecord.xp === 0;
        if (!hasSufficientFreeXP) {
            if (totalXP >= Math.floor(MAX_XP)) {
                setModalMsg(
                    "Maximum XP (" + MAX_XP + ") bereikt. \n" +
                    "Toevoegen is niet toegestaan.\n");
            }
            else if (totalXP < Math.floor(MAX_XP)) {
                setModalMsg(
                    "Maximum xp (" + MAX_XP + ") zal worden overschreden. \n" +
                    "Deze skill kost: " + selectedRecord.xp + ". \n" +
                    "Toevoegen is niet toegestaan.\n");
            } else {
                console.error("There should be a reason for refusing to add the skill, but no reason was set.")
                setModalMsg("Er ging iets fout...");
            }
            setShowModal(true);
            return false;
        }
        else {
            setTableData((prevData) => [...prevData, selectedRecord]);
            return true;
        }
    }

    // TOOLTIP ICON
    // Laat het icoontje flitsen van zwart > rood
    function loop(isBasicSkill, counter = 0) {
        const maxIterations = 8;
        const delay = 100;
        const setIndex = isBasicSkill ? setCurrentBasicImageIndex : setCurrentExtraImageIndex;

        const toggleIndex = () => {
            setIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
            if (counter < maxIterations) {
                setTimeout(toggleIndex, delay);
                counter++;
            }
        };

        toggleIndex();
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


    /// --- BUTTONS --- ///

    // Opslaan in de local storage van de browser
    function saveCharacterToLocalStorage() {
        saveCharacterToStorage(charName, charName, isChecked, MAX_XP, tableData)
        if (showConfirmUpdateModal === true) { closeConfirmUpdateModal(); }
        setModalMsg(`Personage '${charName}' opgeslagen.`);
        setShowModal(true);
    }

    // Verwijderen uit de local storage van de browser
    function removeCharacterFromLocalStorage() {
        const wasRemoved = removeCharacterFromStorage(charName);
        if (wasRemoved === true) {
            clearCharacterBuild();
            setModalMsg(`Personage '${charName}' verwijderd.`);
        } else {
            setModalMsg(`Personage '${charName}' niet gevonden.`);
        }
        closeConfirmRemoveModal();
        setShowModal(true);
    }

    // Eerst via ConfirmModal bevestigen, daarna verwijdern
    function showConfirmRemoval() {
        if (charName && charName.trim() !== '') {
            setHeaderConfirmModal("Bevestig verwijderen");
            setMsgConfirmModal("Weet u zeker dat u dit personage:\n'" + charName + "'\nwilt verwijderen?");
            setShowConfirmRemoveModal(true);
        }
    }

    // Eerst via ConfirmModal bevestigen, daarna updaten
    // Check of de naam gevuld is en of deze bestaat in de localstorage
    // Als deze bestaat mag de gebruiken de update bevestigen
    // Anders gewoon opslaan.
    function showConfirmUpdate() {
        if (charName && charName.trim() !== '') {
            const keys = getAllLocalStorageKeys(charName);
            if (keys.length > 0) {
                setHeaderConfirmModal("Bevestig overschrijven");
                setMsgConfirmModal("Personage bestaat al.\nWilt u dit personage:\n'" + charName + "'\n oveschrijven?");
                setShowConfirmUpdateModal(true);
            }
            else {
                saveCharacterToLocalStorage();
            }
        }
        else {
            setModalMsg("Vul de naam van het personage in.");
            setShowModal(true);
        }
    }

    // Exporteren
    const exportToFile = () => { exportCharacterToFile(charName, isChecked, MAX_XP, tableData); }
    const exportToPDF = async () => { await ExportToPDF(charName, ruleset_version, tableData, MAX_XP, totalXP, gridSpreuken, gridRecepten); }

    // RETURN
    return (
        <div className="toolbar-container">
            {showConfirmRemoveModal === true && (
                <ConfirmModal
                    header={headerConfirmModal}
                    modalMsg={msgConfirmModal}
                    closeModal={closeConfirmRemoveModal}
                    onConfirm={removeCharacterFromLocalStorage}
                />)}
            {showConfirmUpdateModal === true && (
                <ConfirmModal
                    header={headerConfirmModal}
                    modalMsg={msgConfirmModal}
                    closeModal={closeConfirmUpdateModal}
                    onConfirm={saveCharacterToLocalStorage}
                />)}
            <div className="character-container">
                <div className="character-settings">
                    <div>
                        <div className="settings-row">
                            <label name="name_label">
                                Naam:
                                <input name="name_input"
                                    className="settings-personage"
                                    type="text"
                                    maxLength="25"
                                    value={charName}
                                    onChange={handleTextChange}
                                />
                            </label>
                        </div>
                        <div className="settings-row">
                            <label name="new_character_label">
                                Nieuw personage:
                                <input
                                    name="new_character_checkbox"
                                    className="settings-checkbox"
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={handleCheckboxChange}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="settings-inputs">
                        <div className="settings-row">
                            <label name="max_xp_label">
                                Max XP:
                                <input
                                    name="max_xp_input"
                                    type="number"
                                    value={MAX_XP}
                                    min={0}
                                    max={100}
                                    onBlur={handleInputValidate}
                                    onChange={handleInputUpdate}
                                    disabled={isChecked}
                                    step={0.25}
                                />
                            </label>
                        </div>
                        <div className="settings-row">
                            <label name="xp_over_label">
                                XP over:
                                <input
                                    className = { isChecked && totalXP < 12 ? "xp_over_input" : null}
                                    id="xp_over_input"
                                    type="number"
                                    value={MAX_XP - totalXP}
                                    min={1}
                                    max={100}
                                    disabled={true}
                                />
                            </label>
                            {(isChecked && totalXP < 12) ? (
                                <CustomTooltip
                                    header="Nieuw personage"
                                    message="Nieuwe personages mogen niet meer dan 3 XP punten bewaren. \nXP boven de 3 punten die niet besteed wordt, zal verloren raken. \n\nMocht je als nieuwe speler (toch) niet tevreden zijn met je keuze, dan is dat geen probleem: Tijdens en na je eerste event mag je via de infobalie in overleg nog vaardigheden verwisselen."
                                    image={imageSrc[1]}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="settings-btns">
                    <div className="settings-btns-row">
                        <button className="btn-toolbar" title="Toon templates" onClick={showLoadPresetModal}>
                            <img className="btn-image" src="./images/button_presets.png" alt="Preset Button" />
                        </button>
                        <button className="btn-toolbar" title="Personage opslaan" onClick={showConfirmUpdate}>
                            <img className="btn-image" src="./images/button_save.png" alt="Save Button" />
                        </button>
                        <button className="btn-toolbar" title="Personage laden" onClick={showLoadCharacterModal}>
                            <img className="btn-image" src="./images/button_load.png" alt="Load Button" />
                        </button>
                        <button className="btn-toolbar" title="Personage verwijderen" onClick={showConfirmRemoval}>
                            <img className="btn-image" src="./images/button_trash.png" alt="Trash Button" />
                        </button>
                    </div>
                    <div className="btns-row">
                        <button className="btn-toolbar" title="Exporteer naar PDF" onClick={exportToPDF}>
                            <img className="btn-image" src="./images/button_export-pdf.png" alt="Export PDF Button" />
                        </button>
                        <button className="btn-toolbar" title="Personage exporteren" onClick={exportToFile}>
                            <img className="btn-image" src="./images/button_download.png" alt="Export Button" />

                        </button>
                        <button className="btn-toolbar" title="Personage importeren" onClick={showUploadModal}>
                            <img className="btn-image" src="./images/button_upload.png" alt="Import Button" />
                        </button>

                    </div>
                </div>

            </div>
            <div className="select-basic-container">
                <Select
                    id="basic_skill_select"
                    className="form-select"
                    // Verwijder de leermeester skill voor nieuwe personages uit de Dropdown
                    options={isChecked
                        ? optionsBasisVaardigheden.filter(item => item.id !== 111) // Leermeester Expertise
                        : optionsBasisVaardigheden}
                    value={selectedBasicSkill}
                    onChange={(selectedBasicOption) => setSelectedBasicSkill(selectedBasicOption)}
                    onKeyDown={handleBasicSkillSelectKeyPress}
                    placeholder="Selecteer een Basis vaardigheid"
                    isClearable
                    isSearchable
                />

                {   // Conditionele tooltip
                    selectedBasicSkill &&
                    <div className="select-info">
                            <SkillTooltip
                            id={selectedBasicSkill.id}
                            image={imageSrc[currentBasicImageIndex]}
                        />
                    </div>
                }

                <button
                    ref={btnAddBasicRef}
                    title="Basis vaardigheid toevoegen"
                    className="btn-primary"
                    onClick={handleBasicSkillSelection}>
                    Toevoegen
                </button>
            </div>

            {
                // Bij uitzettend Checkbox worden Extra skills beschikbaar
                !isChecked && (
                    <div className="select-extra-container">
                        <Select
                            id="extra_skill_select"
                            className="form-select"
                            options={optionsExtraVaardigheden}
                            value={selectedExtraSkill}
                            onChange={(selectedExtraOption) => setSelectedExtraSkill(selectedExtraOption)}
                            onKeyDown={handleExtraSkillSelectKeyPress}
                            placeholder="Selecteer een Extra vaardigheid"
                            isClearable
                            isSearchable
                        />

                        {   // Conditionele tooltip
                            selectedExtraSkill &&
                            selectedExtraSkill.value !== "" &&
                            <div className="select-info">
                                <SkillTooltip
                                    id={selectedExtraSkill.id}
                                    image={imageSrc[currentExtraImageIndex]}
                                    />
                            </div>
                        }

                        <button
                            ref={btnAddExtraRef}
                            title="Extra vaardigheid toevoegen"
                            className="btn-primary"
                            onClick={handleExtraSkillSelection}>
                            Toevoegen
                        </button>
                    </div>
                )}
        </div>
    );
}