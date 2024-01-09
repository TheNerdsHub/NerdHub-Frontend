import React from 'react';
import useDocumentTitle from '../useDocumentTitle';

function QuotesPage() {
  useDocumentTitle('Quotes');
  return (
    <div>
      <h1>Welcome to the quotes page!</h1>
      <p>This is where you put the content for the quotes.</p>
    </div>
  );
}

export default QuotesPage;