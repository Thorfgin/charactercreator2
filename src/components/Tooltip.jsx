import { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

// shared
import {
    sourceSpreuken,
    sourceRecepten
} from '../SharedObjects.js';

import {
    openPdfPage,
    getSkillById,
    getSkillByName
} from '../SharedActions.js'


// Converteer teksten naar tekstblokken.
const getBlock = (text, className) => {
    if (!text) { return <div key={uuidv4()} className={className || 'error'}> </div> }
    let descriptionBlock = text.split('\n');
    const description = descriptionBlock.map((block) => (
        <div key={uuidv4()} className={className}> {block === '' ? <br /> : block} </div>
    ))
    return description;
}


InfoTooltip.propTypes = { row: PropTypes.any.isRequired };

// Plaats Info in de kolom
export function InfoTooltip({ row }) {
    let currentItem = getSkillById(row.original.id);

    return (
        <div className="info">
            <div className="acties-info">
                <SkillTooltip skillName={currentItem.skill} />
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
    skillName: PropTypes.string.isRequired,
    image: PropTypes.string
};

export function SkillTooltip({ skillName, image = './images/img-info.png' }) {

    const sourceSkill = getSkillByName(skillName);
    let fullRequirementsBlock = "";

    // check skills
    let newRequirements = "";
    const reqSkills = sourceSkill.Requirements.skill;
    if (reqSkills.length > 0) {
        reqSkills.forEach((item) => newRequirements += (newRequirements === "" ? item : ", \n" + item))
        fullRequirementsBlock += newRequirements + "\n";
    }
    // uitzondering - deze staat niet in de vaardigheden.json
    if (sourceSkill.skill === "Leermeester Expertise") { fullRequirementsBlock += "1 Extra vaardigheid"; }

    // check any_list
    let newAnyRequirements = "";
    const reqAny = sourceSkill.Requirements.any_list;
    if (reqAny.length > 0) {
        reqAny.forEach((item) => newAnyRequirements += (newAnyRequirements === "" ? item : ", \n" + item))
        newAnyRequirements = "Een van de volgende: \n" + newAnyRequirements;
        fullRequirementsBlock += newAnyRequirements + "\n";
    }

    // check category
    let newCategoryRequirements = "";
    const reqCategory = sourceSkill.Requirements.Category;
    if (reqCategory && reqCategory.name.length > 0) {
        reqCategory.name.forEach((item) => newCategoryRequirements += (newCategoryRequirements === "" ? item : ", \n" + item))
        newCategoryRequirements = "" + reqCategory.value + " xp in de volgende categorie(n): \n" + newCategoryRequirements;
        fullRequirementsBlock += newCategoryRequirements + "\n";
    }

    // samenvoegen
    const tooltipData = [
        { label: 'XP kosten', value: sourceSkill.xp },
        { label: 'Vereisten', value: getBlock(fullRequirementsBlock, "requirements-block") },
        { label: 'Omschrijving', value: getBlock(sourceSkill.description, "description-block") },
    ];

    const tooltipItems = tooltipData.map((item) => {
        const uniqueKey = uuidv4();
        const label = item.label;
        const value = item.value;

        return (
            <tr key={uniqueKey}>
                <td className="tooltip-property">{label}:</td>
                <td className="tooltip-value">{value}</td>
            </tr>
        );
    });

    return GenericTooltip({
        header: `Vaardigheid: ${sourceSkill?.skill || null}`,
        message: tooltipItems || null,
        image: image
    });
}

SpellTooltip.propTypes = {
    skillName: PropTypes.string.isRequired,
    spellName: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    image: PropTypes.string
};

export function SpellTooltip({ skillName, spellName, page, image = './images/img-info.png' }) {

    const sourceSkill = getSkillByName(skillName);
    const sourceSpell = sourceSpreuken.find((item) =>
        item.skill.toLowerCase() === sourceSkill.skill.toLowerCase() ||
        item.skill.toLowerCase() === sourceSkill.alt_skill.toLowerCase());

    let data = sourceSpell.Spells.find((item) => item.spell.toLowerCase() === spellName.toLowerCase());
    const description = getBlock(data.description, "description-block");

    const tooltipData = [
        { label: 'Mana kosten', value: data?.mana_cost || null },
        { label: 'Incantatie', value: data?.incantation || null },
        { label: 'Omschrijving', value: description || 'Spreuk/Techniek informatie kon niet gevonden worden.' },
        { label: 'Effect', value: data?.spell_effect || null },
        { label: 'Duur', value: data?.spell_duration || null },
    ];

    const tooltipItems = tooltipData.map((item) => {
        const uniqueKey = uuidv4();
        const label = item.label;
        const value = item.value;

        return (
            <tr key={uniqueKey}>
                <td className="tooltip-property">{label}:</td>
                <td className="tooltip-value">{value}</td>
            </tr>
        );
    });

    return (
        <div className="grid-spreuk-icons">
            <GenericTooltip
                header={`Vaardigheid: ${sourceSkill.skill}`}
                subheader={`Spreuk/Techniek: ${spellName}`}
                message={tooltipItems || ''}
                image={image}
            />

            <img
                className="btn-image"
                title={"Open Spreuken.pdf - pagina " + page}
                onClick={() => openPdfPage('Spreuken.pdf', page)}
                src="./images/img-pdf.png"
                alt="PDF">
            </img>
        </div>
    )
}

RecipeTooltip.propTypes = {
    skillName: PropTypes.string.isRequired,
    recipeName: PropTypes.string.isRequired,
    image: PropTypes.string
};

export function RecipeTooltip({ skillName, recipeName, image = './images/img-info.png' }) {

    const sourceSkill = getSkillByName(skillName);
    const skillFound = sourceRecepten.find((item) =>
        item.skill.toLowerCase() === sourceSkill.skill.toLowerCase() ||
        item.skill.toLowerCase() === sourceSkill.alt_skill.toLowerCase());

    let data = skillFound.Recipies.find((item) => item.recipy.toLowerCase() === recipeName.toLowerCase());
    const description = getBlock(data?.effect, "description-block");

    const tooltipData = [
        { label: 'Omschrijving', value: description || 'Recept informatie kon niet gevonden worden.' },
        { label: 'Inspiratie kosten', value: data?.inspiration || null },
        { label: 'Benodigdheden', value: data?.components || null },
    ];

    const tooltipItems = tooltipData.map((item) => {
        const uniqueKey = uuidv4();
        const label = item.label;
        const value = item.value;

        return (
            <tr key={uniqueKey}>
                <td className="tooltip-property">{label}:</td>
                <td className="tooltip-value">{value}</td>
            </tr>
        );
    });

    return (
        <div className="grid-spreuk-icons">
            <GenericTooltip
                header={`Vaardigheid: ${sourceSkill.skill}`}
                subheader={`Recept: ${recipeName}`}
                message={tooltipItems || ''}
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

export function GenericTooltip({ header, subheader = undefined, message, image = './images/img-info.png' }) {
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