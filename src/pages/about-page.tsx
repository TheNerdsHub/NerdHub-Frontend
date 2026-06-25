import { useEffect, useState } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function AboutPage() {
  useDocumentTitle('About')
  const [info, setInfo] = useState<{
    backendVersion: string | null
    latestBackendGitTag: string | null
    latestFrontendGitTag: string | null
    latestDiscordGitTag: string | null
    error?: string
  }>({
    backendVersion: null,
    latestBackendGitTag: null,
    latestFrontendGitTag: null,
    latestDiscordGitTag: null,
  })

  const frontendVersion = import.meta.env.VITE_VERSION

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_ROOT}/api/Version`)
      .then((res) => res.json())
      .then((data) =>
        setInfo({
          backendVersion: data.backendVersion ?? null,
          latestBackendGitTag: data.latestBackendGitTag ?? null,
          latestFrontendGitTag: data.latestFrontendGitTag ?? null,
          latestDiscordGitTag: data.latestDiscordGitTag ?? null,
        }),
      )
      .catch(() => setInfo((prev) => ({ ...prev, error: 'Error fetching version info.' })))
  }, [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">About NerdHub</h1>
      <p className="mt-2 text-muted-foreground">
        Version information for the NerdHub frontend, backend, and Discord bot.
      </p>

      <div className="mt-8 space-y-6">
        <Section title="Frontend Version" value={frontendVersion} />
        <Section title="Latest Frontend Git Tag" value={info.latestFrontendGitTag} />
        <Section title="Backend Version" value={info.backendVersion} />
        <Section title="Latest Backend Git Tag" value={info.latestBackendGitTag} />
        <Section title="Latest Discord Bot Git Tag" value={info.latestDiscordGitTag} />
        {info.error && <p className="text-destructive">{info.error}</p>}
      </div>
    </div>
  )
}

function Section({ title, value }: { title: string; value: string | null }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-1 font-mono text-sm">{value ?? 'Loading...'}</p>
    </div>
  )
}
