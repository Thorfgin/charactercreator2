// Open het vaardigheden boekje op de juiste pagina
export default function openPage(pdfName, pageNumber) {
    let rootURL = ""
    if ([
        "Vaardigheden.pdf",
        "Crafting-loresheets.pdf",
        "Imbue-loresheet.pdf"
    ].includes(pdfName)) { rootURL = "https://the-vortex.nl/wp-content/uploads/2022/04/" }
    else if ([
        "Spreuken.pdf",
        "Priest-Runes.pdf",
        "Mage-Glyphs.pdf",
        "Kennis-van-kruiden.pdf",
        "Genezende-Dranken.pdf",
        "Kruiden-Elixers.pdf",
        "Magische-Elixers.pdf",
        "Hallucinerende-Elixers.pdf",
        "Giffen.pdf"
    ].includes(pdfName)) { rootURL = "https://the-vortex.nl/wp-content/uploads/2022/03/"}
    else { console.warn("PDF name was not recognized as a valid option.") }

    const fullURL = rootURL + pdfName + "#page=" + pageNumber;
    window.open(fullURL, '_blank');
}