import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    getLocalStorage,
    getAllLocalStorageKeys
} from './SharedActions.js';


CharacterTable.propTypes = {
    selectedCharacter: PropTypes.string,
    handleCharacterChange: PropTypes.func.isRequired,
};

function CharacterTable({ selectedCharacter, handleCharacterChange }) {
    const tableRef = useRef(null);
    let keys = [];

    const allCharacterKeys = getAllLocalStorageKeys();
    allCharacterKeys.forEach(key => key !== "CCdata" ? keys.push(key) : null);

    function handleSelectCharacter(key) {
        handleCharacterChange(key);
        // Verwijderen 'selected-row' als deze al was toegewezen
        const prevSelectedRow = tableRef.current.querySelector('.selected-row');
        if (prevSelectedRow) {
            prevSelectedRow.classList.remove('selected-row');
        }

        // Toevoegen 'selected-row' aan geselecteerde rij
        const selectedRow = tableRef.current.querySelector(`tr[data-key="${key}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected-row');
        }
    }

    return (
        <table className="character-table" ref={tableRef}>
            <tbody>
                {keys.length > 0 && keys.map((key) => (
                    <tr
                        key={key}
                        data-key={key}
                        className={selectedCharacter === key ? 'selected-row' : ''}
                        onClick={() => handleSelectCharacter(key)}
                    >
                        <td>{key}</td>
                    </tr>
                ))}
                {!keys && (
                    <tr>
                        <td>Geen personages gevonden</td>
                    </tr>
                )
                }
            </tbody>
        </table>
    );
}


LoadCharacterModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    setTableData: PropTypes.func.isRequired,
    setCharName: PropTypes.func.isRequired,
    setIsChecked: PropTypes.func.isRequired,
    setMAX_XP: PropTypes.func.isRequired,
    version: PropTypes.string.isRequired,
};

function LoadCharacterModal({ closeModal, setTableData, setCharName, setIsChecked, setMAX_XP, version }) {
    const [selectedCharacter, setSelectedCharacter] = useState("");

    // Laden uit de local storage van de browser
    function loadCharacterToLocalStorage() {
        const key = getAllLocalStorageKeys(selectedCharacter);
        const rawData = getLocalStorage(key);
        if (rawData && rawData.length > 0) {
            const charData = rawData[0]
            if (charData.ruleset_version && charData.ruleset_version === version) {
                const cleanCharName = selectedCharacter.replace('CC-', '');
                setCharName(cleanCharName);
                setIsChecked(charData.isChecked);
                setMAX_XP(charData.MAX_XP);
                setTableData(charData.data);
                closeModal();
            }
            else {
                const msg = "De regelset versie van het personage wordt niet herkend."
                alert(msg);
                console.error("De regelset versie van het personage wordt niet herkend.", key);
            }
        }
        if (selectedCharacter || selectedCharacter.trim() === "") { return; }
        else {
            const msg = "Deze versie van dit personage kan helaas niet ingeladen worden.";
            alert(msg);
            console.error(msg, key, rawData);
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
                    <button className="btn-primary" onClick={loadCharacterToLocalStorage}>Laad</button>
                    <button className="btn-primary" onClick={closeModal}>Annuleren</button>
                </div>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default LoadCharacterModal;
