import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { defaultProperties } from './SharedObjects.js';
import { getLocalStorage } from './SharedActions.js';
import packageInfo from '../package.json';

/// --- PREP LOCALSTORAGE DATA --- ///
let rawData = null;

if (typeof (Storage) !== "undefined") {
    Storage.prototype.setObject = function (key, value) {
        if (!key || !value) { return; }
        if (typeof value === "object") { value = JSON.stringify(value); }
        var encodedValue = encodeURIComponent(value);
        var unreadableValue = btoa(encodedValue);
        localStorage.setItem(key, unreadableValue);
    }

    // Op dit moment wordt alleen de versie uitgelezen. Afwijkende versie nummers worden vooralsnog niet getoond.
    Storage.prototype.getObject = function (key) {
        if (!key) { return; }
        var value = this.getItem(key);
        if (!value) { return; }
        var readableValue = atob(value);
        var decodedValue = decodeURIComponent(readableValue);
        if (decodedValue && decodedValue.length >= 0) {
            if (decodedValue[0] === "{" || decodedValue[1] === "{") { decodedValue = JSON.parse(decodedValue); }
            return decodedValue;
        }
        else {
            return [];
        }
    }

    // Fetch data before the page is loaded
    rawData = getLocalStorage('CCdata');
}

/// --- PREP INITIAL TABLE DATA --- ///
function getInitialData(hasData, hasXP, wasChecked) {
    if (rawData && rawData.length > 0) {
        const charData = rawData[0]
        if (charData &&
            charData.ruleset_version &&
            charData.ruleset_version === packageInfo.ruleset_version) {

            if (hasData) { return charData.data; }
            if (hasXP) { return charData.MAX_XP }
            if (wasChecked) { return charData.isChecked }
        }
    }
    else {
        if (hasData) { return [] }
        if (hasXP) { return 15 }
        if (wasChecked) { return true }
    }
}

/// --- SHARED STATE --- ///
let SharedStateContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useSharedState() {
    const context = useContext(SharedStateContext);
    if (context === undefined) { throw new Error('useSharedState must be used within a SharedStateProvider'); }

    return context;
}

SharedStateProvider.propTypes = {
    children: PropTypes.any.isRequired
};

export function SharedStateProvider({ children }) {
    const [version, setVersion] = useState(packageInfo.version);
    const [ruleset_version, setRuleset_Version] = useState(packageInfo.ruleset_version);
    const [creator, setCreator] = useState(packageInfo.creator);
    const [tableData, setTableData] = useState(getInitialData(true, false, false));
    const [isChecked, setIsChecked] = useState(getInitialData(false, false, true));
    const [MAX_XP, setMAX_XP] = useState(getInitialData(false, true, false));
    const [totalXP, setTotalXP] = useState(0);
    const [charName, setCharName] = useState("");
    const [selectedBasicSkill, setSelectedBasicSkill] = useState("");
    const [selectedExtraSkill, setSelectedExtraSkill] = useState("");

    const [modalMsg, setModalMsg] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLoadCharacterModal, setShowLoadCharacterModal] = useState(false);
    const [showLoadPresetModal, setShowLoadPresetModal] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
    const [headerConfirmModal, setHeaderConfirmModal] = useState("");
    const [msgConfirmModal, setMsgConfirmModal] = useState("");
    

    const [gridEigenschappen, setGridEigenschappen] = useState([defaultProperties[0], defaultProperties[1]]);
    const [gridSpreuken, setGridSpreuken] = useState([]);
    const [gridRecepten, setGridRecepten] = useState([]);

    return (
        <SharedStateContext.Provider value={{
            version,
            ruleset_version, 
            creator,

            isChecked, setIsChecked,
            MAX_XP, setMAX_XP,
            totalXP, setTotalXP,
            charName, setCharName,
            selectedBasicSkill, setSelectedBasicSkill,
            selectedExtraSkill, setSelectedExtraSkill,

            tableData, setTableData,

            modalMsg, setModalMsg,
            showModal, setShowModal,
            showFAQModal, setShowFAQModal,
            showUploadModal, setShowUploadModal,
            showLoadCharacterModal, setShowLoadCharacterModal,
            showLoadPresetModal, setShowLoadPresetModal,
            showConfirmRemoveModal, setShowConfirmRemoveModal,
            showConfirmUpdateModal, setShowConfirmUpdateModal,
            headerConfirmModal, setHeaderConfirmModal,
            msgConfirmModal, setMsgConfirmModal,

            gridEigenschappen, setGridEigenschappen,
            gridSpreuken, setGridSpreuken,
            gridRecepten, setGridRecepten
        }}>
            {children}
        </SharedStateContext.Provider>
    );
}