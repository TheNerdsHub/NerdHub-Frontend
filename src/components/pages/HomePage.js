import React from 'react';
import useDocumentTitle from '../useDocumentTitle';

function HomePage() {
  useDocumentTitle('Home');
  return (
    <div>
      <h1>Welcome to the homepage!</h1>
      <p>This is where you put the content for your homepage.</p>
    </div>
  );
}

export default HomePage;