import { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// components
import { defaultProperties } from './SharedObjects.js';
import { loadCharacterFromStorage } from './SharedStorage.js';

// json
import packageInfo from '../package.json';

/// --- PREP LOCALSTORAGE DATA --- ///
let rawData = null;

if (typeof (Storage) !== "undefined") {
    Storage.prototype.setObject = function (key, value) {
        if (!key || !value) { return; }
        if (typeof value === "object") { value = JSON.stringify(value); }
        let encodedValue = encodeURIComponent(value);
        let unreadableValue = btoa(encodedValue);
        localStorage.setItem(key, unreadableValue);
    }

    // Op dit moment wordt alleen de versie uitgelezen. Afwijkende versie nummers worden vooralsnog niet getoond.
    Storage.prototype.getObject = function (key) {
        if (!key) { return; }
        let value = this.getItem(key);
        if (!value) { return; }
        let readableValue = atob(value);
        let decodedValue = decodeURIComponent(readableValue);
        if (decodedValue?.length >= 0) {
            if (decodedValue[0] === "{" || decodedValue[1] === "{") { decodedValue = JSON.parse(decodedValue); }
            return decodedValue;
        }
        else {
            return [];
        }
    }

    // Fetch data before the page is loaded
    rawData = loadCharacterFromStorage('CCdata');
}

/// --- PREP INITIAL TABLE DATA --- ///
const getInitialData = () => { return rawData?.Skills ? rawData?.Skills : []; }
const getInitialXP = () => { return rawData?.max_xp ? rawData.max_xp : 15; }
const getInitialCheckState = () => { return rawData?.is_checked === true; }
const getInitialName = () => { return rawData?.name ? rawData.name : ""; }

/// --- SHARED STATE --- ///
let SharedStateContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useSharedState() {
    const context = useContext(SharedStateContext);
    if (context === undefined) { throw new Error('useSharedState must be used within a SharedStateProvider'); }
    return context;
}

SharedStateProvider.propTypes = { children: PropTypes.any.isRequired };

export function SharedStateProvider({ children }) {
    const [version] = useState(packageInfo.version);
    const [ruleset_version] = useState(packageInfo.ruleset_version);
    const [creator] = useState(packageInfo.creator);
    const [tableData, setTableData] = useState(getInitialData());
    const [isChecked, setIsChecked] = useState(getInitialCheckState());
    const [MAX_XP, setMAX_XP] = useState(getInitialXP());
    const [charName, setCharName] = useState(getInitialName());
    const [selectedBasicSkill, setSelectedBasicSkill] = useState("");
    const [selectedExtraSkill, setSelectedExtraSkill] = useState("");

    const [modalMsg, setModalMsg] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [showReleaseNotesModal, setShowReleaseNotesModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLoadCharacterModal, setShowLoadCharacterModal] = useState(false);
    const [showLoadPresetModal, setShowLoadPresetModal] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
    const [headerConfirmModal, setHeaderConfirmModal] = useState("");
    const [msgConfirmModal, setMsgConfirmModal] = useState("");

    const [gridEigenschappen, setGridEigenschappen] = useState([defaultProperties[0], defaultProperties[1]]);
    const [gridEnergiePerDag, setGridEnergiePerDag] = useState([]);
    const [gridSpreuken, setGridSpreuken] = useState([]);
    const [gridRecepten, setGridRecepten] = useState([]);

    const sharedStateValues = useMemo(() => ({
        version,
        ruleset_version,
        creator,

        isChecked, setIsChecked,
        MAX_XP, setMAX_XP,
        charName, setCharName,
        selectedBasicSkill, setSelectedBasicSkill,
        selectedExtraSkill, setSelectedExtraSkill,

        tableData, setTableData,

        modalMsg, setModalMsg,
        showModal, setShowModal,
        showFAQModal, setShowFAQModal,
        showReleaseNotesModal, setShowReleaseNotesModal,
        showUploadModal, setShowUploadModal,
        showLoadCharacterModal, setShowLoadCharacterModal,
        showLoadPresetModal, setShowLoadPresetModal,
        showConfirmRemoveModal, setShowConfirmRemoveModal,
        showConfirmUpdateModal, setShowConfirmUpdateModal,
        headerConfirmModal, setHeaderConfirmModal,
        msgConfirmModal, setMsgConfirmModal,

        gridEigenschappen, setGridEigenschappen,
        gridEnergiePerDag, setGridEnergiePerDag,
        gridSpreuken, setGridSpreuken,
        gridRecepten, setGridRecepten
    }), [
        version,
        ruleset_version,
        creator,

        isChecked, setIsChecked,
        MAX_XP, setMAX_XP,
        charName, setCharName,
        selectedBasicSkill, setSelectedBasicSkill,
        selectedExtraSkill, setSelectedExtraSkill,

        tableData, setTableData,

        modalMsg, setModalMsg,
        showModal, setShowModal,
        showFAQModal, setShowFAQModal,
        showReleaseNotesModal, setShowReleaseNotesModal,
        showUploadModal, setShowUploadModal,
        showLoadCharacterModal, setShowLoadCharacterModal,
        showLoadPresetModal, setShowLoadPresetModal,
        showConfirmRemoveModal, setShowConfirmRemoveModal,
        showConfirmUpdateModal, setShowConfirmUpdateModal,
        headerConfirmModal, setHeaderConfirmModal,
        msgConfirmModal, setMsgConfirmModal,

        gridEigenschappen, setGridEigenschappen,
        gridEnergiePerDag, setGridEnergiePerDag,
        gridSpreuken, setGridSpreuken,
        gridRecepten, setGridRecepten
    ]);

    return (
        <SharedStateContext.Provider value={sharedStateValues}>
            {children}
        </SharedStateContext.Provider>
    );
}