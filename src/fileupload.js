import React from 'react';

function FileUploadModal(closeModal, ruleset_version, setTableData) {
    var selectedFile = null;

    const handleFileChange = (e) => { selectedFile = e.target.files[0]; };

    function handleUpload() {
        if (selectedFile) {
            const reader = new FileReader();


            reader.onload = function (e) {
                const base64Data = e.target.result;

                try {
                    // Decode Base64 content
                    const readableValue = atob(base64Data);
                    var [version, decodedValue] = decodeURIComponent(readableValue).split("|+|");
                    if (version === ruleset_version) {
                        if (decodedValue[0] === "{" || decodedValue[1] === "{") { decodedValue = JSON.parse(decodedValue); }
                        setTableData(decodedValue);
                    }
                    else {
                        setTableData([]);
                    }
                } catch (error) {
                    alert("Er ging iets mis bij het inlezen van het bestand.");
                    console.error("Er ging iets mis bij het inlezen van het bestand:", error);
                }
            };

            reader.readAsText(selectedFile);
            closeModal();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="upload-modal">
                <h2>Upload a File</h2>
                <div className="upload-modal-block">
                    <input type="file" onChange={handleFileChange} />
                </div>
                <div className="upload-modal-block">
                    <button className="btn-primary" onClick={handleUpload}>Upload</button>
                    <button className="btn-primary" onClick={closeModal}>Cancel</button>
                </div>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FileUploadModal;
