import openPage from './openPdf.jsx';
import PropTypes from 'prop-types';

LoreSheet.propTypes = {
    pdf: PropTypes.string.isRequired,
    page: PropTypes.int
};

// Open PDF op basis van loresheet uit de vaardigheden.json
function LoreSheet({ pdf, page }) {

    if (!pdf || pdf === "") {
        <div className="info" />
    }
    else {
        return (
            <div className="info">
                <div className="loresheet-info">
                    <img
                        className="btn-image"
                        title={"Open " + pdf}
                        onClick={() => openPage(pdf, page ? page : 1)}
                        src="./images/img-pdf.png"
                        alt="PDF">
                    </img>
                </div>
            </div>
        )
    }
}

export default LoreSheet;