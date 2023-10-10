import { useCollapse } from 'react-collapsed';
import PropTypes from 'prop-types';

Collapsible.propTypes = {
    header: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

function Collapsible({ header, message }) {
    const { getCollapseProps, getToggleProps } = useCollapse();
    return (
        <div className="collapsible">
            <div><br /></div>
            <div className="header" {...getToggleProps()}>
                { header}
            </div>
            <div {...getCollapseProps()}>
                <div className="content">
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
}

export default Collapsible;