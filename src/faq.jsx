import PropTypes from 'prop-types';
import Collapsible from './collapsible.jsx';

FAQModal.propTypes = {
    closeModal: PropTypes.object.isRequired,
};

// Toont een venster met daar in de meeste gestelde vragen.
// Vragen zijn open/dicht te klappen

function FAQModal({ closeModal }) {

    return (
        <div className="modal-overlay">
            <div className="faq-modal">
                <h3>Frequently Asked Questions</h3>
                <Collapsible
                    header={"Open"}
                    message={"This is a collapsible content"}
                />
                <div><br/></div>
                <button className="btn-primary" onClick={closeModal}>Sluiten</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FAQModal;
