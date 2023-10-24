import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Shared
import { sourceSpreuken } from './SharedObjects.js';

// Nieuwe pagina klaarzetten
async function addNewPage(pdf) {
    pdf.addPage();
    await addImgElementToPDF(pdf, "App-header", 0.65, 0.65, 0, 10);
}

// Voeg Skills toe aan de pdf
async function addSkillDescriptionsToPdf(pdf, tableData, x = 20, y = 30) {
    const blockElements = [];
    for (const item of tableData) {
        const punten = item.xp > 1 ? "punten" : "punt";
        const vereisten = "Vereist: "
            + (item.Requirements.skill ? item.Requirements.skill : "")
            + (item.Requirements.any_list ? item.Requirements.any_list : "")
            + (item.Requirements.exception ? item.Requirements.exception : "");

        const newBlock = {
            title: {
                options: {
                    text: `${item.skill} (${item.xp} ${punten})`,
                    fontSize: 14,
                    font: 'helvetica',
                    textColor: [72, 133, 199],
                    lineheight: 1
                }
            },
            requirements: {
                options: {
                    text: `${vereisten}`,
                    fontSize: 11
                }
            },
            description: {
                options: {
                    text: `${item.description}`,
                    fontSize: 11
                }
            },

        };
        blockElements.push(newBlock);
    }
    await addTextBlockWithMarkUpToPdf(pdf, blockElements, x, y);
}

// Voeg Spreuken toe aan de pdf
async function addSpellDescriptionsToPdf(pdf, gridSpreuken, x = 20, y = 30) {
    const blockElements = [];

    for (const item of gridSpreuken) {
        const skillFound = sourceSpreuken.find((sourceSkill) =>
            item.skill?.toLowerCase() === sourceSkill.skill.toLowerCase() ||
            item.alt_skill?.toLowerCase() === sourceSkill.skill.toLowerCase());
        if (!skillFound) { continue; }

        const spellData = skillFound?.Spells.find((sourceSpell) =>
            item.name?.toLowerCase() === sourceSpell.spell.toLowerCase());
        if (!spellData) { continue; }        

        const newBlock = {
            title: {
                options: {
                    text: `${spellData.spell} ${spellData.mana_cost}`,
                    fontSize: 14,
                    font: 'helvetica',
                    textColor: [72, 133, 199],
                    lineheight: 1
                }
            },
            incantation: {
                options: {
                    text: `${spellData.incantation}`,
                    fontSize: 11
                }
            },
            description: {
                options: {
                    text: `${spellData.description}`,
                    fontSize: 11
                }
            },
            spelleffect: {
                options: {
                    text: `${spellData.spell_effect}, ${spellData.spell_duration}`,
                    fontSize: 11
                }
            },
        };
        blockElements.push(newBlock);
    }
    await addTextBlockWithMarkUpToPdf(pdf, blockElements, x, y);
}

// Voeg een block met mark-up toe aan de pdf.
async function addTextBlockWithMarkUpToPdf(pdf, blockElements, x, y, maxWidthPercentage = 0.8) {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth() * maxWidthPercentage;

    // Calculate the total height required for the element
    const getTotalElementHeight = (title, incantation, requirements, description, spelleffect) => {
        let totalHeight = 0;
        if (title?.options?.text) { 
            totalHeight += title.options?.text.split('\n').length * title.options.fontSize; }
        if (requirements?.options?.text) { totalHeight += requirements.options.text.split('\n').length * requirements.options.fontSize; }
        if (incantation?.options?.text) { totalHeight += incantation.options.text.split('\n').length * incantation.options.fontSize; }
        if (description?.options?.text) { totalHeight += description.options.text.split('\n').length * description.options.fontSize; }
        if (spelleffect?.options?.text) { totalHeight += spelleffect.options.text.split('\n').length * spelleffect.options.fontSize; }
        return totalHeight * 0.91;
    };

    const processElement = async (options, fontSizeThreshold = 14) => {
        const { text = "", fontSize = 11, font = 'helvetica', textColor = [0, 0, 0], lineHeight = 0.5 } = options;

        pdf.setFont(font);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        if (fontSize >= fontSizeThreshold) { y += 1; }

        const lines = pdf.splitTextToSize(text, pageWidth);

        for (const line of lines) {
            if (line.trim() === "") { continue; }
            pdf.text(line, x, y);
            y += (fontSize * lineHeight);
        }
    };

    // element op de pagina plaatsen
    for (const element of blockElements) {
        const {
            title = {},
            requirements = {},
            incantation = {},
            description = {},
            spelleffect = {}
        } = element;

        const totalElementHeight = getTotalElementHeight(title, requirements, incantation, description, spelleffect);
        if (y + totalElementHeight > pageHeight) {
            await addNewPage(pdf);
            y = 25;
        }

        if (title?.options) { await processElement(title.options); }
        if (requirements.options && requirements?.options?.text?.toLowerCase().trim() !== "vereist:") {
            await processElement(requirements.options);
        }
        if (incantation?.options) { await processElement(incantation.options); }
        if (description?.options) { await processElement(description.options); }
        if (spelleffect?.options) { await processElement(spelleffect.options); }
        y += 3;
    }
}

