import { useCollapse } from 'react-collapsed';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

const urlRegex = /(https?:\/\/[^\s]+)/g;
function replaceChar(text) { return text.replace(/ë/g, '\u00EB') }

function resolveDescription(description) {
    if (description) {
        const descriptionBlocks = description.split('\n');
        return descriptionBlocks.map((block) => (
            <div key={uuidv4()}>
                {block.match(urlRegex) ? (
                    <a target="_blank" rel="noopener noreferrer" href={block.split("||")[0]}>
                        {block.split("||")[1]}
                    </a>
                ) : (replaceChar(block))
                }
            </div>
        ));
    }
    return null;
}

Collapsible.propTypes = {
    header: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};
export default function Collapsible({ header, message }) {
    const { getCollapseProps, getToggleProps } = useCollapse();
    return (
        <div className="collapsible">
            <div><br /></div>
            <div className="header" {...getToggleProps()}>
                <i>{'\u2022' + " " + replaceChar(header)}</i>
            </div>
            <div {...getCollapseProps()}>
                <div><br /></div>
                {resolveDescription(message)}
            </div>
        </div>
    );
}