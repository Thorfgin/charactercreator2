import PropTypes from 'prop-types';

// components
import Tooltip from './Tooltip.jsx';
import openPage from '../openPdf.jsx';

getTooltip.propTypes = {
    skill: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    page: PropTypes.number,
};
function getTooltip(skill, name, type, page) {
    let isSpell = false;
    let isRecipe = false;

    if (type === "grid-spreuken") { isSpell = true; }
    else if (type === "grid-recepten") { isRecipe = true; }
    else { console.Error("Type was not recognized") }

    return (
        <div className="grid-spreuk-icons">
            <Tooltip
                skillName={skill}
                itemName={name}
                isSpell={isSpell}
                isRecipe={isRecipe}
                isSkill={false} />
            {isSpell &&
                page && (
                    <img
                        className="btn-image"
                        title={"Open Spreuken.pdf - pagina " + page}
                        onClick={() => openPage('Spreuken.pdf', page)}
                        src="./images/img-pdf.png"
                        alt="PDF">
                    </img>
                )}
        </div>
    )
}

GenericTooltipItem.propTypes = {
    skill: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    page: PropTypes.number,
};

// Generiek aanmaken van een tooltip knop op basis van type
export default function GenericTooltipItem({ skill, name, text, type, page }) {
    let result = <div></div>;
    if (type === "grid-spreuken") { result = getTooltip(skill, name, type, page); }
    if (type === "grid-recepten") { result = getTooltip(skill, name, type); }

    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + text}</div>
            {result}
        </div>
    );
}