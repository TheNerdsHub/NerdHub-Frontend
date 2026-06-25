import { useEffect } from 'react'

interface Options {
  defaultTitle?: string
  resetOnUnmount?: boolean
}

export function useDocumentTitle(title: string, options: Options = {}) {
  const { defaultTitle = 'NerdHub', resetOnUnmount = true } = options

  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle

    return () => {
      if (resetOnUnmount) {
        document.title = previousTitle
      }
    }
  }, [title, defaultTitle, resetOnUnmount])
}
