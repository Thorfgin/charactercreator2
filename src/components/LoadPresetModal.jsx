/* eslint-disable react/prop-types */
import { useState } from 'react';
import PropTypes from 'prop-types';

// components
import TemplateTable from './TemplateTable.jsx';

// Shared
import { useSharedState } from '../SharedStateContext.jsx';
import { getPresets } from '../SharedObjects.js'
import { loadCharacterFromPreset } from '../SharedStorage.js'

const presets = getPresets();
const sourcePresets = presets.Presets;

LoadPresetModal.propTypes = { closeModal: PropTypes.func.isRequired };

export default function LoadPresetModal({ closeModal }) {
    const [selectedTemplate, setSelectedTemplate] = useState("");

    // Ophalen uit SharedStateContext
    const {
        setTableData,
        setCharName,
        setIsChecked,
        setMAX_XP
    } = useSharedState();

    // Selecteer personage
    function handleSelectPreset(selectedTemp) { setSelectedTemplate(selectedTemp); }

    function loadPresetToTableData() {
        const preset = sourcePresets.find(item => item.name === selectedTemplate)
        const charData = loadCharacterFromPreset(preset);
        if (charData) {
            setCharName(charData.name);
            setIsChecked(charData.is_checked);
            setMAX_XP(charData.max_xp);
            setTableData(charData.Skills);
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