// Voeg skills table toe aan de pdf
async function addSkillTableToPdf(pdf, tableData, posY) {
    // Definieer de table columns en headers.
    const columns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Vaardigheid', dataKey: 'skill' },
        { header: 'Aantal keer', dataKey: 'count' },
        { header: 'XP Kosten', dataKey: 'xp' },
        { header: 'Loresheet', dataKey: 'loresheet' },
    ];

    // Map de data aan de columns.
    const rows = tableData.map((item) => {
        const row = {};
        columns.forEach((column) => {
            if (column.dataKey === 'loresheet') {
                row[column.dataKey] = item[column.dataKey] ? JSON.stringify(item[column.dataKey].pdf).replace(/"/g, '') : '';
            } else {
                row[column.dataKey] = item[column.dataKey];
            }
        });
        return row;
    });

    // Definieer de table settings.
    const tableOptions = {
        startY: posY, // Adjust the Y position where the table starts.
        body: rows,
        columns,
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255]
        }, // Header styles.
        alternateRowStyles: { fillColor: [240, 240, 240] }, // Alternate row styles.
    };

    pdf.autoTable(tableOptions);
}

// Voeg een Afbeelding van een element via ID toe aan de pdf
async function addImgElementToPDF(pdf, element, scaleX = 1, scaleY = 1, posX = 10, posY = 10) {
    const input = document.getElementById(element);
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgData;
        img.onload = function () {
            const imgWidth = img.width * (0.25 * scaleX);
            const imgHeight = img.height * (0.25 * scaleY);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const x = posX <= 0 ? (pageWidth - imgWidth) / 2 : posX;
            const y = posY <= 0 ? (pageHeight - imgHeight) / 2 : posY;
            pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
            resolve();
        };
        img.onerror = reject;
    });
}

// Voeg Tekst toe aan de pdf
async function addTextBlockToPdf(pdf, textArray, x = 0, y = 0, isCentered = false, options = {}) {
    const {
        fontSize = 11,
        font = 'helvetica',
        textColor = [0, 0, 0],
        lineHeight = 0.5,
    } = options;

    pdf.setFont(font);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

    let currentY = y;
    let currentTextIndex = 0;

    const addTextBlockAsync = async () => {
        if (currentTextIndex < textArray.length) {
            const text = textArray[currentTextIndex];
            const textWidth = pdf.getTextWidth(text);
            const textX = isCentered ? x - (textWidth / 2) : x;

            if (currentY + fontSize > pdf.internal.pageSize.getHeight()) {
                await addNewPage(pdf);
                currentY = 30;
            }

            pdf.text(text, textX, currentY);
            currentY += (fontSize * lineHeight);
            currentTextIndex++;

            // Recursively call the function to process the next text block
            await addTextBlockAsync();
        }
    };
    return addTextBlockAsync();
}

// Exporteren van de gegevens in de tableData en Grids naar PDF
export default async function useExportToPDF(charName, tableData, MAX_XP, totalXP, gridSpreuken, gridRecepten) {

    // check op lege charName
    let name = (charName && charName !== "") ? charName : "Naam onbekend";

    // Const waarmee de XP per event berekend wordt
    const calculateGainedXP = () => {
        if (MAX_XP < 20) { return 1.5; }
        else if (MAX_XP >= 20 && MAX_XP < 30) { return 1.25; }
        else if (MAX_XP >= 30 && MAX_XP < 40) { return 1; }
        else if (MAX_XP >= 40 && MAX_XP < 50) { return 0.75; }
        else if (MAX_XP >= 50) { return 0.5; }
        else { console.error("The required xp value was not found"); }
    }

    const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
    });

    const titleOptions = {
        fontSize: 14,
        font: 'helvetica',
        textColor: [72, 133, 199],
    };

    const next_event_xp = calculateGainedXP();

    /// --- OPBOUW EXPORT --- ///

    // Page 1
    await addImgElementToPDF(pdf, "App-header", 1, 1, 0, 10);

    await addTextBlockToPdf(pdf, ["Character"], 35, 50, false, titleOptions);
    await addTextBlockToPdf(pdf, [`${name}`], 35, 55, false);

    await addTextBlockToPdf(pdf, ["XP"], 35, 70, false, titleOptions);
    await addTextBlockToPdf(pdf, [
        `Totaal XP: ${MAX_XP}`,
        `Uitgegeven XP: ${totalXP}`,
        `Besteedbare XP: ${MAX_XP - totalXP}`,
        `XP per Event: ${next_event_xp}`], 35, 75);

    await addTextBlockToPdf(pdf, ["Vaardigheden"], 35, 105, false, titleOptions);
    await addTextBlockToPdf(pdf, [
        `Aantal vaardigheden: ${tableData.length}`,
        `Aantal spreuken/technieken: ${gridSpreuken.length}`,
        `Aantal recepten: ${gridRecepten.length}`], 35, 110, false);

    await addImgElementToPDF(pdf, "side-container-b", 0.85, 0.85, 105, 45);

    // Page2
    await addNewPage(pdf);
    await addSkillTableToPdf(pdf, tableData, 30);

    // Page 3 -->>
    await addNewPage(pdf);
    await addTextBlockToPdf(pdf, ["Vaardigheden"], 20, 30, false, titleOptions);

    await addSkillDescriptionsToPdf(pdf, tableData, 20, 40);

    await addNewPage(pdf);
    await addTextBlockToPdf(pdf, ["Spreuken & Technieken"], 20, 30, false, titleOptions);
    await addSpellDescriptionsToPdf(pdf, gridSpreuken, 20, 40);

    pdf.save(`${name}.pdf`);
}