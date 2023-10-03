/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Tooltip from './tooltip.js';
import {
    totalXP,
    sourceBasisVaardigheden,
    optionsBasisVaardigheden,
    sourceExtraVaardigheden,
    optionsExtraVaardigheden,
    meetsAllPrerequisites
}
    from './App.js'

function Toolbar(tableData, setTableData, setModalMsg, setShowModal) {
    const [selectedBasicSkill, setSelectedBasicSkill] = useState("");
    const [selectedExtraSkill, setSelectedExtraSkill] = useState("");
    const [isChecked, setIsChecked] = useState(true);
    const [MAX_XP, setMAX_XP] = useState(15);

    // CHECKBOX
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        if (!isChecked) {
            setMAX_XP(15);
            setTableData([]);
        }
    };

    // INPUT    
    const handleInputChange = (event) => {
        if (isChecked) { event.preventDefault(); } // stop bewerking 
        else if (event.target.value && event.target.value > event.target.min) {
            const newValue = parseFloat(event.target.value);
            let roundedValue = Math.floor(newValue * 4) / 4;
            roundedValue = roundedValue.toFixed(2)

            if (roundedValue > parseFloat(event.target.max)) {
                roundedValue = event.target.max;
            }
            setMAX_XP(roundedValue);
        }
        else { setMAX_XP(1); }
    };

    // SELECT & INFO
    const imageSrc = ["./images/img-info.png", "./images/img-info_red.png"]
    const [currentBasicImageIndex, setCurrentBasicImageIndex] = useState(0);
    const [currentExtraImageIndex, setCurrentExtraImageIndex] = useState(0);

    const btnAddBasicRef = useRef(null);
    const btnAddExtraRef = useRef(null);

    useEffect(() => { onSelectSkill(true, selectedBasicSkill); }, [selectedBasicSkill]);
    useEffect(() => { onSelectSkill(false, selectedExtraSkill); }, [selectedExtraSkill]);

    // Op basis van de geselecteerde skill, bepaald de bijbehorende (i) afbeelding
    function onSelectSkill(isBasicSkill, selectedSkill) {
        let meetsPrerequisites;

        if (selectedSkill && selectedSkill.value !== "") {
            let selectedRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === selectedSkill.value.toLowerCase());
            if (!selectedRecord) {
                selectedRecord = sourceExtraVaardigheden.find((record) =>
                    record.skill.toLowerCase() === selectedSkill.value.toLowerCase());
            }

            meetsPrerequisites = meetsAllPrerequisites(selectedRecord, tableData, setModalMsg);

            if (meetsPrerequisites === false) {
                isBasicSkill ? btnAddBasicRef.current.disabled = true : btnAddExtraRef.current.disabled = true;
                loop(isBasicSkill);
            }
            else {
                isBasicSkill === true ? btnAddBasicRef.current.disabled = false : btnAddExtraRef.current.disabled = false;
            }
            isBasicSkill === true ? setCurrentBasicImageIndex(0) : setCurrentExtraImageIndex(0);
        }
        else {
            if (btnAddBasicRef.current) { btnAddBasicRef.current.disabled = false }
            if (btnAddExtraRef.current) { btnAddExtraRef.current.disabled = false; }
        }
    }

    // Voeg de geselecteerde Basis vaardigheid toe aan de tabel
    function handleBasicSkillSelection() {
        if (selectedBasicSkill) {
            const selectedBasicRecord = sourceBasisVaardigheden.find((record) =>
                record.skill.toLowerCase() === selectedBasicSkill.value.toLowerCase());
            const wasSuccesfull = handleAddToTable(selectedBasicRecord)
            if (wasSuccesfull) { setSelectedBasicSkill(''); }
        }
        else {
            console.warn("Selected Basic skill could not be found.")
        }
    }

    // Acteer op een Key Press op de geselecteerde Basis vaaardigheid
    const handleBasicSkillSelectKeyPress = (event) => {
        if (event.key === "Enter") { handleBasicSkillSelection(); }
        else if (event.key === "Escape") { setSelectedBasicSkill(''); }
    };

    // Voeg de geselecteerde Extra vaardigheid toe aan de tabel
    function handleExtraSkillSelection() {
        if (selectedExtraSkill) {
            const selectedExtraRecord = sourceExtraVaardigheden.find((record) =>
                record.skill.toLowerCase() === selectedExtraSkill.value.toLowerCase());
            const wasSuccesfull = handleAddToTable(selectedExtraRecord)
            if (wasSuccesfull) { setSelectedExtraSkill(''); }
        }
        else {
            console.warn("Selected Extra skill could not be found.")
        }
    }

    // Acteer op een Key Press op de geselecteerde Extra vaaardigheid
    const handleExtraSkillSelectKeyPress = (event) => {
        if (event.key === "Enter") { handleExtraSkillSelection(); }
        else if (event.key === "Escape") { setSelectedExtraSkill(''); }
    };


    // Handel alle controles af, alvorens het opgevoerde Record toe te voegen aan de tabel
    // Werkt voor zowel de basis- als extra vaardigheden.
    function handleAddToTable(selectedRecord) {
        const wasAlreadySelected = tableData.some((record) =>
            record.skill.toLowerCase() === selectedRecord.skill.toLowerCase());
        const hasSufficientFreeXP = (totalXP + selectedRecord.xp) <= Math.floor(MAX_XP) || selectedRecord.xp === 0;

        if (wasAlreadySelected) {
            setModalMsg("Dit item is al geselecteerd. \nToevoegen is niet toegestaan.\n");
            setShowModal(true);
        }
        // TODO: COMMENT OUT THIS CODEBLOCK TO DISABLE REQUIREMENTS
        else if (!meetsAllPrerequisites(selectedRecord, tableData, setModalMsg)) { setShowModal(true); }
        else if (!hasSufficientFreeXP) {
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
                console.warn("There should be a reason, but no reason was set.")
                setModalMsg("Er ging iets fout...");
            }
            setShowModal(true);
            return false;
        }
        else {
            setTableData((prevData) => [...prevData, selectedRecord]);
            return true;
        }
    };


    // TOOLTIP ICON
    // Laat het icoontje flitsen van zwart > rood
    function loop(isBasicSkill, counter = 0) {
        const maxIterations = 8;
        const delay = 100;

        if (isBasicSkill === true) {
            setTimeout(() => {
                setCurrentBasicImageIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
                if (counter < maxIterations) {
                    setTimeout(() => {
                        loop(isBasicSkill, counter + 1);
                    }, delay);
                };
            })
        }
        else {
            setTimeout(() => {
                setCurrentExtraImageIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
                if (counter < maxIterations) {
                    setTimeout(() => { loop(isBasicSkill, counter + 1); }, delay);
                };
            })
        }
    }

    function showDisclaimer() {
        setModalMsg(
            "De character creator geeft een indicatie van de mogelijkheden.\n " +
            "Er kunnen altijd afwijkingen zitten tussen de teksten\n" +
            "in de character creator en de VA regelset.\n\n" +
            "Check altijd de laatste versie van de regelset op:\n" +
            "https://the-vortex.nl/het-spel/regels/" +
            "\n");
        setShowModal(true);
    }

    return (
        <div className="toolbar-container">
            <div className="select-settings">
                <div className="settings-personage">
                    <label className="settings-label">
                        Nieuw personage:
                    </label>
                    <input className="settings-checkbox"
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />{' '}
                </div>
                <div className="settings-XP">
                    <div>
                        <label>
                            Max XP:
                        </label>
                        <input className="settings-input-xp"
                            type="number"
                            value={MAX_XP}
                            min={1}
                            max={100}
                            onChange={handleInputChange}
                            disabled={isChecked}
                            step={0.25}
                        />
                    </div>
                    <div>
                        <label>
                            XP over:
                        </label>
                        <input className="settings-input-xp"
                            type="number"
                            value={MAX_XP - totalXP}
                            min={1}
                            max={100}
                            disabled={true}
                        />
                    </div>
                </div>
                <div className="settings-btns">
                    <div className="settings-btns-row">
                        <button className="btn-toolbar" title="Personage opslaan" onClick={showDisclaimer}>
                            <img className="btn-image" src="./images/button_save.png" alt="Save Button" />
                        </button>
                        <button className="btn-toolbar" title="Laad personage" onClick={showDisclaimer}>
                            <img className="btn-image" src="./images/button_load.png" alt="Load Button" />
                        </button>
                        <button className="btn-toolbar" title="Verwijder personage" onClick={showDisclaimer}>
                            <img className="btn-image" src="./images/button_trash.png" alt="Trash Button" />
                        </button>
                    </div>
                    <div className="btns-row">
                        <button className="btn-toolbar" title="Lokaal opslaan" onClick={showDisclaimer}>
                            <img className="btn-image" src="./images/button_download.png" alt="Download Button" />
                        </button>
                        <button className="btn-toolbar" title="Lokaal laden" onClick={showDisclaimer}>
                            <img className="btn-image" src="./images/button_upload.png" alt="Upload Button" />
                        </button>
                        <button className="btn-toolbar" title="Exporteer naar PDF" onClick={showDisclaimer}>
                            <img className="btn-image" src="./images/button_export-pdf.png" alt="Export PDF Button" />
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
                            isRecipy={false}
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
                                    isRecipy={false}
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

export default Toolbar;
