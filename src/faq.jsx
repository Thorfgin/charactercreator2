import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Collapsible from './collapsible.jsx';
import { useSourceFAQ } from './getpublicjson.jsx'

FAQModal.propTypes = {
    closeModal: PropTypes.func.isRequired
};

// Toont een venster met daar in de meeste gestelde vragen.
// Vragen zijn open/dicht te klappen
function FAQModal({ closeModal }) {
    const [faqData, setFaqData] = useState(null);
    
    useEffect(() => {
        useSourceFAQ()
            .then(data => setFaqData(data))
            .catch(error => console.error('Error fetching FAQ data:', error));
    }, []);;

    return (
        <div className="modal-overlay">
            <div className="faq-modal">
                <h3>Frequently Asked Questions</h3>
                {faqData ? (
                    <div className="faq-modal-block">
                        {faqData.FAQ.map(({ header, message }, index) => (
                            <Collapsible
                                key={index}
                                className="modal-block"
                                header={header}
                                message={message}
                            />
                        ))}
                    </div>) : (
                    <div>
                        <img sec="./images/loading.if" title="loading" alt="loading" />
                    </div>)}
                <div><br /></div>
                <button className="btn-primary" onClick={closeModal}>Sluiten</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FAQModal;
