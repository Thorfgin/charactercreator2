import { v4 as uuidv4 } from 'uuid';

// Components
import Collapsible from './Collapsible.jsx';

// Shared
import { getSourceReleaseNotes } from '../SharedObjects.js';
import { useSharedState } from '../SharedStateContext.jsx';

const sourceReleaseNotes = getSourceReleaseNotes();

// Toont een venster met daar in de release notes.
// Release notes zijn open/dicht te klappen
export default function ReleaseNotesModal() {
    const { setShowReleaseNotesModal } = useSharedState();
    const closeModal = () => { setShowReleaseNotesModal(false); };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="releasenotes-modal" onClick={e => e.stopPropagation()}>
                <h3>Versie informatie</h3>
                <div className="release-notes-block">
                    {sourceReleaseNotes.ReleaseNotes.map(({ date, version, Items }) => (
                        <div key={uuidv4()}>
                            <div className="header">
                                <b>{`${date} release versie ${version}`}</b>
                            </div>
                                {Items.map(({ title, description }) => (
                                    <Collapsible
                                        key={uuidv4()}
                                        className="modal-block"
                                        header={title}
                                        message={description}
                                    />
                                ))}
                            <div><br/></div>
                        </div>
                    ))}
                </div>
                <div><br /></div>
                <button className="btn-primary" onClick={closeModal}>Sluiten</button>
            </div>
            <span className="close" onClick={closeModal}>&times;</span>
        </div>
    );
}