export function getProxyImageUrl(originalUrl: string): string {
  if (!originalUrl) return ''

  const proxyBase = window.__IMGPROXY_URL__
    || import.meta.env.VITE_IMGPROXY_URL

  // Without a configured proxy, serve the original URL directly
  if (!proxyBase) {
    return originalUrl
  }

  const encoded = btoa(originalUrl)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${proxyBase}/unsafe/format:avif/${encoded}`
}
