/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

export function ConfirmModal({ modalMessage, onClose, onConfirm }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-container">
                    {modalMessage}
                </div>
                <button className="btn-primary" onClick={onConfirm}>Bevestig</button>
                <button className="btn-primary" onClick={onClose}>Annuleren</button>
            </div>
        </div>
    );
};

function ModalMessage({ modalMsg, closeModal }) {
    const msgBlocks = modalMsg.split('\n');
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-container">
                    {msgBlocks.map((block, index) => (
                        <div key={index} className="modal-block">
                            {block === '' ? <br /> : block.match(urlRegex) ? <a target="_blank" rel="noopener noreferrer" href={block}>{block}</a> : block}
                        </div>
                    ))}
                </div>
                <button className="btn-primary" onClick={closeModal}>
                    OK
                </button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>);
}

export default ModalMessage