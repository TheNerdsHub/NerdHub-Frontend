import { useEffect } from 'react';

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | NerdHub`;
    return () => {
      document.title = 'NerdHub';
    };
  }, [title]);
}

export default useDocumentTitle;