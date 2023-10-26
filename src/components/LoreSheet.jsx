import PropTypes from 'prop-types';

// shared
import { openPdfPage } from '../SharedActions.js';

LoreSheet.propTypes = {
    pdf: PropTypes.string,
    page: PropTypes.number
};

// Open PDF op basis van loresheet uit de vaardigheden.json
export default function LoreSheet({ pdf, page }) {
    if (!pdf || pdf === "") { return (<div className="info" />); }
    else {
        return (
            <div className="info">
                <div className="loresheet-info">
                    <img
                        className="btn-image"
                        title={"Open " + pdf}
                        onClick={() => openPdfPage(pdf, page || 1)}
                        src="./images/img-pdf.png"
                        alt="PDF">
                    </img>
                </div>
            </div>
        )
    }
}