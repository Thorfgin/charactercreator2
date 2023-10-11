import PropTypes from 'prop-types';
import Collapsible from './collapsible.jsx';

FAQModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

// Toont een venster met daar in de meeste gestelde vragen.
// Vragen zijn open/dicht te klappen
const content = [
    {
        header: "Kan ik mijn personage direct indienen bij VA ?",
        message: "Nee, helaas is er nog geen koppeling mogelijk met het VA personagebeheer en/of inschrijfsysteem." + "\n" +
            "Deze module is bedoeld om gemakkelijker je eigen personage bij te houden." + "\n" +
            "Het is nog onbekend of en hoe de VA infobalie hier gebruik van zou kunnen/willen maken." +
            "In de toekomst biedt het spelerportaal mogelijk hier een oplossing voor."
    },
    {
        header: "Kan ik mijn personage bewaren ?",
        message: "Ja, als je dit venster sluit, wordt je laatste invoer bewaard." + "\n" +
            "Daarnaast heb je de mogelijkheid 't personage op naam te bewaren in de opslag van je browser," + "\n" +
            "of een databestand te downloaden dat je lokaal kunt bewaren op je apparaat."
    },
    {
        header: "Waarom moet ik mijn personage een naam geven voor ik kan opslaan ?",
        message: "Voor het ophalen van de personages hebben we een naam nodig waardoor jij weet welk personage het is." + "\n" +
            "De naam die je invoert hoeft niet daadwerkelijk de uiteindelijke naam te zijn." + "\n" +
            "Je bent volledig vrij in wat je invoert in het invoerveld 'naam'." + "\n" +
            "Je kunt dus ook 'Personage 1', 'Personage 2', 'Personage 3' invoeren."
    },
    {
        header: "Kan ik mijn personage nog wijzigen nadat ik het opgeslagen heb ?",
        message: "Ja, als je het personage na invoer bewaard, kun je het daarna gewoon weer inladen." + "\n" +
            "Je mag dan wijzigingen aanbrengen aan het personage, maarrr..." + "\n" +
            "Let op: dit heeft geen effect op de opgeslagen versie!" + "\n" +
            "Wil je deze wijzigingen los opslaan? Vergeet dan niet de naam eerst te wijzigen!"
    },
    {
        header: "Kan ik mijn personage nog wijzigen nadat ik het geëxporteerd heb ?",
        message: "Ja, als je het personage geëxporteerd hebt, kun je het daarna gewoon weer uploaden." + "\n" +
            "Je mag dan wijzigingen aanbrengen aan het personage, maarrr..." + "\n" +
            "Let op: dit heeft geen effect op het lokale bestand!" + "\n" +
            "Je zal de gewijzigde versie opnieuw moeten exporteren!"
    },
    {
        header: "Kan ik mijn personage uitprinten ?",
        message: "Nee, je kunt momenteel alleen de pagina uitprinten door de webpagina vanuit je browser af te drukken" + "\n" +
            "Er liggen wel plannen om een uitgebreidere PDF-export te laten genereren." + "\n" +
            "Deze optie wordt t.z.t. toegevoegd."
    },
    {
        header: "Waarom kan ik 0.25 XP toevoegen ?",
        message: "Per evenement die het personage volledig heeft overleefd ontvangt je personage XP." + "\n" +
            "De hoeveelheid XP die je ontvangt is afhankelijk van hoeveel XP je al hebt vergaard." + "\n" +
            "De hoeveelheid XP die je ontvangt is altijd deelbaar door 0.25. Vandaar dat deze hoeveelheid gekozen is." + "\n" +
            "Voor meer informatie zie de regels voor Groei in het Vaardigheden boekje op pagina 40." + "\n" +
            "https://the-vortex.nl/wp-content/uploads/2022/04/Vaardigheden.pdf#page=40||Vaardigheden.pdf"
    },
    {
        header: "Wat is het verschil tussen Basis- en Extra vaardigheden ?",
        message: "Wanneer je een personage start, mogen alleen Basis vaardigheden gekozen worden." + "\n" +
            "Alle vaardigheden uit de lijst met Extra vaardigheden kunnen alleen in het spel zelf geleerd worden." + "\n" +
            "Hiervoor is een andere speler of npc nodig met de vaardigheid 'Leermeester Expertise'," + "\n" +
            "en de vaardigheid in kwestie welke je zou willen leren." + "\n" +
            "Hoe dit werkt staat uitgelegd in de regels voor Groei in het Vaardighedenboekje op pagina 40." + "\n" +
            "https://the-vortex.nl/wp-content/uploads/2022/04/Vaardigheden.pdf#page=40||Vaardigheden.pdf"
    },
    {
        header: "Ik heb een voorstel voor een (nog missend) arche-type als template!",
        message: "We horen graag van je wat je toe gevoegd zou willen zien aan de templates." + "\n" +
            "Vragen over de templates of suggestie mogen gesteld worden op de VA Discord in het kanaal:" + "\n" +
            "https://discord.com/channels/887411615178293298/889812948514639893||Website-feedback"
    },
    {
        header: "Ik heb een vraag over de regelset!",
        message: "We horen graag van je waar we je mee kunnen helpen." + "\n" +
            "Vragen over de regelset mogen gesteld worden op de VA Discord in het kanaal:" + "\n" +
            "https://discord.com/channels/887411615178293298/1119280489140846754||Regelsysteemvragen"
    },
    {
        header: "Ik heb een fout gevonden in de regelset!",
        message: "Dat is niet zo mooi! We horen graag van je wat je gevonden hebt." + "\n" +
            "Fouten in de regelset mogen gemeld worden op de VA Discord in het kanaal:" + "\n" +
            "https://discord.com/channels/887411615178293298/1119280489140846754||Regelsysteemvragen"
    },
    {
        header: "Ik heb een fout gevonden in de character creator",
        message: "Dat is vervelend. Uiteraard willen we dit voor je oplossen!" + "\n" +
            "Wanneer er een error optreedt in de browser (console), wordt deze automatisch gelogd." + "\n" +
            "Deze fouten hoeven dus niet gemeld te worden. Twijfel je, of wil je toch de fout melden?" + "\n" +
            "Meld deze dan op de VA Discord in het kanaal:" + "\n" +
            "https://discord.com/channels/887411615178293298/889812948514639893||Website-feedback"
            
    },
    {
        header: "Tijdens het inladen krijg ik een melding dat de regelset versie niet wordt herkend.",
        message: "Dat is vervelend. Mogelijk heb je een oudere versie van een personage geprobeerd in te laden." + "\n" +
            "Elk personage wordt opgeslagen met benoeming van een regelset versie en aanvullende details." + "\n" +
            "Hiermee voorkomen we foutief samengestelde personages." + "\n" +
            "Momenteel is er nog geen ondersteuning om oudere personages in te lezen."
    },
    {
        header: "Tijdens het inladen krijg ik een melding dat de regelset versie niet kan worden ingelezen.",
        message: "Dat is vervelend. Mogelijk heb je een corrupte of verouderde versie van een personage geprobeerd in te laden." + "\n" +
            "Elk personage wordt opgeslagen met benoeming van een regelset versie en aanvullende details." + "\n" +
            "Hiermee voorkomen we foutief samengestelde personages." + "\n" +
            "Het personage dat je hebt gekozen voldoet niet (meer) aan deze standaard." + "\n" +
            "Momenteel is er nog geen ondersteuning om foutieve of corrupte personages in te lezen."
    },
    {
        header: "Na het uploaden krijg ik een melding dat er iets mis is gegaan.",
        message: "Dat is vervelend. Mogelijk is er iets niet goed aan het bestand dat je probeert in te laden." + "\n" +
            "Elk personage wordt opgeslagen met benoeming van een regelset versie en aanvullende details." + "\n" +
            "Als er gerommeld wordt met een bestand, kan dit kapot gaan." + "\n" +
            "We raden je aan de inhoud van opgeslagen of geëxporteerde personages niet te wijzigen."
    }
]

function FAQModal({ closeModal }) {

    return (
        <div className="modal-overlay">
            <div className="faq-modal">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-modal-block">
                    {content.map(({ header, message }, index) => (
                        <Collapsible
                            key={index}
                            className="modal-block"
                            header={header}
                            message={message}
                        />
                    ))}
                </div>
                <div><br /></div>
                <button className="btn-primary" onClick={closeModal}>Sluiten</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}

export default FAQModal;
