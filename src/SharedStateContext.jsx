import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { getLocalStorage } from './localstorage.jsx';
import packageInfo from '../package.json';

/// --- GRID PROPERTIES --- ///
export const defaultProperties = [
    { name: "hitpoints", image: "./images/image_hp.png", text: "Totaal HP", value: 1 },
    { name: "armourpoints", image: "./images/image_ap.png", text: "Max AP", value: 0 },
    { name: "elemental_mana", image: "./images/image_em.png", text: "Elementaire Mana", value: 0 },
    { name: "elemental_ritual_mana", image: "./images/image_erm.png", text: "Rituele Elementaire Mana", value: 0 },
    { name: "spiritual_mana", image: "./images/image_sm.png", text: "Spirituele Mana", value: 0 },
    { name: "spiritual_ritual_mana", image: "./images/image_srm.png", text: "Rituele Spirituele Mana", value: 0 },
    { name: "inspiration", image: "./images/image_ins.png", text: "Inspiratie", value: 0 },
    { name: "willpower", image: "./images/image_wil.png", text: "Wilskracht", value: 0 },
    { name: "glyph_craft_cap", image: "./images/image_glp_cra.png", text: "Glyph Craft cap", value: 0 },
    { name: "glyph_imbue_cap", image: "./images/image_glp_imb.png", text: "Glyph Imbue cap", value: 0 },
    { name: "rune_craft_cap", image: "./images/image_run_cra.png", text: "Rune Craft cap", value: 0 },
    { name: "rune_imbue_cap", image: "./images/image_run_imb.png", text: "Rune Imbue cap", value: 0 }
];

const gridData = [defaultProperties[0], defaultProperties[1]];

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

export function useSharedState() {
    const context = useContext(SharedStateContext);
    if (context === undefined) { throw new Error('useSharedState must be used within a SharedStateProvider'); }

    return context;
}

SharedStateProvider.propTypes = {
    children: PropTypes.any.isRequired
};

export function SharedStateProvider({ children }) {
    const [tableData, setTableData] = useState(getInitialData(true, false, false));
    const [isChecked, setIsChecked] = useState(getInitialData(false, false, true));
    const [MAX_XP, setMAX_XP] = useState(getInitialData(false, true, false));
    const [totalXP, setTotalXP] = useState(0);
    const [charName, setCharName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLoadCharacterModal, setShowLoadCharacterModal] = useState(false);
    const [showLoadPresetModal, setShowLoadPresetModal] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const [gridEigenschappen, setGridEigenschappen] = useState(gridData);
    const [gridSpreuken, setGridSpreuken] = useState([]);
    const [gridRecepten, setGridRecepten] = useState([]);



    return (
        <SharedStateContext.Provider value={{
            tableData, setTableData,
            isChecked, setIsChecked,
            MAX_XP, setMAX_XP,
            totalXP, setTotalXP,
            charName, setCharName,
            showModal, setShowModal,
            showFAQModal, setShowFAQModal,
            showUploadModal, setShowUploadModal,
            showLoadCharacterModal, setShowLoadCharacterModal,
            showLoadPresetModal, setShowLoadPresetModal,
            modalMsg, setModalMsg,
            gridEigenschappen, setGridEigenschappen,
            gridSpreuken, setGridSpreuken,
            gridRecepten, setGridRecepten
        }}>
            {children}
        </SharedStateContext.Provider>
    );
}