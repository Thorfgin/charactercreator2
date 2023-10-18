import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

ModalMessage.propTypes = {
    modalMsg: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired
};

// Toont een Modal message met alleen een sluit knop
export default function ModalMessage({ modalMsg, closeModal }) {
    const msgBlocks = modalMsg.split('\n');
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Checken of block als URL omgevormd moet worden
    const getBlock = (block) => block.match(urlRegex) ? <a target="_blank" rel="noopener noreferrer" href={block}>{block}</a> : block

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-container">
                    {msgBlocks.map((block) => (
                        <div key={uuidv4()} className="modal-block">
                            {block === '' ? <br /> : getBlock(block)}
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