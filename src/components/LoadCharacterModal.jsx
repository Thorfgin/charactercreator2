import { useState } from 'react';
import PropTypes from 'prop-types';

// components
import CharacterTable from './CharacterTable.jsx';

// Shared
import { useSharedState } from '../SharedStateContext.jsx';
import {
    loadCharacterFromStorage,
    getAllLocalStorageKeys
} from '../SharedStorage.js';

LoadCharacterModal.propTypes = { closeModal: PropTypes.func.isRequired };

function LoadCharacterModal({ closeModal }) {
    const [selectedCharacter, setSelectedCharacter] = useState("");

    // Ophalen uit SharedStateContext
    const {
        setTableData,
        setCharName,
        setIsChecked,
        setMAX_XP
    } = useSharedState();

    // Laden uit de local storage van de browser
    function loadCharacterFromLocalStorage() {
        const key = getAllLocalStorageKeys(selectedCharacter);
        const charData = loadCharacterFromStorage(key);
        if (charData) {
                setCharName(charData.name || selectedCharacter.replace('CC-', ''));
                setIsChecked(charData.is_checked);
                setMAX_XP(charData.max_xp);
                setTableData(charData.Skills);
                closeModal();
            }
        else if (!selectedCharacter || selectedCharacter.trim() === "") { return; }
        else {
            const msg = "Deze versie van dit personage kan helaas niet ingeladen worden.";
            alert(msg);
            console.error(msg, key, charData);
        }
    }

    // Selecteer personage
    function handleCharacterChange(selectedChar) { setSelectedCharacter(selectedChar); }

    return (
        <div className="modal-overlay">
            <div className="upload-modal">
                <h3>Laad een personage</h3>
                <div className="upload-modal-block">
                    <CharacterTable
                        selectedChar={selectedCharacter}
                        handleCharacterChange={handleCharacterChange} />
                </div>
                <div className="upload-modal-block">
                    <button className="btn-primary" onClick={loadCharacterFromLocalStorage}>Laad</button>
                    <button className="btn-primary" onClick={closeModal}>Annuleren</button>
                </div>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default LoadCharacterModal;
