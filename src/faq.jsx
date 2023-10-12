import PropTypes from 'prop-types';
import Collapsible from './collapsible.jsx';
import sourceFAQ from './json/faq.json';

FAQModal.propTypes = {
    closeModal: PropTypes.func.isRequired
};

// Toont een venster met daar in de meeste gestelde vragen.
// Vragen zijn open/dicht te klappen
function FAQModal({ closeModal }) {

    return (
        <div className="modal-overlay">
            <div className="faq-modal">
                <h3>Frequently Asked Questions</h3>
                    <div className="faq-modal-block">
                    {sourceFAQ.FAQ.map(({ header, message }, index) => (
                            <Collapsible
                                key={index}
                                className="modal-block"
                                header={header}
                                message={message}
                            />
                        ))}
                    </div>
                <div><br /></div>
                <button className="btn-primary" onClick={closeModal}>Sluiten</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FAQModal;
