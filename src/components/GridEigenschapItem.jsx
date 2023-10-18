import { useState } from 'react';
import PropTypes from 'prop-types';

// additions
import {
    SpiderController,
    GhostController,
    SkeletonController,
} from '../additions/bug.jsx';

import { StoneController } from '../additions/stone.jsx';
import '../additions/css/heart.css';

let bugsActive = false;

GridEigenschapItem.propTypes = {
    image: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
};

// Karakter eigenschappen griditem
export default function GridEigenschapItem({ image, text, value }) {

    const [clicked, setClicked] = useState(false);
    const [counter, setCounter] = useState(0);
    const [spiderController, setSpiderController] = useState(null);
    const [ghostController, setGhostController] = useState(null);
    const [skeletonController, setSkeletonController] = useState(null);
    const [stoneController, setStoneController] = useState(null);

    let reqClicks = 2;

    const handleItemClick = () => {
        setClicked(!clicked);
        setCounter(counter + 1);
    };

    const getContent = () => {
        // eslint-disable-next-line react/prop-types
        if (text.trim() === "Totaal HP" && clicked && counter >= reqClicks) {
            const jstoggle = document.getElementById("App-VA-logo");

            // event listenis op Logo. Werkt wanneer hartje aanwezig is.
            jstoggle.addEventListener('click', () => {
                const pulsingHeart = document.getElementById("pulsingheart");

                if (pulsingHeart && bugsActive === false) {
                    bugsActive = true;
                    const spider = new SpiderController({ minBugs: 3, maxBugs: 5 });
                    setSpiderController(spider);
                    const ghost = new GhostController();
                    setGhostController(ghost);
                    const skeleton = new SkeletonController();
                    setSkeletonController(skeleton);
                    const stone = new StoneController();
                    setStoneController(stone);
                }
            });

            return (
                <div>
                    <div className="grid-eigenschap-image" style={{ backgroundImage: "url(" + image + ")" }}>
                        <div className="wrapper">
                            <div className="pulsingheart" id="pulsingheart"></div>
                        </div>
                    </div >
                    <div className="grid-eigenschap-text">{text}: {value}</div>
                </div>
            );
        }
        else {
            if (bugsActive === true && counter >= reqClicks) {
                setCounter(0);
                setClicked(false);
                bugsActive = false;

                setTimeout(() => {
                    spiderController.killAll();
                    ghostController.killAll();
                    skeletonController.killAll();
                }, 1000);

                setTimeout(() => {
                    spiderController.end();
                    ghostController.end();
                    skeletonController.end();
                    stoneController.end();
                }, 3000);
            }
            return (
                <div>
                    <div className="grid-eigenschap-image" style={{ backgroundImage: "url(" + image + ")" }} />
                    <div className="grid-eigenschap-text">{text}: {value}</div>
                </div>
            )
        }
    }

    return (
        <div className={`grid-eigenschap-item ${clicked ? 'clicked' : ''}`} onClick={handleItemClick}>
            {getContent()}
        </div>
    );
}

