import PropTypes from 'prop-types';

// componenets
import Tooltip from './Tooltip.jsx';

// shared
import { openPdfPage } from '../SharedActions.js';

import {
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
} from '../SharedObjects.js';


InfoTooltip.propTypes = { row: PropTypes.any.isRequired };

// Plaats Info in de kolom
export default function InfoTooltip({ row }) {
    let currentItem = sourceBasisVaardigheden.find((record) => record.id === row.original.id);
    if (!currentItem) { currentItem = sourceExtraVaardigheden.find((record) => record.id === row.original.id); }

    return (
        <div className="info">
            <div className="acties-info">
                <Tooltip
                    skillName={currentItem.skill}
                    isSpell={false}
                    isRecipe={false}
                    isSkill={true}
                />
                <img
                    className="btn-image"
                    title={"Open Vaardigheden.pdf - pagina " + currentItem.page}
                    onClick={() => openPdfPage('Vaardigheden.pdf', currentItem.page)}
                    src="./images/img-pdf.png"
                    alt="PDF">
                </img>
            </div>
        </div>
    )
}
