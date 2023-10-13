import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import presets from './json/presets.json';
import {
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
}
    from './App.jsx'
const sourcePresets = presets.Presets;

TemplateTable.propTypes = {
    selectedTemplate: PropTypes.string,
    handleTemplateChange: PropTypes.func.isRequired
};

function TemplateTable({ selectedTemplate, handleTemplateChange }) {
    const tableRef = useRef(null);

    function handleSelectTemplate(name) {
        handleTemplateChange(name);
        // Verwijderen 'selected-row' als deze al was toegewezen
        const prevSelectedRow = tableRef.current.querySelector('.selected-row');
        if (prevSelectedRow) {
            prevSelectedRow.classList.remove('selected-row');
        }

        // Toevoegen 'selected-row' aan geselecteerde rij
        const selectedRow = tableRef.current.querySelector(`tr[data-key="${name}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected-row');
        }
    }

    return (
        <table className="character-table" ref={tableRef}>
            <tbody>
                {sourcePresets.length > 0 && sourcePresets.map((item) => (
                    <tr
                        key={item.name}
                        data-key={item.name}
                        className={selectedTemplate === item.name ? 'selected-row' : ''}
                        onClick={() => handleSelectTemplate(item.name)}
                    >
                        <td>{item.name}</td>
                    </tr>
                ))}
                {!presets && (
                    <tr>
                        <td>Geen presets gevonden</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

LoadPresetModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    setTableData: PropTypes.func.isRequired,
    setCharName: PropTypes.func.isRequired,
    setIsChecked: PropTypes.func.isRequired,
    setMAX_XP: PropTypes.func.isRequired,
    version: PropTypes.string.isRequired,
};

function LoadPresetModal({ closeModal, setTableData, setCharName, setIsChecked, setMAX_XP, version }) {
    const [selectedTemplate, setSelectedTemplate] = useState("");

    // Selecteer personage
    function handleSelectPreset(selectedTemp) { setSelectedTemplate(selectedTemp); }

    function loadPresetToTableData() {
        if (presets.version === version) {
            const preset = sourcePresets.find(item => item.name === selectedTemplate)
            const skills = [];

            // TableData is niet beschikbaar nog, 
            // dus Skill direct aannpassen zodat multi - aankoop mogelijk is
            for (const skill of preset.skills) {
                const props = skill.split('||')

                const sourceSkill = sourceBasisVaardigheden.find(item =>
                    item.skill.toLowerCase() === props[0].toLowerCase());
                const copySkill = Object.assign({}, sourceSkill); // kopie om wijzigingen op source te voorkomen
                if (props.length > 1) {
                    const count = Number(props[1]);
                    copySkill.xp = copySkill.xp * count;
                    copySkill.count = count;
                }
                skills.push(copySkill);
            }

            setCharName(preset.name);
            setIsChecked(true);
            setMAX_XP(15);
            setTableData(skills);
            closeModal();
        }
        else {
            console.error("De versie van deze templates komt niet overeen met de huidige regelset versie.");
        }

    }

    return (
        <div className="modal-overlay">
            <div className="upload-modal">
                <h3>Bekijk een template</h3>
                <div className="upload-modal-block">
                    <TemplateTable
                        selectedChar={selectedTemplate}
                        handleTemplateChange={handleSelectPreset}
                    />
                </div>
                <div className="upload-modal-block">
                    <button className="btn-primary" onClick={loadPresetToTableData}>Laad</button>
                    <button className="btn-primary" onClick={closeModal}>Annuleren</button>
                </div>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default LoadPresetModal;
