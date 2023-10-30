/* eslint-disable react/prop-types */
import { useState } from 'react';

// components
import TemplateTable from './TemplateTable.jsx';

// Shared
import { useSharedState } from '../SharedStateContext.jsx';
import { getPresets } from '../SharedObjects.js'
import { loadCharacterFromPreset } from '../SharedStorage.js'

const presets = getPresets();
const sourcePresets = presets.Presets;

export default function LoadPresetModal() {
    const [selectedTemplate, setSelectedTemplate] = useState("");

    // Ophalen uit SharedStateContext
    const {
        setTableData,
        setCharName,
        setIsChecked,
        setMAX_XP,
        setShowLoadPresetModal,
        setSelectedBasicSkill,
        setSelectedExtraSkill
    } = useSharedState();

    const closeModal = () => { setShowLoadPresetModal(false); };

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
            setSelectedBasicSkill(null);
            setSelectedExtraSkill(null);
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