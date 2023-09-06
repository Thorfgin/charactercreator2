const fs = require('fs').promises;
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\JosvanRest\\Downloads\\Spreuken.pdf';
const outputPath = './json/spells.json';

// Unicode equivalent of "Geestbeïnvloedend"
const GEESTBEINVLOEDEND_UNICODE = '\u0047\u0065\u0065\u0073\u0074\u0062\u0065\u00EF\u006E\u0076\u006C\u006F\u0065\u0064\u0065\u006E\u0064';

const SPELL_EFFECT_VALUES = [
    'Direct',
    'Aanraking',
    'aanraking',
    'Concentratie',
    'Enchantment',
    GEESTBEINVLOEDEND_UNICODE,
    'Zelf',
    '5 meter(?: of Aanraking)?',
    '10 seconden, aanraking',
];

// Regex pattern to match strings like "Vortex Adventures 20XXVXX" and "Spreukenboekje paginaXX"
const removeStringsPattern = /(Vortex Adventures 20\d\dV\d\d|Spreukenboekje pagina\d\d)/g;

async function readPdfFile(path) {
    const dataBuffer = await fs.readFile(path);
    return (await pdf(dataBuffer)).text;
}

function splitSpellEffect(spellEffect) {
    const spellEffectValues = [];
    const spellDurationValues = [];

    const values = spellEffect.split(',').map(value => value.trim());

    values.forEach(value => {
        if (SPELL_EFFECT_VALUES.includes(value)) {
            spellEffectValues.push(value);
        } else {
            spellDurationValues.push(value);
        }
    });

    return {
        'spell_effect': spellEffectValues.join(', '),
        'spell_duration': spellDurationValues.join(', '),
    };
}

function replaceCharacters(input, replacements) {
    let result = input;
    for (const [search, replace] of replacements) {
        result = result.replace(search, replace);
    }
    return result;
}

function createSpellBlock(name, cost, incantation, description, spellEffect, spellId) {
    const cleanedDescription = replaceCharacters(
        description.trim(),
        [[removeStringsPattern, ''], [/\n+/g, ' ']] // Replace unwanted strings and consecutive newlines
    );

    const { 'spell_effect': spellEffectValue, 'spell_duration': spellDurationValue } = splitSpellEffect(spellEffect);

    return {
        'Id': spellId,
        'spell': name.trim(),
        'mana_cost': parseInt(cost, 10),
        'incantation': incantation.trim(),
        'description': cleanedDescription,
        'spell_effect': spellEffectValue,
        'spell_duration': spellDurationValue,
    };
}

function extractSpellBlocks(pdfText) {
    const pattern = /\n([A-Za-z\s\n&]+?) (\d)\n([^\n]+)\n([\s\S]+?)\n((?:Direct|Aanraking|aanraking|Concentratie|Enchantment|\u0047\u0065\u0065\u0073\u0074\u0062\u0065\u00EF\u006E\u0076\u006C\u006F\u0065\u0064\u0065\u006E\u0064|Zelf|5 meter(?: of Aanraking)?|10 seconden, aanraking)[^\n]*)/g;
    const spellBlocks = [];
    let currentCategory = null;
    let spellId = 1; // Initialize spell ID

    for (const match of pdfText.matchAll(pattern)) {
        const [, name, cost, incantation, description, spellEffect] = match;
        const spellName = name.trim().split('\n').pop();

        const lines = name.trim().split('\n');
        const newCategory = lines.length > 1 ? lines[lines.length - 2].trim() : null;

        if (newCategory !== null) {
            currentCategory = newCategory;
            spellBlocks.push({
                'categorie': currentCategory,
                'spells': [],
            });
        }

        const spellBlock = createSpellBlock(spellName, cost, incantation, description, spellEffect, spellId++);
        spellBlocks[spellBlocks.length - 1].spells.push(spellBlock);
    }

    return spellBlocks;
}

async function main() {
    try {
        const pdfText = await readPdfFile(pdfPath);
        const spellBlocks = extractSpellBlocks(pdfText);
        const jsonOutput = JSON.stringify({ 'categories': spellBlocks }, null, 2);
        await fs.writeFile(outputPath, jsonOutput);
        console.log(`Extracted ${spellBlocks.length} spell blocks to ${outputPath}`);
    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

main();
