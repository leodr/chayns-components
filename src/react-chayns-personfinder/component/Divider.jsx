import React from 'react';
import PropTypes from 'prop-types';

const Divider = ({ name }) => <div className="divider">{name}</div>;

Divider.propTypes = {
    name: PropTypes.string.isRequired,
};

Divider.displayName = 'Divider';

export default Divider;
