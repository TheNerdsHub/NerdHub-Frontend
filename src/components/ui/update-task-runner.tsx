import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { gameService } from '@/lib/game-service'

type ColorClass = 'primary' | 'accent' | 'destructive'

interface UpdateTaskRunnerProps {
  title: string
  onStart: () => Promise<{ operationId: string }>
  colorClass?: ColorClass
}

export function UpdateTaskRunner({ title, onStart, colorClass = 'primary' }: UpdateTaskRunnerProps) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any>(null)

  const btnClass = colorClass === 'destructive'
    ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
    : colorClass === 'accent'
      ? 'border-accent/50 text-accent hover:bg-accent/10'
      : 'border-primary/50 text-primary hover:bg-primary/10'

  const pbgClass = colorClass === 'destructive' ? 'bg-destructive' : colorClass === 'accent' ? 'bg-accent' : 'bg-primary'

  const pollProgress = async (operationId: string) => {
    try {
      const p = await gameService.getProgress(operationId)
      setProgress(p.progress)
      setPhase(p.phase)
      setMessage(p.message)

      if (p.progress >= 100) {
        setPhase('Completed')
        setIsRunning(false)
        try {
          const finalResult = await gameService.getUpdateResult(operationId)
          setResult(finalResult)
          toast({ title: `${title} Completed` })
        } catch (e) {
          // ignore
        }
        return
      }

      setTimeout(() => pollProgress(operationId), (p.retryAfterSeconds || 1) * 1000)
    } catch (err) {
      setIsRunning(false)
      toast({ title: 'Polling failed', variant: 'destructive' })
    }
  }

  const handleStart = async () => {
    setIsRunning(true)
    setProgress(0)
    setPhase('Initializing')
    setMessage('Starting...')
    setResult(null)

    try {
      const res = await onStart()
      pollProgress(res.operationId)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleStart}
        disabled={isRunning}
        variant="outline"
        className={`w-full font-mono rounded-xl transition-all ${btnClass}`}
      >
        {isRunning ? 'Executing...' : `Start ${title}`}
      </Button>

      {isRunning && (
        <div className="space-y-3 bg-black/60 border border-white/10 p-4 rounded-xl">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>{phase}</span>
            <span className={`text-${colorClass}`}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${pbgClass} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/70 truncate">{message}</p>
        </div>
      )}

      {result && !isRunning && (
        <div className="bg-black/60 border border-white/10 p-4 rounded-xl text-sm overflow-auto max-h-[200px]">
          <pre className={`text-[10px] font-mono text-${colorClass}`}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
