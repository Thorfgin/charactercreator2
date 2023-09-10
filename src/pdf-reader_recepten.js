const fs = require('fs');
const pdfjs = require('pdfjs-dist');

// Define the URL or local path to your PDF file
const fileName = "Genezende-Dranken"
const pdfPath = 'C:\\Users\\JosvanRest\\Downloads\\'+fileName+'.pdf';
const outputPath = './json/' + fileName +'.json';

const readFrom = 2;  // ignores pages < X
const readTo = 4;    // ignores pages >= X

const allContent = [];
let jsonData = { Categories: [] };

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
            allContent.push(content);
        };

        await Promise.all(pagePromises);

    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

/*
Loops through the content as stored in cleanedContent
uses global readFrom, readTo
*/
function processAllContent() {
    if (allContent) {

        let recipyId = 0;
        let currentCategorie = { categorie: "", Skills: [] };
        let currentSkillBlock = { skill: "", Recipies: [] }
        let currentRecipy = {
            "name": "",
            "effect": "",
            "inspiration": "",
            "components": ""
        }
        let currentText = "";

        for (let item of allContent) { jsonData.Categories.push(item); }
    }
    else {
        console.error('Error cleaning PDF content:');
    }
}

async function main() {
    try {
        // Process PDF
        const pdf = await pdfjs.getDocument(pdfPath).promise;
        console.log('PDF Loaded:', pdf.numPages);
        await processPDF(pdf);
        processAllContent();

        // Convert to JSON
        const jsonString = JSON.stringify(jsonData, null, 2);
        fs.writeFile(outputPath, jsonString, 'utf-8', (err) => {
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
