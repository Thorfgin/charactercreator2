/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from 'prop-types';

ConfirmModal.propTypes = {
    header: PropTypes.string,
    modalMsg: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
};

// Toont een Modal message met een Bevestig/Annuleer knop
export function ConfirmModal({ header, modalMsg, onClose, onConfirm }) {
    const msgBlocks = modalMsg.split('\n');

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>{header}</h3>
                <div className="modal-container">
                    {msgBlocks.map((block, index) => (
                        <div key={index} className="modal-block">
                            {block === '' ? <br /> : block}
                        </div>
                    ))}
                </div>
                <button className="btn-primary" onClick={onConfirm}>Bevestig</button>
                <button className="btn-primary" onClick={onClose}>Annuleren</button>
            </div>
            <span className="close" onClick={onClose}>&times;</span>
        </div>
    );
}

ModalMessage.propTypes = {
    modalMsg: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired
};

// Toont een Modal message met alleen een sluit knop
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