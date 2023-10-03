import React, { useState } from 'react';

const Toolbar = ({ isChecked, totalXP, MAX_XP, handleCheckboxChange, handleInputChange, showDisclaimer }) => {

    return (
        <div className="select-settings">
            <div className="settings-personage">
                <label className="settings-label">
                    Nieuw personage:
                </label>
                <input className="settings-checkbox"
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />{' '}
            </div>
            <div className="settings-XP">
                <div>
                    <label>
                        Max XP:
                    </label>
                    <input className="settings-input-xp"
                        type="number"
                        value={MAX_XP}
                        min={1}
                        max={100}
                        onChange={handleInputChange}
                        disabled={isChecked}
                        step={0.25}
                    />
                </div>
                <div>
                    <label>
                        XP over:
                    </label>
                    <input className="settings-input-xp"
                        type="number"
                        value={MAX_XP - totalXP}
                        min={1}
                        max={100}
                        disabled={true}
                    />
                </div>
            </div>
            <div className="settings-btns">
                <div className="settings-btns-row">
                    <button className="btn-toolbar" title="Personage opslaan" onClick={showDisclaimer}>
                        <img className="btn-image" src="./images/button_save.png" alt="Save Button" />
                    </button>
                    <button className="btn-toolbar" title="Laad personage" onClick={showDisclaimer}>
                        <img className="btn-image" src="./images/button_load.png" alt="Load Button" />
                    </button>
                    <button className="btn-toolbar" title="Verwijder personage" onClick={showDisclaimer}>
                        <img className="btn-image" src="./images/button_trash.png" alt="Trash Button" />
                    </button>
                </div>
                <div className="btns-row">
                    <button className="btn-toolbar" title="Lokaal opslaan" onClick={showDisclaimer}>
                        <img className="btn-image" src="./images/button_download.png" alt="Download Button" />
                    </button>
                    <button className="btn-toolbar" title="Lokaal laden" onClick={showDisclaimer}>
                        <img className="btn-image" src="./images/button_upload.png" alt="Upload Button" />
                    </button>
                    <button className="btn-toolbar" title="Exporteer naar PDF" onClick={showDisclaimer}>
                        <img className="btn-image" src="./images/button_export-pdf.png" alt="Export PDF Button" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Toolbar;
