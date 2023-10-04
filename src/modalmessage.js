import React from 'react';

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
        </div>);
}

export default ModalMessage