import { useEffect, useState } from "react"
import { PauseIcon, PlayIcon } from "lucide-react"
import { duracao } from "@/lib/formatar"
import type { Desafio } from "@/lib/types"
import { Meme } from "./Meme"
import { PlayerAudio } from "./PlayerAudio"

export function ConteudoDoDesafio({ desafio }: { desafio: Desafio }) {
  const { conteudo } = desafio
  return (
    <div className="space-y-4">
      {conteudo.meme && <Meme meme={conteudo.meme} />}
      {conteudo.audio && (
        <PlayerAudio
          src={conteudo.audio.audioUrl}
          transcricao={conteudo.audio.transcricao}
          duracaoSeg={conteudo.audio.duracaoSeg}
          locutor={conteudo.audio.locutor}
        />
      )}
      {conteudo.imagem && (
        <figure className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-4 ring-1 ring-black/5 dark:from-emerald-950/40 dark:to-sky-950/40">
          {conteudo.imagem.url ? (
            <img src={conteudo.imagem.url} alt={conteudo.imagem.legenda} className="mx-auto max-h-96 rounded-xl object-contain" />
          ) : (
            <Ilustracao tipo={conteudo.imagem.ilustracao ?? "celula"} />
          )}
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">{conteudo.imagem.legenda}</figcaption>
        </figure>
      )}
      {conteudo.video && <VideoDemo {...conteudo.video} />}
      {conteudo.texto && (
        <blockquote className="relative rounded-2xl bg-accent/60 p-4 pl-5 text-[0.95rem] leading-relaxed text-foreground before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-pink-500">
          {conteudo.texto}
        </blockquote>
      )}
    </div>
  )
}

function VideoDemo({ titulo, duracaoSeg, resumo }: { titulo: string; duracaoSeg: number; resumo: string }) {
  const [tocando, setTocando] = useState(false)
  const [t, setT] = useState(0)

  useEffect(() => {
    if (!tocando) return
    const id = window.setInterval(() => {
      setT((v) => {
        if (v + 1 >= duracaoSeg) {
          setTocando(false)
          return duracaoSeg
        }
        return v + 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [tocando, duracaoSeg])

  return (
    <div className="overflow-hidden rounded-2xl bg-neutral-950 text-white shadow-xl">
      <div className="relative grid aspect-video place-items-center bg-[radial-gradient(circle_at_30%_30%,#7c3aed,transparent_55%),radial-gradient(circle_at_80%_70%,#ec4899,transparent_50%)]">
        <div className="text-center">
          <div className="text-6xl">📺📐</div>
          <p className="mt-2 px-6 font-heading text-lg font-bold">{titulo}</p>
        </div>
        <button
          onClick={() => setTocando((v) => !v)}
          className="absolute inset-0 grid place-items-center bg-black/0 transition hover:bg-black/20"
          aria-label={tocando ? "Pausar vídeo" : "Tocar vídeo"}
        >
          {!tocando && (
            <span className="grid size-16 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xl">
              <PlayIcon className="size-7 translate-x-0.5" />
            </span>
          )}
        </button>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        {tocando ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-pink-500 transition-all" style={{ width: `${(t / duracaoSeg) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-white/70">
          {duracao(t)} / {duracao(duracaoSeg)}
        </span>
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-sm text-white/75">🎬 {resumo}</p>
    </div>
  )
}

function Ilustracao({ tipo }: { tipo: "celula" | "triangulo" | "linha-do-tempo" }) {
  if (tipo === "celula") {
    return (
      <svg viewBox="0 0 520 240" className="mx-auto w-full max-w-lg" role="img" aria-label="Célula vegetal e célula animal">
        {/* vegetal */}
        <rect x="20" y="30" width="220" height="180" rx="18" fill="#bbf7d0" stroke="#15803d" strokeWidth="8" />
        <rect x="34" y="44" width="192" height="152" rx="12" fill="#dcfce7" stroke="#4ade80" strokeWidth="3" />
        <rect x="95" y="70" width="110" height="95" rx="30" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="70" cy="150" r="22" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="3" />
        {[[60, 75], [180, 185], [55, 110]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="16" ry="9" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
        ))}
        <text x="130" y="228" textAnchor="middle" fontSize="14" fontWeight="700" fill="#166534">🌿 Vegetal</text>
        {/* animal */}
        <path d="M300 120c0-60 50-95 105-90s100 45 95 95-45 90-100 85-100-30-100-90z" fill="#fce7f3" stroke="#db2777" strokeWidth="4" />
        <circle cx="400" cy="120" r="26" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="3" />
        {[[345, 90], [450, 160], [360, 170]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="15" ry="8" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
        ))}
        <text x="400" y="228" textAnchor="middle" fontSize="14" fontWeight="700" fill="#9d174d">🐾 Animal</text>
      </svg>
    )
  }
  if (tipo === "triangulo") {
    return (
      <svg viewBox="0 0 300 200" className="mx-auto w-full max-w-sm" role="img" aria-label="Triângulo retângulo">
        <polygon points="40,170 260,170 260,40" fill="#ede9fe" stroke="#7c3aed" strokeWidth="4" />
        <rect x="244" y="154" width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="3" />
        <text x="150" y="192" textAnchor="middle" fontWeight="700" fill="#4c1d95">4 m</text>
        <text x="275" y="110" fontWeight="700" fill="#4c1d95">3 m</text>
        <text x="130" y="95" fontWeight="700" fill="#db2777">? m</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 400 80" className="w-full" role="img" aria-label="Linha do tempo">
      <line x1="20" y1="40" x2="380" y2="40" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
      {[60, 200, 340].map((x) => (
        <circle key={x} cx={x} cy="40" r="9" fill="#ec4899" />
      ))}
    </svg>
  )
}
