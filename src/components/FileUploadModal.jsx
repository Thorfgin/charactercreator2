import { useState } from 'react';
import PropTypes from 'prop-types';

// shared
import { useSharedState } from '../SharedStateContext.jsx';
import { importCharacterFromFile } from '../SharedStorage.js';

FileUploadModal.propTypes = { closeModal: PropTypes.func.isRequired };

export default function FileUploadModal({ closeModal }) {

    const {
        setCharName,
        setIsChecked,
        setMAX_XP, 
        setTableData 
    } = useSharedState();

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
                        const charData = importCharacterFromFile(rawData);
                        if (charData) {
                            setCharName(charData.name || "Mr/Mrs Smith");
                            setIsChecked(charData.is_checked);
                            setMAX_XP(charData.max_xp);
                            setTableData(charData.Skills);
                            closeModal();

                            setSelectedFile(null);
                        }
                        else {
                            const msg = "Deze versie van dit personage kan helaas niet ingeladen worden.";
                            alert(msg);
                            console.error(msg, selectedFile, charData);
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
    }

    return (
        <div className="modal-overlay">
            <div className="upload-modal">
                <h3>Upload een Bestand</h3>
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