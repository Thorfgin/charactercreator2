import { useState, useEffect, useRef, useCallback } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

// Components
import Tooltip from './Tooltip.jsx';
import ConfirmModal from './ConfirmModal.jsx';

// Shared
import { useSharedState } from '../SharedStateContext.jsx';
import {
    setLocalStorage,
    getAllLocalStorageKeys,
    meetsAllPrerequisites
} from '../SharedActions.js';
import {
    totalXP,
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
    optionsBasisVaardigheden,
    optionsExtraVaardigheden
} from '../SharedObjects.js'

Toolbar.propTypes = { clearCharacterBuild: PropTypes.func.isRequired };

// Zet een Toolbar klaar met daarin de mogelijkheid om:
// Settings te wijzigen, Vaarigheden te selecteren, Personages te bewaren/laden of Personages te exporteren/importeren
export default function Toolbar({ clearCharacterBuild }) {

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
    const handleCheckboxChange = () => {
        const newIsChecked = !isChecked;
        setIsChecked(newIsChecked);

        if (!newIsChecked) {
            setMAX_XP(15);
            setTableData([]);
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
            sourceBasisVaardigheden.find(record => record.skill.toLowerCase() === selectedSkill.value.toLowerCase()) ||
            sourceExtraVaardigheden.find(record => record.skill.toLowerCase() === selectedSkill.value.toLowerCase());
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

        if (isBasicSkill) {
            setCurrentBasicImageIndex(0);
        }
        else {
            setCurrentExtraImageIndex(0);
        }
    }, [tableData, btnAddBasicRef, btnAddExtraRef]);

    // Declare Use-effects
    useEffect(() => { onSelectSkill(true, selectedBasicSkill); }, [onSelectSkill, selectedBasicSkill]);
    useEffect(() => { onSelectSkill(false, selectedExtraSkill); }, [onSelectSkill, selectedExtraSkill]);


    // Voeg de geselecteerde Basis vaardigheid toe aan de tabel
    function handleBasicSkillSelection() {
        if (selectedBasicSkill) {
            const selectedBasicRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === selectedBasicSkill.value.toLowerCase());
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

        const selectedExtraRecord = sourceExtraVaardigheden.find((record) =>
            record.skill.toLowerCase() === selectedExtraSkill.value.toLowerCase()
        );

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
            if (totalXP === Math.floor(MAX_XP)) {
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
                console.Error("There should be a reason for refusing to add the skill, but no reason was set.")
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

    /// --- BUTTONS --- ///

    // Opslaan in de local storage van de browser
    function saveCharacterToLocalStorage() {
        setLocalStorage(charName,
            [{
                ruleset_version: ruleset_version,
                isChecked: isChecked,
                MAX_XP: MAX_XP,
                data: tableData
            }]);
        if (showConfirmUpdateModal === true) { closeConfirmUpdateModal(); }
        setModalMsg(`Personage '${charName}' opgeslagen.`);
        setShowModal(true);
    }

    // Verwijderen uit de local storage van de browser
    function removeCharacterFromLocalStorage() {
        const key = getAllLocalStorageKeys(charName);
        if (key.length > 0) {
            setLocalStorage(key, null);
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
            const result = getAllLocalStorageKeys(charName);
            if (result.length > 0) {
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

    // Exporteren naar .dat bestand
    function exportCharacter() {
        if (tableData.length > 0) {
            const dataSet = [{
                ruleset_version: ruleset_version,
                isChecked: isChecked,
                MAX_XP: MAX_XP,
                data: tableData
            }];
            const value = JSON.stringify(dataSet);
            const encodedValue = encodeURIComponent(value);
            const unreadableValue = btoa(encodedValue);
            const blob = new Blob([unreadableValue], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const downloadName = charName !== "" ? charName : "character";
            a.download = `VA_${downloadName}.dat`;
            a.click();
            // Opruimen na download
            URL.revokeObjectURL(url);
        }
    }

    // Exporteren van de gegevens in de tableData en Grids naar PDF
    // TODO: Export bouwen
    function exportCharacterToPDF() {
        setModalMsg("Work in progress...");
        setShowModal(true);
    }

    // RETURN
    return (
        <div className="toolbar-container">
            {showConfirmRemoveModal === true && (
                <ConfirmModal
                    header={headerConfirmModal}
                    modalMsg={msgConfirmModal}
                    onClose={closeConfirmRemoveModal}
                    onConfirm={removeCharacterFromLocalStorage}
                />)}
            {showConfirmUpdateModal === true && (
                <ConfirmModal
                    header={headerConfirmModal}
                    modalMsg={msgConfirmModal}
                    onClose={closeConfirmUpdateModal}
                    onConfirm={saveCharacterToLocalStorage}
                />)}
            <div className="character-container">
                <div className="character-settings">
                    <div>
                        <div className="settings-row">
                            <label>
                                Naam:
                            </label>
                            <input className="settings-personage"
                                type="text"
                                maxLength="20"
                                value={charName}
                                onChange={handleTextChange}
                            />
                        </div>
                        <div className="settings-row">
                            <label>
                                Nieuw personage:
                            </label>
                            <input className="settings-checkbox"
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </div>
                    <div className="settings-inputs">
                        <div className="settings-row">
                            <label>
                                Max XP:
                            </label>
                            <input
                                type="number"
                                value={MAX_XP}
                                min={1}
                                max={100}
                                onBlur={handleInputValidate}
                                onChange={handleInputUpdate}
                                disabled={isChecked}
                                step={0.25}
                            />
                        </div>
                        <div className="settings-row">
                            <label>
                                XP over:
                            </label>
                            <input
                                type="number"
                                value={MAX_XP - totalXP}
                                min={1}
                                max={100}
                                disabled={true}
                            />
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
                        <button className="btn-toolbar" title="Exporteer naar PDF" onClick={exportCharacterToPDF}>
                            <img className="btn-image" src="./images/button_export-pdf.png" alt="Export PDF Button" />
                        </button>
                        <button className="btn-toolbar" title="Personage exporteren" onClick={exportCharacter}>
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
                    className="form-select"
                    options={optionsBasisVaardigheden}
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
                        <Tooltip
                            skillName={selectedBasicSkill.value}
                            isSpell={false}
                            isRecipe={false}
                            isSkill={true}
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
                                <Tooltip
                                    skillName={selectedExtraSkill.value}
                                    isSpell={false}
                                    isRecipe={false}
                                    isSkill={true}
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