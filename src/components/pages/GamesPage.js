import React from 'react';
import useDocumentTitle from '../useDocumentTitle';

function GamesPage() {
  useDocumentTitle('Games');
  return (
    <div>
      <h1>Welcome to the games homepage!</h1>
      <p>This is where you put the content for the games page.</p>
    </div>
  );
}

export default GamesPage;