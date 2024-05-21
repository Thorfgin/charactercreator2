import { v4 as uuidv4 } from 'uuid';

// Shared
import { useSharedState } from './SharedStateContext.jsx';

// Components
import {
    SpellTile,
    RecipeTile
} from './components/GridTileItem.jsx';
import FAQModal from './components/FaqModal.jsx'
import FileUploadModal from './components/FileUploadModal.jsx'
import GridEigenschapItem from './components/GridEigenschapItem.jsx';
import LoadCharacterModal from './components/LoadCharacterModal.jsx'
import LoadPresetModal from './components/LoadPresetModal.jsx'
import ModalMessage from './components/ModalMessage.jsx'
import ReleaseNotesModal from './components/ReleaseNotesModal.jsx'
import Toolbar from './components/Toolbar.jsx';
import SkillTable from './components/SkillTable.jsx';


/// --- MAIN APP --- ///
export default function App() {
    const {
        version,
        creator,

        showModal, setShowModal,
        showFAQModal, setShowFAQModal,
        showReleaseNotesModal, setShowReleaseNotesModal,
        showUploadModal,
        showLoadCharacterModal,
        showLoadPresetModal,
        setModalMsg,
        gridEigenschappen,
        gridEnergiePerDag,
        gridSpreuken,
        gridRecepten
    } = useSharedState();

    function showDisclaimer() {
        if (showModal !== true) {
            setModalMsg(
                "De character creator geeft een indicatie van de mogelijkheden. " +
                "Er kunnen altijd afwijkingen zitten tussen de teksten " +
                "in de character creator en de VA regelset.\n\n" +
                "Check altijd de laatste versie van de regelset op:\n" +
                "https://the-vortex.nl/het-spel/regels/" +
                "\n");
            setShowModal(true);
        }
    }

    const openFAQModal = () => { setShowFAQModal(true); }
    const openReleaseNotesModal = () => { setShowReleaseNotesModal(true); }

    /// --- HTML CONTENT --- ///
    return (
        <div className="App">
            <header className="App-header" id="App-header">
                <div></div>
                <div className="header-wrapper" id="header-wrapper">
                    <img id="App-VA-logo" src="./images/logo_100.png" alt="Logo" />
                    <h2 id="App-VA-title">Character Creator</h2>
                </div>
                <div></div>
            </header>
            <main id="main">
                <div className="main-container">
                    <Toolbar />
                    <SkillTable />

                    {showModal && (<ModalMessage />)}
                    {showUploadModal && (<FileUploadModal />)}
                    {showFAQModal && (<FAQModal />)}
                    {showReleaseNotesModal && (<ReleaseNotesModal />)}
                    {showLoadCharacterModal && (<LoadCharacterModal />)}
                    {showLoadPresetModal && (<LoadPresetModal />)}

                </div>
                <div className="side-containers">
                    <div className="side-container-b" id="side-container-b">
                        <div className="summary-title">
                            <h5>Character eigenschappen</h5>
                        </div>
                        <div className="grid-eigenschappen">
                            {gridEigenschappen.map((item) => (
                                <GridEigenschapItem
                                    name={item.name}
                                    key={uuidv4()}
                                    image={item.image}
                                    text={item.text}
                                    value={item.value}
                                />
                            ))}
                        </div>
                        <div className="summary-title">
                            <h5>Energie per Dag</h5>
                        </div>
                        <div className="grid-eigenschappen">
                            {gridEnergiePerDag.map((item) => (
                                <GridEigenschapItem
                                    name={item.name}
                                    key={uuidv4()}
                                    image={item.image}
                                    text={item.text}
                                    value={item.value}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="side-container-a" id="side-container-a">
                        <div className="summary-title">
                            <h5>Spreuken & Technieken</h5>
                        </div>
                        <div className="grid-spreuken">
                            {gridSpreuken?.map((item) => (
                                <SpellTile
                                    key={uuidv4()}
                                    skillId={item.skillId}
                                    spellId={item.spellId}
                                />
                            ))}
                        </div>

                        <div className="summary-title">
                            <h5>Recepten</h5>
                        </div>
                        <div className="grid-recepten">
                            {gridRecepten?.map((item) => (
                                <RecipeTile
                                    key={uuidv4()}
                                    skillId={item.skillId}
                                    recipyId={item.recipyId}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main >
            <div className="flex-filler"></div>
            <footer>
                <div className="release-notes" onClick={openReleaseNotesModal}><u>{version}</u></div>
                <div>{creator}{'\u2122'}</div>
                <div>
                    <div className="disclaimer" onClick={showDisclaimer}><u>Disclaimer</u></div>
                    <div className="faq" onClick={openFAQModal}><u>F.A.Q.</u></div>
                </div>
            </footer>
        </div >
    );
}