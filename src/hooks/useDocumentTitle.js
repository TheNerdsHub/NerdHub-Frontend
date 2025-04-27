import { useEffect } from 'react';

/**
 * Custom hook to set the document title.
 * @param {string} title - The title to set for the document.
 * @param {Object} [options] - Additional options.
 * @param {string} [options.defaultTitle='NerdHub'] - The default title to use if no title is provided.
 * @param {boolean} [options.resetOnUnmount=true] - Whether to reset the title on component unmount.
 */
function useDocumentTitle(title, options = {}) {
  const { defaultTitle = 'NerdHub', resetOnUnmount = true } = options;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle;

    return () => {
      if (resetOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, defaultTitle, resetOnUnmount]);
}

export default useDocumentTitle;