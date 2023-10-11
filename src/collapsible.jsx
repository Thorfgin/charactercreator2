import { useCollapse } from 'react-collapsed';
import PropTypes from 'prop-types';

Collapsible.propTypes = {
    header: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

const urlRegex = /(https?:\/\/[^\s]+)/g;
function replaceChar(text) { return text.replace(/ë/g, '\u00EB') }


function Collapsible({ header, message }) {
    const { getCollapseProps, getToggleProps } = useCollapse();
    const msgBlocks = message.split('\n');

    return (
        <div className="collapsible">
            <div><br /></div>
            <div className="header" {...getToggleProps()}>
                <i><u>{'\u2022' + " " + replaceChar(header)}</u></i>
            </div>
            <div {...getCollapseProps()}>
                <div><br /></div>
                {msgBlocks.map((block, index) => (
                    <div key={index} className="modal-block">
                        {
                            block === '' ?
                                <br /> : block.match(urlRegex) ?
                                    <a target="_blank" rel="noopener noreferrer" href={block.split("||")[0]}>{block.split("||")[1]}</a> : replaceChar(block)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Collapsible;