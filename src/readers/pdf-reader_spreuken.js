import { writeFile } from 'fs';
import { getDocument } from 'pdfjs-dist';

// Define the URL or local path to your PDF file
const pdfPath = 'C:\\Users\\JosvanRest\\Downloads\\Spreuken.pdf';
const outputPath = './json/spreuken_dubbelcheck.json';

const readFrom = 17;  // ignores pages < 17
const readTo = 76;    // ignores pages >= 76

const cleanedContent = [];
let jsonData = { Categories: [] };

/*
 FONT Specification:
if (fontName === ''g_d0_f2' & height === 18) // Hoofdstuk Header
if (fontName === 'g_d0_f1' & height === 13.9999995) { console.log(pageIndex, item); } // SPELL
if (fontName === 'g_d0_f3' & height === 16.0000005) { console.log(pageIndex, str); } // SKILL
if (fontName === 'g_d0_f3' & height === 11.00000025) { console.log(pageIndex, str); } // INCANTATIE - SPELL EFFECT/DURATION
if (fontName === 'g_d0_f2' & transform.includes(702.7199994975)) { console.log(pageIndex, str); } // CATEGORIE
 */

/*
Loops throught the pdf pages by Index (i)
Gets the text contents and cleans it.
*/
async function processPDF(pdf) {
    try {
        const maxPages = pdf.numPages;
        const pagePromises = [];

        for (let pageIndex = 1; pageIndex <= maxPages; pageIndex++) {
            const page = await pdf.getPage(pageIndex);
            pagePromises.push(page);
            const content = await page.getTextContent();
            cleanContent(content, pageIndex);
        };

        await Promise.all(pagePromises);

    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

/* 
Loops through the content items and cleans up any unwanted items. 
Cleaned currentItems are then pushed into the global cleanedContent
content items are ordered by pageIndex automatically.
*/
async function cleanContent(content, index) {
    for (let { str, dir, width, height, transform, fontName, hasEOL } of content.items) {
        if (str.trim() === '' |
            str.includes("Vortex Adventures") |
            str.includes("V05") |
            str.includes("Spreukenboekje")) { } // DO NOTHING WITH THESE LINES
        else {

            cleanedContent.push(
                {
                    pageIndex: index,
                    str: str,
                    dir: dir,
                    width: width,
                    height: height,
                    transform: transform,
                    fontName: fontName,
                    hasEOL: hasEOL
                });
        }
    }
}

/*
Loops through the content as stored in cleanedContent
uses global readFrom, readTo
*/
function processCleanedContent() {
    if (cleanedContent) {

        let spellId = 0;
        let currentCategorie = { categorie: "", Skills: [] };
        let currentSkillBlock = { skill: "", Spells: [] }
        let currentSpell = {
            id: 0,
            spell: "",
            mana_cost: 0,
            incantation: "",
            description: "",
            spell_effect: "",
            spell_duration: ""
        }
        let currentText = "";


        for (let item of cleanedContent) {
            let { pageIndex, str, dir, width, height, transform, fontName, hasEOL } = item;

            if (pageIndex < readFrom | pageIndex >= readTo) { continue; }
            else {
                //if (str.includes("Discern Diseases 0")) { console.log(item); }
                // When a Categorie is found
                if (fontName === 'g_d0_f2' & height === 18) {
                    // Push/Add a Categorie into jsonData.Categories
                    if (currentCategorie.categorie !== "") {
                        if (currentSpell.spell !== "") { currentSkillBlock.Spells.push(currentSpell); }
                        if (currentSkillBlock.skill !== "") { currentCategorie.Skills.push(currentSkillBlock) };
                        jsonData.Categories.push(currentCategorie);

                        // CleanUp
                        currentSpell = {
                            id: 0,
                            spell: "",
                            mana_cost: 0,
                            incantation: "",
                            description: "",
                            spell_effect: "",
                            spell_duration: ""
                        }
                        currentSkillBlock = { skill: "", Spells: [] }
                        currentCategorie = { categorie: "", Skills: [] };
                    }
                    currentCategorie.categorie = str;
                }

                // When a SkillBlock is found
                else if (fontName === 'g_d0_f3' & height === 16.0000005) {
                    // Push/Add a SkillBlock into currentCategorie
                    if (currentSkillBlock.skill !== "") {
                        currentCategorie.Skills.push(currentSkillBlock);
                        currentSkillBlock = { skill: "", Spells: [] }
                    }
                    currentSkillBlock.skill = str;
                }

                // When a Spell is found
                else if (
                    (fontName === 'g_d0_f1' & height === 13.9999995) |
                    (fontName === 'g_d0_f1' & height === 11.00000025)
                ) {
                    // Push/Add a Spell into SkillBlock
                    const regex = /^([\w\s&'&-]+(?: [\w\s&'&-]+){0,3}) (\d)$/;
                    const result = str.match(regex);
                    if (result) {
                        const [fullMatch, stringValue, digitValue] = result;

                        spellId++;
                        currentSpell.id = spellId;
                        currentSpell.spell = stringValue;
                        currentSpell.mana_cost = digitValue;
                    }

                    // Contains a Description of the Spell
                    else if (currentSpell.spell !== "") {
                        const SPELL_INCANTATION_VALUES = [
                            'NO EFFECT!',
                            'RESIST!',
                            '!'
                        ]
                        if (SPELL_INCANTATION_VALUES.includes(str.trim())) {
                            currentSpell.incantation += " " + str;
                        }
                        else {
                            if (currentText === "") { currentText += str; }
                            else { currentText += " " + str; }
                        }

                        //// Use for debugging
                        //console.error('String did not contain content in Spell format: ', str);
                    };
                }

                // When an Incantation is found
                else if (fontName === 'g_d0_f3' & height === 12) {
                    if (currentSpell.spell !== "") {
                        // Handle the Exception > Unoly Bolt
                        if (str === "Direct, 5 meter") {
                            currentSpell.spell_effect = str;
                            currentSpell.description = currentText;

                            // All Data should be complete - PUSH Spell, SkillBlock
                            currentSkillBlock.Spells.push(currentSpell);

                            // CleanUp
                            currentText = "";
                            currentSpell = {
                                id: 0,
                                spell: "",
                                mana_cost: 0,
                                incantation: "",
                                description: "",
                                spell_effect: "",
                                spell_duration: ""
                            }
                        }
                        // Generic handling of Incantation
                        else { currentSpell.incantation += str };
                    }
                }
                // When a Spell Effect/Spell Duration is found
                else if (fontName === 'g_d0_f3' & height === 11.00000025) {
                    // Gift of Knowledge has three spells included and should be treated as an exception.
                    if (currentSpell.spell !== "" & currentSpell.spell !== "Gift of Knowledge") {
                        // Define known Spell Effects
                        const GEESTBEINVLOEDEND_UNICODE = '\u0047\u0065\u0065\u0073\u0074\u0062\u0065\u00EF\u006E\u0076\u006C\u006F\u0065\u0064\u0065\u006E\u0064';
                        const SPELL_EFFECT_VALUES = [
                            'Direct',
                            'Aanraking',
                            'aanraking',
                            'Concentratie',
                            'Enchantment',
                            GEESTBEINVLOEDEND_UNICODE,
                            'Zelf',
                            '5 meter',
                            '5 meter of Aanraking',
                            '10 seconden, aanraking',
                        ];

                        // Handle Exception
                        if (str.trim() === "NO EFFECT!") { currentSpell.incantation += str }
                        else {
                            // Split and Loop through the str to find the known Spell Effects/Durations
                            // This also filters out any unwanted lines
                            const values = str.split(',');
                            let spell_effect = "";
                            let spell_duration = "";

                            for (let value of values) {
                                value = value.trim();

                                if (SPELL_EFFECT_VALUES.includes(value)) {
                                    if (spell_effect === "") { spell_effect += value }
                                    else { spell_effect += ", " + value; }
                                }
                                else {
                                    spell_duration += value;
                                }
                            }

                            // Add data to completed Spell
                            currentSpell.description = currentText;
                            currentSpell.spell_effect = spell_effect;
                            currentSpell.spell_duration = spell_duration;

                            // All Data should be complete - PUSH Spell, SkillBlock
                            currentSkillBlock.Spells.push(currentSpell);

                            // CleanUp
                            currentText = "";
                            currentSpell = {
                                id: 0,
                                spell: "",
                                mana_cost: 0,
                                incantation: "",
                                description: "",
                                spell_effect: "",
                                spell_duration: ""
                            }
                        }

                    }
                    // Handle the Exception
                    else if (currentSpell.spell === "Gift of Knowledge") {
                        currentText += str;

                        if (currentText.includes("Kennis van talen")) {
                            currentSpell.description = currentText;

                            // All Data should be complete - PUSH Spell, SkillBlock
                            currentSkillBlock.Spells.push(currentSpell);

                            // CleanUp
                            currentText = "";
                            currentSpell = {
                                id: 0,
                                spell: "",
                                mana_cost: 0,
                                incantation: "",
                                description: "",
                                spell_effect: "",
                                spell_duration: ""
                            }
                        }
                    }
                    //else {
                    //    // Unknown Spell Effects are caught here, use for debugging.
                    //    console.error("Found an Spell Effect, but there is no spell.", pageIndex, str)
                    //}
                }
                else {
                    //console.log(item);
                }
            }
        }
        // Finalize the last Categorie/SpellBlock
        currentCategorie.Skills.push(currentSkillBlock);
        jsonData.Categories.push(currentCategorie);

        //console.log(jsonData);                                      // CATEGORIES
        //console.log(jsonData.Categories);                           // ALL CATEGORIES
        //console.log(jsonData.Categories[1].Skills);                 // ALL CATEGORIE>SKILLS
        //console.log(jsonData.Categories[1].Skills[10].Spells);      // ALL CATEGORIE>SKILL>SPELLS

        //console.log(jsonData.Categories[0].categorie);              // CATEGORIE
        //console.log(jsonData.Categories[0].Skills[0].skill);        // SINGLE SKILL
    }
    else {
        console.error('Error cleaning PDF content:');
    }
}

async function main() {
    try {
        // Process PDF
        const pdf = await getDocument(pdfPath).promise;
        console.log('PDF Loaded:', pdf.numPages);
        await processPDF(pdf);
        processCleanedContent();

        // Convert to JSON
        const jsonString = JSON.stringify(jsonData, null, 2);
        writeFile(outputPath, jsonString, 'utf-8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('JSON data has been written to', outputPath);
            }
        });
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

main();
