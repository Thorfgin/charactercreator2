import PropTypes from 'prop-types';

// Shared
import {
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
} from './SharedObjects.js';

// json
import packageInfo from '../package.json';

/// --- LOCAL STORAGE --- ///

getLocalStorage.propTypes = { key: PropTypes.string.isRequired };

// Get the data stored in the localStorage by Key
export function getLocalStorage(key) {
    if (typeof (Storage) !== "undefined") {
        const storedData = localStorage.getObject(key);
        if (storedData) { return storedData; }
        else { return []; }
    }
    else { return []; }
}

setLocalStorage.propTypes = { key: PropTypes.string.isRequired };

// Store the data in the localStorage by Key
export function setLocalStorage(key, data) {
    if (typeof (Storage) !== "undefined") {
        if (key) {
            if (data) { localStorage.setObject(key, data); }
            else { localStorage.removeItem(key); }
        }
        else {
            console.Error("")
        }
    }
}

/* 
Get all Keys that match the givenKey.
If the givenKey is undefined, instead it returns all keys
*/
export function getAllLocalStorageKeys(givenKey) {
    const keys = []
    if (typeof (Storage) !== "undefined") {
        for (let key in localStorage) {
            // eslint-disable-next-line no-prototype-builtins
            if (localStorage.hasOwnProperty(key)) {
                if (!givenKey) { keys.push(key); }
                else if (givenKey && key === givenKey) { keys.push(key); }
                else {
                    // do nothing
                }
            }
        }
    }
    return keys;
}

/// --- CONVERT DATA TO LATEST FORMAT --- ///

const saveFormat = {
    "version": packageInfo.ruleset_version,
    "name": "",
    "max_xp": 15,
    "is_checked": true,
    "Skills": []
}

const addSkillsToNewFormat = (oldSkills) => {
    const newSkills = [];
    for (const oldSkill of oldSkills) {
        const newSkill = {
            "skill": oldSkill.skill,
            "count": oldSkill.count
        }
        newSkills.push(newSkill);
    }
    return newSkills;
}

convertDataToLatestFormat.propTypes = {
    rawData: PropTypes.array.isRequired,
    key: PropTypes.string,
    name: PropTypes.any,
};

// Converteer oudere versies van de opgeslagen data naar nieuwe formatting
function convertDataToLatestFormat(rawData, key = undefined, name = undefined) {
    let newFormat = { ...saveFormat }

    if (!rawData || rawData?.length === 0) { return newFormat; }
    else if (rawData?.length > 0 && rawData[0]?.ruleset_version === "2023-10") {
        newFormat.name = (name?.trim() !== "") ? name : "Mr/Mrs Smith";
        newFormat.max_xp = rawData[0].MAX_XP;
        newFormat.is_checked = rawData[0].isChecked;
        newFormat.Skills = addSkillsToNewFormat(rawData[0].data);
        if (key) { setLocalStorage(key, newFormat); }
        return newFormat;
    }
    else if (rawData?.version === "2023-10a") { // CURRENT VERSION
        rawData.Skills = addSkillsToNewFormat(rawData.Skills);
        return rawData;
    }
    else {
        console.warn("data version was not recognized", rawData);
    }
}

transformDataToTableData.propTypes = { rawSkills: PropTypes.array.isRequired };

// Transformeer het lijstje met Skills+Count naar tableData-set op basis van vaardigheden.json
function transformDataToTableData(rawSkills) {
    const tableData = [];

    const getData = (source, rawSkill) => {
        if (!rawSkill) { return; }
        const skill = source.find((record) => record.skill?.toLowerCase() === rawSkill.skill?.toLowerCase());
        if (skill) {
            const updatedSkill = { ...skill };
            updatedSkill.count = rawSkill.count > updatedSkill.maxcount ? updatedSkill.maxcount : rawSkill.count;
            updatedSkill.xp = rawSkill.count > 1 ? updatedSkill.xp * rawSkill.count : updatedSkill.xp;
            tableData.push(updatedSkill);
        }
    }

    if (rawSkills?.length > 0) {
        for (const rawSkill of rawSkills) {
            const isBasicSkill = sourceBasisVaardigheden.some((record) => record.skill?.toLowerCase() === rawSkill.skill?.toLowerCase());
            if (isBasicSkill) { getData(sourceBasisVaardigheden, rawSkill) }
            else { getData(sourceExtraVaardigheden, rawSkill) }
        }
    }
    return tableData;
}

