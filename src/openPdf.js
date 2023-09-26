// Open het vaardigheden boekje op de juiste pagina
export default function openPage(pdfName, pageNumber) {
    let rootURL = ""
    if (pdfName === "Vaardigheden.pdf") { rootURL = "https://the-vortex.nl/wp-content/uploads/2022/04/" }
    else if (pdfName === "Spreuken.pdf") { rootURL = "https://the-vortex.nl/wp-content/uploads/2022/03/" }
    else { console.warn("Neither Vaardigheden.pdf or Spreuken.pdf") }

    const fullURL = rootURL + pdfName + "#page=" + pageNumber;
    window.open(fullURL, '_blank');
}