import PropTypes from 'prop-types';

// TODO: Create a collapsable Q&A

FAQModal.propTypes = {
    closeModal: PropTypes.object.isRequired,
};

function FAQModal({ closeModal }) {

    return (
        <div className="modal-overlay">
            <div className="faq-modal">
                <h2>Frequently Asked Questions</h2>
                    <button className="btn-primary" onClick={closeModal}>Sluiten</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FAQModal;
