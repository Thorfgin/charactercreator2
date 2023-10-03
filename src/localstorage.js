export function getLocalStorage(key) {
    if (typeof (Storage) !== "undefined") {
        const storedData = localStorage.getObject(key);
        if (storedData) { return storedData; }
        else { return []; }
    }
    else { return []; };
}

export function setLocalStorage(key, data) {
    if (typeof (Storage) !== "undefined") {
        if (data && data.length > 0) { localStorage.setObject(key, data); }
        else { localStorage.removeItem(key); }
    }
}

export function getAllLocalStorageKeys(keyPattern) {
    const keys = []
    if (typeof (Storage) !== "undefined") {
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                if (!keyPattern) { keys.push(key); }
                else if (keyPattern && key.includes(keyPattern)) { keys.push(key); }
                else { } // do nothing
            }
        }
    }
    return keys;
}
