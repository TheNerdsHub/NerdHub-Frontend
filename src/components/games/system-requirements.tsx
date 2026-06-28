import { Monitor } from "lucide-react"
import type { GameDetails } from "@/lib/game-service"

interface SystemRequirementsProps {
  pc?: GameDetails["pcRequirements"]
  mac?: GameDetails["macRequirements"]
  linux?: GameDetails["linuxRequirements"]
  platforms?: string[]
}

export function SystemRequirements({ pc, mac, linux, platforms = [] }: SystemRequirementsProps) {
  const hasMac = platforms.includes("Mac")
  const hasLinux = platforms.includes("Linux")

  const sections: { label: string; req: { minimum?: string } | undefined }[] = [
    { label: "PC", req: pc },
  ]
  if (hasMac) sections.push({ label: "Mac", req: mac })
  if (hasLinux) sections.push({ label: "Linux", req: linux })

  const hasAny = sections.some(s => s.req?.minimum)
  if (!hasAny) return null

  const decodeHtml = (html?: string) => {
    if (!html) return ""
    const ta = document.createElement("textarea")
    ta.innerHTML = html
    return ta.value
  }

  return (
    <div className="glass-panel rounded-3xl p-8 space-y-4">
      <h3 className="text-sm font-mono text-primary flex items-center gap-2">
        <Monitor className="w-4 h-4" /> System Requirements
      </h3>
      <div className="space-y-3">
        {sections.map(({ label, req }) =>
          req?.minimum ? (
            <div key={label}>
              <strong className="text-sm text-white/80">{label}:</strong>
              <div
                className="text-sm text-muted-foreground mt-1 leading-relaxed [&>br]:mb-1"
                dangerouslySetInnerHTML={{ __html: decodeHtml(req.minimum) }}
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}
