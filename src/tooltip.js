import React, { useState } from 'react';
import { sourceBasisVaardigheden, sourceSpreuken, sourceRecepten } from './App.js'

// Tooltip component voor GridItems
export function Tooltip({ skillName, itemName, isSpell, isRecipy, isSkill }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const handleMouseOver = () => setShowTooltip(true);
    const closeTooltip = () => setShowTooltip(false);

    // ophalen Skill & Spreuk of Recept data uit bronbestand
    let sourceSkill = sourceBasisVaardigheden.find((item) => item.skill === skillName);
    let data = getData(isSpell, sourceSkill, itemName, isRecipy, isSkill, skillName);  

    return (
        <div className="tooltip-container" onMouseEnter={handleMouseOver}>
            <img
                className="btn-image"
                src="./images/img-info.png"
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
}

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

        data = skillFound.Recipies.find((item) => item.recipy.toLowerCase() === itemName.toLowerCase());
        data = data !== {} ? data : {
            recipy: itemName ? itemName : '',
            effect: 'Recept informatie kon niet gevonden worden.'
        };
    }

    // Tooltip vaardigheid
    else if (isSkill === true) {
        let newRequirements = "";
        const requiredSkills = sourceSkill.Requirements.skill;
        const requiredAny = sourceSkill.Requirements.any_list;

        // check skills
        if (sourceSkill.Requirements.skill.length > 0) {
            requiredSkills.forEach((item) => newRequirements += (newRequirements === "" ? item : ", " + item))
        };

        // check any_list
        if (sourceSkill.Requirements.any_list.length > 0) {
            requiredAny.forEach((item) => newRequirements += (newRequirements === "" ? "Een van de " + item : ", een van de " + item))
        };

        data = {
            xp: sourceSkill.xp,
            requirements: newRequirements,
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

        return [
            { label: 'XP kosten', value: data.xp },
            { label: 'Vereisten', value: data.requirements },
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
        return [
            { label: 'Omschrijving', value: data.effect },
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