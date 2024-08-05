import React from 'react';

export const LoadingSpin = ({ loading }) => {
  return (
    loading && (
      <div style={{ textAlign: 'center' }}>
        <p className='spinner'></p>
      </div>
    )
  );
};
