import { useEffect, useRef, useState } from "react"
import { MicIcon, RotateCcwIcon, SquareIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { duracao } from "@/lib/formatar"
import { Button } from "@/components/ui/button"
import { PlayerAudio } from "./PlayerAudio"

export interface Gravacao {
  audioUrl?: string
  transcricao?: string
  duracaoSeg: number
}

interface Props {
  limiteSeg: number
  gravacao: Gravacao | null
  onChange: (g: Gravacao | null) => void
  onReiniciar: () => void
}

const TEXTO_SIMULADO =
  "Esta é uma gravação simulada do modo demonstração. Em um celular com microfone liberado, a sua voz de verdade aparece aqui."

export function GravadorAudio({ limiteSeg, gravacao, onChange, onReiniciar }: Props) {
  const [estado, setEstado] = useState<"parado" | "gravando">("parado")
  const [segundos, setSegundos] = useState(0)
  const [simulado, setSimulado] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const inicioRef = useRef(0)

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  const pararTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  const parar = () => {
    pararTimer()
    const seg = Math.min(limiteSeg, Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000)))
    if (simulado || !recorderRef.current) {
      setEstado("parado")
      onChange({ transcricao: TEXTO_SIMULADO, duracaoSeg: seg })
      return
    }
    recorderRef.current.stop()
  }

  // O intervalo precisa sempre chamar a versão mais recente de `parar`.
  const pararRef = useRef(parar)
  useEffect(() => {
    pararRef.current = parar
  })

  const iniciarTimer = () => {
    inicioRef.current = Date.now()
    setSegundos(0)
    timerRef.current = window.setInterval(() => {
      const s = (Date.now() - inicioRef.current) / 1000
      setSegundos(s)
      if (s >= limiteSeg) {
        toast.info("⏱️ Tempo máximo atingido! Gravação finalizada.")
        pararRef.current()
      }
    }, 200)
  }

  const gravar = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const pedacos: Blob[] = []
      recorder.ondataavailable = (e) => pedacos.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const seg = Math.min(limiteSeg, Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000)))
        const blob = new Blob(pedacos, { type: recorder.mimeType })
        const leitor = new FileReader()
        leitor.onload = () => onChange({ audioUrl: String(leitor.result), duracaoSeg: seg })
        leitor.readAsDataURL(blob)
        setEstado("parado")
      }
      recorderRef.current = recorder
      recorder.start()
      setSimulado(false)
      setEstado("gravando")
      iniciarTimer()
    } catch {
      toast("🎙️ Não conseguimos acessar o microfone", {
        description: "Sem problemas: vamos simular a gravação para você testar o fluxo.",
      })
      recorderRef.current = null
      setSimulado(true)
      setEstado("gravando")
      iniciarTimer()
    }
  }

  const restante = Math.max(0, limiteSeg - segundos)

  if (gravacao && estado === "parado") {
    return (
      <div className="space-y-3">
        <PlayerAudio src={gravacao.audioUrl} transcricao={gravacao.transcricao} duracaoSeg={gravacao.duracaoSeg} />
        <Button
          variant="outline"
          onClick={() => {
            onChange(null)
            onReiniciar()
          }}
        >
          <RotateCcwIcon /> Regravar do zero
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/40 px-4 py-8">
      <div className="relative">
        {estado === "gravando" && <span className="absolute inset-0 animate-ping rounded-full bg-pink-500/40" />}
        <Button
          onClick={estado === "gravando" ? parar : gravar}
          aria-label={estado === "gravando" ? "Parar gravação" : "Começar a gravar"}
          className={cn(
            "relative size-20 rounded-full text-white shadow-xl",
            estado === "gravando" ? "bg-pink-500 hover:bg-pink-600" : "bg-brand shadow-primary/40",
          )}
        >
          {estado === "gravando" ? <SquareIcon className="size-7 fill-current" /> : <MicIcon className="size-8" />}
        </Button>
      </div>
      <div className="text-center">
        <p className="font-heading text-2xl font-bold tabular-nums">
          {estado === "gravando" ? duracao(segundos) : "Toque para gravar"}
        </p>
        <p className="text-sm text-muted-foreground">
          {estado === "gravando"
            ? `${duracao(restante)} restantes${simulado ? " · modo demonstração" : ""}`
            : `Você tem até ${duracao(limiteSeg)} para explicar 🎙️`}
        </p>
      </div>
      {estado === "gravando" && (
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-pink-500 transition-all" style={{ width: `${(segundos / limiteSeg) * 100}%` }} />
        </div>
      )}
    </div>
  )
}
