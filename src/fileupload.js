import React, { useState } from 'react';

function FileUploadModal({ closeModal, ruleset_version, setCharName, setIsChecked, setMAX_XP, setTableData }) {
    const [selectedFile, setSelectedFile] = useState(null);

    // Werk bestand info mbij
    const handleFileChange = (e) => { setSelectedFile(e.target.files[0]); };

    // Oppakken van het aangewezen bestand, uitlezen en nakijken of het matcht.
    // Daarna de juiste velden en tabel updaten.
    function handleUpload() {
        if (selectedFile) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const rawData = e.target.result;
                try {
                    if (rawData) {
                        const readableValue = atob(rawData);
                        var decodedValue = decodeURIComponent(readableValue);
                        var charData = JSON.parse(decodedValue)[0];
                        if (charData &&
                            charData.ruleset_version &&
                            charData.ruleset_version === ruleset_version) {
                            if (selectedFile.name.includes('VA_') && selectedFile.name.includes(".dat"))
                            {
                                const startIndex = selectedFile.name.indexOf("VA_") + 3;
                                const endIndex = selectedFile.name.indexOf(".dat");
                                const cleanedName = selectedFile.name.substring(startIndex, endIndex);
                                setCharName(cleanedName);
                            }
                            setIsChecked(charData.isChecked);
                            setMAX_XP(charData.MAX_XP);
                            setTableData(charData.data);
                            closeModal();
                        }
                        else {
                            alert("De regelset versie van het personage wordt niet herkend.");
                            console.error("De regelset versie van het personage wordt niet herkend.");
                        }
                    }
                } catch (error) {
                    alert("Er ging iets mis bij het inlezen van het bestand.");
                    console.error("Er ging iets mis bij het inlezen van het bestand:", error);
                }
            };

            reader.readAsText(selectedFile);
            closeModal();

            setSelectedFile(null);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="upload-modal">
                <h2>Upload een Bestand</h2>
                <div className="upload-modal-block">
                    <input type="file" onChange={handleFileChange} />
                </div>
                <div className="upload-modal-block">
                    <button className="btn-primary" onClick={handleUpload}>Upload</button>
                    <button className="btn-primary" onClick={closeModal}>Annuleren</button>
                </div>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FileUploadModal;
