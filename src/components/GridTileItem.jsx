import PropTypes from 'prop-types';

// components
import {
    SpellTooltip,
    RecipeTooltip
} from './Tooltip.jsx';

SpellTile.propTypes = {
    skillName: PropTypes.string.isRequired,
    spellName: PropTypes.string.isRequired,
    page: PropTypes.number,
};

export function SpellTile({ skillName, spellName, page=1 }) {
    return (

        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + spellName}</div>
            <div className="grid-spreuk-icons">
                <SpellTooltip
                    skillName={skillName}
                    spellName={spellName}
                    page={page}
                />
            </div>
        </div>
    );
}

RecipeTile.propTypes = {
    skillName: PropTypes.string.isRequired,
    recipeName: PropTypes.string.isRequired,
};

export function RecipeTile({ skillName, recipeName }) {
    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + recipeName}</div>
            <div className="grid-spreuk-icons">
                <RecipeTooltip
                    skillName={skillName}
                    recipeName={recipeName}
                />
            </div>
        </div>
    );
}