import { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

// shared
import {
    openPdfPage,
    getSkillById,
    getSpellBySkill,
    getRecipyBySkill
} from '../SharedActions.js'

import {
    teacherSkill
} from '../SharedConstants.js'

// Converteer teksten naar tekstblokken.
const getBlock = (text, className) => {
    if (!text) { return <div key={uuidv4()} className={className || 'error'}> </div> }
    let descriptionBlock = text.split('\\n');
    const description = descriptionBlock.map((block) => (
        <div key={uuidv4()} className={className}> {block === '' ? <br /> : block} </div>
    ));
    return description;
}

// Map items uit een block
const getMapping = (tooltipData) => {
    return tooltipData.map((item) => {
        const uniqueKey = uuidv4();
        const label = item.label;
        const value = item.value;

        return (
            <tr key={uniqueKey}>
                {label ? <td className="tooltip-property">{label + ":"}</td> : null}
                <td className="tooltip-value">{value}</td>
            </tr>
        );
    })
}

InfoTooltip.propTypes = { row: PropTypes.any.isRequired };

// Plaats Info in de kolom
export function InfoTooltip({ row }) {
    let currentItem = getSkillById(row.original.id);

    return (
        <div className="info">
            <div className="acties-info">
                <SkillTooltip id={currentItem.id} />
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

SkillTooltip.propTypes = {
    id: PropTypes.number.isRequired,
    image: PropTypes.string
};

export function SkillTooltip({ id, image = './images/img-info.png' }) {

    const sourceSkill = getSkillById(id);
    let fullRequirementsBlock = "";

    function formatList(items) { return items.join(', \\n'); }

    function getSkillNames(reqSkillIds) {
        const reqSkills = [];
        if (reqSkillIds && reqSkillIds.length > 0) {
            for (const reqSkillId of reqSkillIds) {
                const reqSkill = getSkillById(reqSkillId).skill;
                reqSkills.push(reqSkill);
            }
        }
        return reqSkills;
    }

    // Check skills
    const reqSkills = getSkillNames(sourceSkill.Requirements.skill);
    if (reqSkills.length > 0) { fullRequirementsBlock += formatList(reqSkills); }

    // Exception - "Leermeester Expertise"
    if (sourceSkill.id === teacherSkill) { fullRequirementsBlock += "1 Extra vaardigheid"; }

    // Check any_list
    const reqAny = getSkillNames(sourceSkill.Requirements.any_list);
    if (reqAny.length > 0) { fullRequirementsBlock += `Een van de volgende: \\n${formatList(reqAny)}`; }

    // Check category
    const reqCategory = sourceSkill.Requirements.Category;
    if (reqCategory && reqCategory.name.length > 0) {
        fullRequirementsBlock += `${reqCategory.value} xp in de volgende categorie(n): \\n${formatList(reqCategory.name)}`;
    }

    const tooltipData = [
        { label: 'XP kosten', value: sourceSkill.xp },
        { label: 'Vereisten', value: getBlock(fullRequirementsBlock, "requirements-block") },
        { label: 'Omschrijving', value: getBlock(sourceSkill.description, "description-block") },
    ];

    const tooltipItems = getMapping(tooltipData);

    return GenericTooltip({
        header: `Vaardigheid: ${sourceSkill?.skill || null}`,
        message: tooltipItems || null,
        image: image
    });
}

SpellTooltip.propTypes = {
    skillId: PropTypes.number.isRequired,
    spellId: PropTypes.number.isRequired,
    image: PropTypes.string
};

export function SpellTooltip({ skillId, spellId, image = './images/img-info.png' }) {

    const sourceSkill = getSkillById(skillId);
    const sourceSpell = getSpellBySkill(skillId, spellId);
    const description = getBlock(sourceSpell?.description, "description-block");

    const tooltipData = [
        { label: 'Energie kosten', value: sourceSpell?.mana_cost || null },
        { label: 'Energie type', value: (sourceSpell?.mana_type != "Special" ? sourceSpell?.mana_type : "Skill afhankelijk: Elementair of Spiritueel") || null },
        { label: 'Incantatie', value: sourceSpell?.incantation || null },
        { label: 'Omschrijving', value: description || 'Spreuk/Techniek informatie kon niet gevonden worden.' },
        { label: 'Effect', value: sourceSpell?.spell_effect || null },
        { label: 'Duur', value: sourceSpell?.spell_duration || null },
    ];

    const tooltipItems = getMapping(tooltipData);

    return (
        <div className="grid-spreuk-icons">
            <GenericTooltip
                header={`Vaardigheid: ${sourceSkill.skill}`}
                subheader={`Spreuk/Techniek: ${sourceSpell.spell}`}
                message={tooltipItems || ''}
                image={image}
            />

            <img
                className="btn-image"
                title={"Open Spreuken.pdf - pagina " + sourceSpell.page}
                onClick={() => openPdfPage('Spreuken.pdf', sourceSpell.page)}
                src="./images/img-pdf.png"
                alt="PDF">
            </img>
        </div>
    )
}

RecipeTooltip.propTypes = {
    skillId: PropTypes.number.isRequired,
    recipyId: PropTypes.number.isRequired,
    image: PropTypes.string
};

export function RecipeTooltip({ skillId, recipyId, image = './images/img-info.png' }) {
    const sourceSkill = getSkillById(skillId);
    const sourceRecipy = getRecipyBySkill(skillId, recipyId);
    const description = getBlock(sourceRecipy?.effect, "description-block");

    const tooltipData = [
        { label: 'Omschrijving', value: description || 'Recept informatie kon niet gevonden worden.' },
        { label: 'Inspiratie kosten', value: sourceRecipy?.inspiration || null },
        { label: 'Benodigdheden', value: sourceRecipy?.components || null },
    ];

    const tooltipItems = getMapping(tooltipData);

    return (
        <div className="grid-spreuk-icons">
            <GenericTooltip
                header={`Vaardigheid: ${sourceSkill.skill}`}
                subheader={`Recept: ${sourceRecipy.recipy}`}
                message={tooltipItems || ''}
                image={image}
            />
        </div>
    )
}

CustomTooltip.propTypes = {
    header: PropTypes.string.isRequired,
    subheader: PropTypes.any,
    message: PropTypes.string.isRequired,
    image: PropTypes.any,
};

export function CustomTooltip({ header, subheader = undefined, message, image = './images/img-info.png' }) {
    const description = getBlock(message, "description-block");
    const tooltipData = [{ label: '', value: description || 'Informatie kon niet gevonden worden.' }];
    const tooltipItems = getMapping(tooltipData);

    return (
        <div className="grid-spreuk-icons">
            <GenericTooltip
                header={header}
                subheader={subheader}
                message={tooltipItems}
                image={image}
            />
        </div>
    )
}

GenericTooltip.propTypes = {
    header: PropTypes.any,
    subheader: PropTypes.any,
    message: PropTypes.any,
    image: PropTypes.any,
};

function GenericTooltip({ header, subheader = undefined, message, image = './images/img-info.png' }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const handleMouseOver = () => setShowTooltip(true);
    const closeTooltip = () => setShowTooltip(false);

    return (
        <div className="tooltip-container" onMouseEnter={handleMouseOver}>
            <img
                className="btn-image"
                src={image}
                alt="info"
            />
            {showTooltip && (
                <div className="tooltip-overlay">
                    <div className="tooltip" onClick={closeTooltip}>
                        <h5>{header}</h5>
                        {subheader ? <h5>{subheader}</h5> : null}
                        <table className="tooltip-table">
                            <tbody>
                                {message}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}