import React from 'react';
import PropTypes from 'prop-types';

const Embedhtml = ({ html }) => {
  if (!html || typeof html !== 'string') return null;

  return (
    <div
      className="embed-wrapper"
      style={{
        marginTop: '12px',
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: '#fff',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

Embedhtml.propTypes = {
  html: PropTypes.string.isRequired,
};

export default Embedhtml;
