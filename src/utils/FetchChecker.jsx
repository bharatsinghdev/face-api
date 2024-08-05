//This is a helper function to conditionally determine the fetch status

import React from 'react';

export const FetchChecker = ({
  loading,
  payload,
  fetchedDone,
  allLoadedMessage,
  noItemMessage,
  handleFetchMore,
}) => {
  return (
    <div>
      {payload.length > 0 && !fetchedDone && (
        <button onClick={handleFetchMore} disabled={loading}>
          Load More
          {loading ? <p>loading</p> : null}
        </button>
      )}

      {!loading && payload?.length !== 0 && fetchedDone && (
        <div className='allLoadedCard'>
          <h3>{allLoadedMessage}</h3>
        </div>
      )}

      {!loading && payload?.length === 0 && <p>{noItemMessage}</p>}
    </div>
  );
};