/// --- DATA in LOCAL STORAGE --- ///

saveCharacterToStorage.propTypes = {
    key: PropTypes.string.isRequired,
    name: PropTypes.string,
    is_checked: PropTypes.bool.isRequired,
    max_xp: PropTypes.number.isRequired,
    data: PropTypes.array.isRequired,
};

// Sla het Character op in de local Storage.
// Converteer naar juiste Format, 
export function saveCharacterToStorage(key, name, is_checked, max_xp, data) {
    let newFormat = { ...saveFormat }
    newFormat.name = name;
    newFormat.max_xp = max_xp;
    newFormat.is_checked = is_checked;
    newFormat.Skills = data;

    const convertedData = convertDataToLatestFormat(newFormat, key, name);
    setLocalStorage(key, convertedData);
}

loadCharacterFromStorage.propTypes = { key: PropTypes.string.isRequired }

// Laad het Character in uit de local Storage.
// Converteer naar juiste Format, 
export function loadCharacterFromStorage(key) {
    const rawData = getLocalStorage(key)
    const convertedData = convertDataToLatestFormat(rawData, key);
    convertedData.Skills = transformDataToTableData(convertedData.Skills);
    return convertedData;
}

removeCharacterFromStorage.propTypes = { key: PropTypes.string.isRequired }

// Verwijderen van Character uit local Storage
export function removeCharacterFromStorage(key) {
    const keys = getAllLocalStorageKeys(key);
    if (keys?.length > 0) {
        setLocalStorage(key, null);
        return true;
    }
    else { return false; }
}

/// --- PRESETS --- ///

// Laad het Character in uit de Presets.
// Converteer naar juiste Format, 
export function loadCharacterFromPreset(preset) {
    const convertedData = convertDataToLatestFormat(preset);
    convertedData.Skills = transformDataToTableData(convertedData.Skills);
    return convertedData;
}

/// --- IMPORT / EXPORT --- ///

exportCharacterToFile.propTypes = {
    name: PropTypes.string.isRequired,
    is_checked: PropTypes.bool.isRequired,
    max_xp: PropTypes.number.isRequired,
    data: PropTypes.array.isRequired
}

export function exportCharacterToFile(name, is_checked, max_xp, data) {
    if (data.length > 0) {
        let newFormat = { ...saveFormat }
        newFormat.name = name;
        newFormat.max_xp = max_xp;
        newFormat.is_checked = is_checked;
        newFormat.Skills = addSkillsToNewFormat(data);

        const value = JSON.stringify(newFormat);
        const encodedValue = encodeURIComponent(value);
        const unreadableValue = btoa(encodedValue);
        const blob = new Blob([unreadableValue], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const downloadName = name !== "" ? name : "character";
        a.download = `VA_${downloadName}.dat`;
        a.click();
        // Opruimen na download
        URL.revokeObjectURL(url);
    }
}

// Converteer naar juiste Format, Laad het Character in uit het opgeleverde bestand
export function importCharacterFromFile(rawData) {
    try {
        const readableValue = atob(rawData);
        let decodedValue = decodeURIComponent(readableValue);
        let charData = JSON.parse(decodedValue);

        const convertedData = convertDataToLatestFormat(charData);
        convertedData.Skills = transformDataToTableData(convertedData.Skills);
        return convertedData;
    }
    catch { return undefined; }
}