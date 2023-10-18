import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

// Components
import Collapsible from './Collapsible.jsx';

// json
import sourceFAQ from '../json/faq.json';

FAQModal.propTypes = { closeModal: PropTypes.func.isRequired };

// Toont een venster met daar in de meeste gestelde vragen.
// Vragen zijn open/dicht te klappen
export default function FAQModal({ closeModal }) {

    return (
        <div className="modal-overlay">
            <div className="faq-modal">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-modal-block">
                    {sourceFAQ.FAQ.map(({ header, message }) => (
                        <Collapsible
                            key={uuidv4()}
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