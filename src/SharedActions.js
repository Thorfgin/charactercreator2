/// --- LOCAL STORAGE --- ///

// Get the data stored in the localStorage by Key
export function getLocalStorage(key) {
    if (typeof (Storage) !== "undefined") {
        const storedData = localStorage.getObject(key);
        if (storedData) { return storedData; }
        else { return []; }
    }
    else { return []; }
}

// Store the data in the localStorage by Key
export function setLocalStorage(key, data) {
    if (typeof (Storage) !== "undefined") {
        if (data && data.length > 0) {
            localStorage.setObject(key, data);
        }
        else { localStorage.removeItem(key); }
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

/// --- SELECT --- ///

// Bewust verborgen. Exports worden verderop geregeld.
// Ophalen van de skills uit vaardigheden/spreuken/recepten
export function generateOptions(source) {
    return source.map((record) => ({
        value: record.skill,
        label: `${record.skill} (${record.xp} xp)`
    }));
}

// Bewust verborgen. Exports worden verderop geregeld.
// Ophalen van de skills uit vaardigheden/spreuken/recepten, minus geselecteerde skills
export function regenerateOptions(source, tableData) {
    return source.map((record) => ({
        value: record.skill,
        label: `${record.skill} (${record.xp} xp)`
    })).filter((currentSkill) =>
        !tableData.some((record) =>
            record.skill.toLowerCase() === currentSkill.value.toLowerCase()
        )
    );
}

