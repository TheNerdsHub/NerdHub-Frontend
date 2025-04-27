import React from 'react';
import useDocumentTitle from 'components/useDocumentTitle';

function TimelinePage() {
  useDocumentTitle('Timeline');
  return (
    <div>
      <h1>Welcome to the timeline!</h1>
      <p>This is where you put the content for the timeline.</p>
    </div>
  );
}

export default TimelinePage;