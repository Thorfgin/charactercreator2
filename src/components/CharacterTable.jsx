import { useRef } from 'react';
import PropTypes from 'prop-types';

// shared
import { getAllLocalStorageKeys } from '../SharedStorage.js';


CharacterTable.propTypes = {
    selectedCharacter: PropTypes.string,
    handleCharacterChange: PropTypes.func.isRequired,
};

export default function CharacterTable({ selectedCharacter, handleCharacterChange }) {
    const tableRef = useRef(null);
    let keys = [];

    const allCharacterKeys = getAllLocalStorageKeys();
    allCharacterKeys.forEach(key => key !== "CCdata" ? keys.push(key) : null);
    keys.sort((a, b) => a.localeCompare(b));

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