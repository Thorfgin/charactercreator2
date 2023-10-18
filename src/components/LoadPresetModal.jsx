/* eslint-disable react/prop-types */
import { useState } from 'react';
import PropTypes from 'prop-types';

// components
import TemplateTable from './TemplateTable.jsx';

// shared
import {
    getPresets,
    sourceBasisVaardigheden
}
    from '../SharedObjects.js'

const presets = getPresets();
const sourcePresets = presets.Presets;

LoadPresetModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    setTableData: PropTypes.func.isRequired,
    setCharName: PropTypes.func.isRequired,
    setIsChecked: PropTypes.func.isRequired,
    setMAX_XP: PropTypes.func.isRequired,
    version: PropTypes.string.isRequired,
};

export default function LoadPresetModal({ closeModal, setTableData, setCharName, setIsChecked, setMAX_XP, version }) {
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
                const copySkill = { ...sourceSkill}; // kopie om wijzigingen op source te voorkomen
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