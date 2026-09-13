import { useEffect, useMemo, useRef, useState } from "react"
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { duracao } from "@/lib/formatar"
import { Button } from "@/components/ui/button"

const VELOCIDADES = [1, 1.25, 1.5, 2] as const // o requisito limita a reprodução a 2x

interface Props {
  /** Áudio gravado (data: URL). Sem ele, a transcrição é lida por síntese de voz. */
  src?: string
  transcricao?: string
  duracaoSeg: number
  locutor?: string
  className?: string
  variante?: "padrao" | "compacto"
}

function alturas(semente: string, n: number) {
  let h = 0
  for (const c of semente) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) >>> 0
    return 25 + ((h >>> 8) % 75)
  })
}

export function PlayerAudio({ src, transcricao = "", duracaoSeg, locutor, className, variante = "padrao" }: Props) {
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0) // 0..1
  const [velocidade, setVelocidade] = useState<(typeof VELOCIDADES)[number]>(1)
  const [mostrarTranscricao, setMostrarTranscricao] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const charRef = useRef(0)
  const falaRef = useRef(0)
  const barras = useMemo(() => alturas(src?.slice(-60) ?? transcricao, variante === "compacto" ? 28 : 44), [src, transcricao, variante])
  const suportaVoz = typeof window !== "undefined" && "speechSynthesis" in window

  // Síntese de voz: fala a partir de um índice do texto, na velocidade escolhida.
  const falar = (inicio: number, rate: number) => {
    const synth = window.speechSynthesis
    const id = ++falaRef.current
    synth.cancel()
    const trecho = transcricao.slice(inicio)
    if (!trecho.trim()) return
    const u = new SpeechSynthesisUtterance(trecho)
    u.lang = "pt-BR"
    u.rate = rate
    const voz = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("pt"))
    if (voz) u.voice = voz
    u.onboundary = (e) => {
      if (id !== falaRef.current) return
      charRef.current = inicio + e.charIndex
      setProgresso(charRef.current / transcricao.length)
    }
    u.onend = () => {
      // Ignora o fim de falas canceladas por pausa ou troca de velocidade.
      if (id !== falaRef.current) return
      setTocando(false)
      setProgresso(1)
      charRef.current = 0
    }
    synth.speak(u)
  }

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
      if (!src && "speechSynthesis" in window) window.speechSynthesis.cancel()
    }
  }, [src])

  const alternar = () => {
    if (src) {
      const a = audioRef.current
      if (!a) return
      if (tocando) a.pause()
      else {
        a.playbackRate = velocidade
        void a.play()
      }
      return
    }
    if (!suportaVoz) return
    if (tocando) {
      falaRef.current++
      window.speechSynthesis.cancel()
      setTocando(false)
    } else {
      const inicio = progresso >= 1 ? 0 : charRef.current
      if (progresso >= 1) setProgresso(0)
      falar(inicio, velocidade)
      setTocando(true)
    }
  }

  const trocarVelocidade = () => {
    const proxima = VELOCIDADES[(VELOCIDADES.indexOf(velocidade) + 1) % VELOCIDADES.length]
    setVelocidade(proxima)
    if (src && audioRef.current) audioRef.current.playbackRate = proxima
    if (!src && tocando) falar(charRef.current, proxima)
  }

  const reiniciar = () => {
    charRef.current = 0
    setProgresso(0)
    if (src && audioRef.current) audioRef.current.currentTime = 0
    else if (tocando) falar(0, velocidade)
  }

  const decorrido = progresso * duracaoSeg

  return (
    <div className={cn("rounded-2xl bg-secondary/70 p-3 ring-1 ring-primary/10", className)}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onPlay={() => setTocando(true)}
          onPause={() => setTocando(false)}
          onEnded={() => {
            setTocando(false)
            setProgresso(1)
          }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget
            const total = Number.isFinite(a.duration) ? a.duration : duracaoSeg
            setProgresso(total ? a.currentTime / total : 0)
          }}
        />
      )}
      <div className="flex items-center gap-3">
        <Button
          size="icon-lg"
          onClick={alternar}
          disabled={!src && !suportaVoz}
          aria-label={tocando ? "Pausar" : "Tocar"}
          className="size-11 shrink-0 rounded-full bg-brand text-white shadow-md shadow-primary/30"
        >
          {tocando ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5 translate-x-px" />}
        </Button>

        <div className="flex h-10 min-w-0 flex-1 items-center gap-[3px]" aria-hidden>
          {barras.map((h, i) => {
            const ativo = i / barras.length < progresso
            return (
              <span
                key={i}
                className={cn(
                  "w-full max-w-1.5 min-w-0.5 flex-1 origin-center rounded-full transition-colors",
                  ativo ? "bg-primary" : "bg-primary/25",
                  tocando && ativo && "animate-wave",
                )}
                style={{ height: `${h}%`, animationDelay: `${(i % 7) * 90}ms` }}
              />
            )
          })}
        </div>

        <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
          {duracao(tocando || progresso > 0 ? decorrido : duracaoSeg)}
        </span>
        <Button variant="outline" size="sm" onClick={trocarVelocidade} className="w-12 shrink-0 rounded-full font-bold tabular-nums" aria-label="Velocidade">
          {velocidade}x
        </Button>
      </div>

      {variante === "padrao" && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{locutor ? `🎙️ ${locutor}` : !src ? "🔊 Reproduzido por voz sintética" : "🎙️ Gravação"}</span>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="xs" onClick={reiniciar}>
              <RotateCcwIcon /> Do início
            </Button>
            {transcricao && (
              <Button variant="ghost" size="xs" onClick={() => setMostrarTranscricao((v) => !v)}>
                {mostrarTranscricao ? "Ocultar texto" : "Ver transcrição"}
              </Button>
            )}
          </div>
        </div>
      )}
      {mostrarTranscricao && transcricao && (
        <p className="mt-2 rounded-xl bg-background/70 p-3 text-sm leading-relaxed text-foreground/90">“{transcricao}”</p>
      )}
    </div>
  )
}
