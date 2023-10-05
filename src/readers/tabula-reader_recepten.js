import { promises as fs } from 'fs';

// Define the URL or local path to your PDF file
const index = 4
const fileName = [
    "Genezende-Dranken",        // 0
    "Giffen",                   // 1
    "Hallucinerende-Elixers",   // 2
    "Kruiden-Elixers",          // 3
    "Magische-Elixers"          // 4
]

const tabulaJsonPath = 'C:\\Users\\JosvanRest\\Downloads\\tabula-' + fileName[index] + '.json';
const outputPath = './json/' + fileName[index] + '.json';

let jsonData = { Categories: [] };

// Regex Patterns
const skillPattern = /^.+ [A-C]$/;

function processTabulaJsonData(rawData) {
    let currentCategorie = { categorie: "Alchemistenvaardigheden", Skills: [] };

    // INDEX = SINGLE SELECTION (Most likely a single Table)
    for (const index in rawData) {

        let currentSkillBlock = { skill: "", Recipies: [] }

        // ROW = SINGLE RECIPY
        for (const row of rawData[index].data) {
            // Get Fields by Array Position
            if (row[0].text === "" | row[0].text === "Naam") { continue; }
            else if (row[0].text.match(skillPattern)) {
                currentSkillBlock.skill = row[0].text;
                continue;
            }

            let recipy = {
                "recipy": row[0].text.replace(/\r/g, " "),
                "effect": row[1].text.replace(/\r/g, " "),
                "inspiration": row[2].text.replace(/\r/g, " "),
                "components": row[3].text.replace(/\r/g, " ")
            };
            currentSkillBlock.Recipies.push(recipy);
        }
        currentCategorie.Skills.push(currentSkillBlock);
        currentSkillBlock = { skill: "", Recipies: [] }
    }
    jsonData.Categories.push(currentCategorie);
}

async function main() {
    try {
        const data = await fs.readFile(tabulaJsonPath, { encoding: 'utf8' }); // Pass encoding as an option object
        processTabulaJsonData(JSON.parse(data));

        // Convert to JSON
        const jsonString = JSON.stringify(jsonData, null, 2);
        await fs.writeFile(outputPath, jsonString, { encoding: 'utf-8' }); // Pass encoding as an option object
        console.log('JSON data has been written to', outputPath);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
