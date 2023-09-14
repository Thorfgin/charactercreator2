import { Tooltip } from './tooltip.js'
import { sourceVaardigheden, defaultProperties } from './App.js'

// Karakter eigenschappen griditem
export function GridEigenschapItem({ image, text, value }) {
    return (
        <div className="grid-eigenschap-item">
            <div className="grid-eigenschap-image" style={{ backgroundImage: "url(" + image + ")" }} />
            <div className="grid-eigenschap-text">{text}: {value}</div>
        </div>
    );
}

// Generiek aanmaken van een tooltip knop op basis van type
export function GenericTooltipItem({ skill, name, text, type }) {
    let img = <div></div>;

    // Toevoegen INFO MODAL >>  Spreuken
    if (type === "grid-spreuken") {
        img = (<Tooltip
            skillName={skill}
            itemName={name}
            isSpell={true}
            isRecipy={false}
            isSkill={false}
        />);
    }

    // Toevoegen INFO MODAL >> Recepten
    else if (type === "grid-recepten") {
        img = (<Tooltip
            skillName={skill}
            itemName={name}
            isSpell={false}
            isRecipy={true}
            isSkill={false}
        />);
    }

    return (
        <div className="grid-spreuk-item">
            <div className="grid-spreuk-text">{"  " + text}</div>
            {img}
        </div>
    );
}

// Op basis van de Eigenschappen, voeg nieuwe tegels toe.
export function updateGridEigenschappenTiles(tableData) {
    const propertySums = defaultProperties.map((property) => (
        {
            ...property, value: tableData.reduce((sum, record) => {
                const vaardigheid = sourceVaardigheden.find((vaardigheid) => vaardigheid.skill === record.skill);
                const propertyValue = vaardigheid.Eigenschappen?.find((prop) => prop.name === property.name)?.value || 0;
                return sum + propertyValue * record.count;
            }, property.name === "hitpoints" ? 1 : 0)
        }));
    return propertySums;
}

// Op basis van de Spreuken, voeg nieuwe tegels toe.
export function updateGridSpreukenTiles(tableData) {
    const spellProperties = tableData.reduce((spellsAccumulator, record) => {
        const vaardigheid = sourceVaardigheden.find((vaardigheid) => vaardigheid.skill === record.skill);
        const spells = vaardigheid.Spreuken || [];

        spells.forEach((spell) => {
            const existingSpell = spellsAccumulator.find((existing) => existing.name === spell.name);
            if (existingSpell) {
                existingSpell.count += spell.count;
            } else {
                spell.skill = vaardigheid.skill;
                spellsAccumulator.push({ ...spell });
            }
        });
        return spellsAccumulator;
    }, []);
    return spellProperties;
}

// Op basis van de Recepten, voeg nieuwe tegels toe.
export function updateGridReceptenTiles(tableData) {
    const recipyProperties = tableData.reduce((recipyAccumulator, record) => {
        const vaardigheid = sourceVaardigheden.find((vaardigheid) => vaardigheid.skill === record.skill);
        const recepten = vaardigheid.Recepten || [];

        recepten?.forEach((recipy) => {
            const existingRecipy = recipyAccumulator.find((existing) => existing.name === recipy.name);
            if (existingRecipy) {
                existingRecipy.count += recipy.count;
            } else {
                recipy.skill = vaardigheid.skill;
                recipyAccumulator.push({ ...recipy });
            }
        });

        return recipyAccumulator;
    }, []);
    return recipyProperties;
}