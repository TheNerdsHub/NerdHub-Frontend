import { useEffect, useState } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Info, Server, Code2, Bot, AlertTriangle } from 'lucide-react'

export default function AboutPage() {
  useDocumentTitle('System Info')
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
      .catch(() => setInfo((prev) => ({ ...prev, error: 'SYSTEM FAILURE: Cannot establish connection to telemetry server.' })))
  }, [])

  return (
    <div className="container max-w-4xl mx-auto py-16 px-6 space-y-12">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Info className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">System Info</h1>
        </div>
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">
          Telemetry data for NerdHub services.
        </p>
      </div>

      {info.error && (
        <div className="glass-panel border-destructive/30 bg-destructive/5 rounded-2xl p-6 flex items-start gap-4 text-destructive">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
          <p className="font-mono">{info.error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel rounded-3xl p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Code2 className="w-48 h-48" />
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Code2 className="w-5 h-5 text-primary" /> Frontend Client
          </h2>
          <div className="space-y-6">
            <Section title="Build Version" value={frontendVersion} />
            <Section title="Latest Git Tag" value={info.latestFrontendGitTag} />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Server className="w-48 h-48" />
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Server className="w-5 h-5 text-accent" /> Backend Core
          </h2>
          <div className="space-y-6">
            <Section title="Build Version" value={info.backendVersion} />
            <Section title="Latest Git Tag" value={info.latestBackendGitTag} />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 space-y-8 relative overflow-hidden group md:col-span-2">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Bot className="w-48 h-48" />
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Bot className="w-5 h-5 text-primary" /> Discord Bot
          </h2>
          <div className="space-y-6">
            <Section title="Latest Git Tag" value={info.latestDiscordGitTag} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="relative z-10 border-l-2 border-white/10 pl-4 py-1">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-center">
        {value ? (
          <span className="font-mono text-lg text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)] bg-primary/10 px-3 py-1 rounded-md border border-primary/20">
            {value}
          </span>
        ) : (
          <span className="font-mono text-sm text-muted-foreground animate-pulse">FETCHING...</span>
        )}
      </div>
    </div>
  )
}