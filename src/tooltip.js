import React, { useState } from 'react';
import {
    sourceBasisVaardigheden,
    sourceExtraVaardigheden,
    sourceSpreuken,
    sourceRecepten
} from './App.js'

// Tooltip component voor GridItems
// Gebruikt OF skillName OF de combinatioe van skillName/itemName (spell/technique/recipy e.d.)
function Tooltip({ skillName, itemName, isSpell, isRecipy, isSkill, image }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const handleMouseOver = () => setShowTooltip(true);
    const closeTooltip = () => setShowTooltip(false);

    // ophalen Skill & Spreuk of Recept data uit bronbestand
    let sourceSkill = sourceBasisVaardigheden.find((item) =>
        item.skill.toLowerCase() === skillName.toLowerCase());
    if (!sourceSkill) {
        sourceSkill = sourceExtraVaardigheden.find((item) =>
            item.skill.toLowerCase() === skillName.toLowerCase());
    }
    if (!sourceSkill) { return null; } // Exit early.

    let data = getData(isSpell, sourceSkill, itemName, isRecipy, isSkill, skillName);   
    if (!image) { image = './images/img-info.png' }

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
                        <h5>Vaardigheid: {skillName}</h5>
                        {isSpell ? <h5>Spreuk/Techniek: {itemName}</h5> : isRecipy ? <h5>Recept: {itemName}</h5> : null}
                        <table className="tooltip-table">
                            <tbody>
                                {getMappingFromData(data, isSkill, isSpell, isRecipy)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;

// Data ophalen uit basisvaardigheden, spreuken of recepten
function getData(isSpell, sourceSkill, itemName, isRecipy, isSkill, skillName) {
    let data = {};

    // Data kiezen voor spreuk, recept of vaardigheid
    // Tooltip spreuk
    if (isSpell === true) {
        const skillFound = sourceSpreuken.find((item) =>
            item.skill.toLowerCase() === sourceSkill.skill.toLowerCase() ||
            item.skill.toLowerCase() === sourceSkill.alt_skill.toLowerCase());

        data = skillFound.Spells.find((item) => item.spell.toLowerCase() === itemName.toLowerCase());
        data = data !== {} ? data : {
            name: itemName ? itemName : '',
            description: 'Spreuk/Techniek informatie kon niet gevonden worden.'
        };
    }

    // Tooltip recept
    else if (isRecipy === true) {
        const skillFound = sourceRecepten.find((item) =>
            item.skill.toLowerCase() === sourceSkill.skill.toLowerCase() ||
            item.skill.toLowerCase() === sourceSkill.alt_skill.toLowerCase());

        data = skillFound.Recipies.find((item) =>
            item.recipy.toLowerCase() === itemName.toLowerCase());
        data = data !== {} ? data : {
            recipy: itemName ? itemName : '',
            effect: 'Recept informatie kon niet gevonden worden.'
        };
    }

    // Tooltip vaardigheid
    else if (isSkill === true) {
        let fullRequirementsBlock = "";

        // check skills
        let newRequirements = "";
        const reqSkills = sourceSkill.Requirements.skill;
        if (reqSkills.length > 0) {
            reqSkills.forEach((item) => newRequirements += (newRequirements === "" ? item : ", \n" + item))
            fullRequirementsBlock += newRequirements + "\n";
        };
        // uitzondering - deze staat niet in de vaardigheden.json
        if (sourceSkill.skill === "Leermeester Expertise") { fullRequirementsBlock += "1 Extra vaardigheid"; }

        // check any_list
        let newAnyRequirements = "";
        const reqAny = sourceSkill.Requirements.any_list;
        if (reqAny.length > 0) {
            reqAny.forEach((item) => newAnyRequirements += (newAnyRequirements === "" ? item : ", \n" + item))
            newAnyRequirements = "Een van de volgende: \n" + newAnyRequirements;
            fullRequirementsBlock += newAnyRequirements + "\n";
        };


        let newCategoryRequirements = "";
        const reqCategory = sourceSkill.Requirements.Category;
        if (reqCategory && reqCategory.name.length > 0) {
            reqCategory.name.forEach((item) => newCategoryRequirements += (newCategoryRequirements === "" ? item : ", \n" + item))
            newCategoryRequirements = "" + reqCategory.value + " xp in de volgende categorie(n): \n" + newCategoryRequirements;
            fullRequirementsBlock += newCategoryRequirements + "\n";
        }

        data = {
            xp: sourceSkill.xp,
            requirements: fullRequirementsBlock,
            description: sourceSkill.description
        };
    }
    else {
        console.warn("This item should have been found: ", skillName, "isSpell: ", isSpell, "isSkill: ", isSkill, "Data: ", sourceSkill);
    }
    return data;
}

// Data verwerken tot een Tooltip definitie voor basisvaardigheid, spreuk of recept
function getMappingFromData(data, isSkill, isSpell, isRecipy) {
    if (!data) { return; }

    if (isSkill === true) {
        let descriptionBlock = data.description.split('\n');
        const description = descriptionBlock.map((block, index) => (
            <div key={index} className="description-block"> {block === '' ? <br /> : block} </div>
        ))

        let reqBlock = data.requirements.split('\n');
        const requirements = reqBlock.map((block, index) => (
            <div key={index} className="requirements-block"> {block === '' ? <br /> : block} </div>
        ))

        return [
            { label: 'XP kosten', value: data.xp },
            { label: 'Vereisten', value: requirements },
            { label: 'Omschrijving', value: description },
        ].map((item, index) => (
            <tr key={index}>
                <td className="tooltip-property">{item.label}:</td>
                <td className="tooltip-value"> {item.value}
                </td>
            </tr>
        ));
    }
    else if (isSpell === true) {
        let descriptionBlock = data.description.split('\n');
        const description = descriptionBlock.map((block, index) => (
            <div key={index} className="description-block"> {block === '' ? <br /> : block} </div>
        ))

        return [
            { label: 'Mana kosten', value: data.mana_cost },
            { label: 'Incantatie', value: data.incantation },
            { label: 'Omschrijving', value: description },
            { label: 'Effect', value: data.spell_effect },
            { label: 'Duur', value: data.spell_duration },
        ].map((item, index) => (
            <tr key={index}>
                <td className="tooltip-property">{item.label}:</td>
                <td className="tooltip-value">{item.value}</td>
            </tr>
        ));
    }
    else if (isRecipy === true) {
        let descriptionBlock = data.effect.split('\n');
        const description = descriptionBlock.map((block, index) => (
            <div key={index} className="description-block"> {block === '' ? <br /> : block} </div>
        ))

        return [
            { label: 'Omschrijving', value: description },
            { label: 'Inspiratie kosten', value: data.inspiration },
            { label: 'Benodigdheden', value: data.components },
        ].map((item, index) => (
            <tr key={index}>
                <td className="tooltip-property">{item.label}:</td>
                <td className="tooltip-value">{item.value}</td>
            </tr>
        ));
    }
    else {
        console.warn("Expected either isSkill, isSpell or isRecipy to be true, but found none")
    }
}