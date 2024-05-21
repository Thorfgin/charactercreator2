import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

ConfirmModal.propTypes = {
    header: PropTypes.string,
    modalMsg: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
};

// Toont een Modal message met een Bevestig/Annuleer knop
export default function ConfirmModal({ header, modalMsg, closeModal, onConfirm}) {
    const msgBlocks = modalMsg.split('\n');

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{header}</h3>
                <div className="modal-container">
                    {msgBlocks.map((block) => (
                        <div key={uuidv4()} className="modal-block">
                            {block === '' ? <br /> : block}
                        </div>
                    ))}
                </div>
                <button className="btn-primary" onClick={onConfirm}>Bevestig</button>
                <button className="btn-primary" onClick={closeModal}>Annuleren</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}
