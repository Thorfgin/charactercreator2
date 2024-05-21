import PropTypes from 'prop-types';

// components
import {
    SpellTooltip,
    RecipeTooltip
} from './Tooltip.jsx';

import {
    getSpellBySkill,
    getRecipyBySkill
} from '../SharedActions.js';

SpellTile.propTypes = {
    skillId: PropTypes.number.isRequired,
    spellId: PropTypes.number.isRequired
};

export function SpellTile({ skillId, spellId }) {
    const spell = getSpellBySkill(skillId, spellId);

    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + spell.spell}</div>
            <div className="grid-spreuk-icons">
                <SpellTooltip
                    skillId={skillId}
                    spellId={spellId}
                />
            </div>
        </div>
    );
}

RecipeTile.propTypes = {
    skillId: PropTypes.number.isRequired,
    recipyId: PropTypes.number.isRequired,
};

export function RecipeTile({ skillId, recipyId }) {
    const recipy = getRecipyBySkill(skillId, recipyId);

    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + recipy.recipy}</div>
            <div className="grid-spreuk-icons">
                <RecipeTooltip
                    skillId={skillId}
                    recipyId={recipyId}
                />
            </div>
        </div>
    );
}