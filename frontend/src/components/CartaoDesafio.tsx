import { Link } from "react-router"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLoja } from "@/lib/store"
import { prazoDoDesafio, statusDoDesafio, xpDoDesafio } from "@/lib/regras"
import { textoPrazo } from "@/lib/formatar"
import type { Desafio, Sala } from "@/lib/types"
import { ICONE_TIPO } from "@/lib/icones"
import { StatusBadge, XpPill } from "./comum"

export function CartaoDesafio({
  desafio,
  sala,
  alunoId,
  mostrarSala = false,
  href,
}: {
  desafio: Desafio
  sala: Sala
  alunoId?: string
  mostrarSala?: boolean
  href?: string
}) {
  const { dados } = useLoja()
  const status = alunoId ? statusDoDesafio(dados, alunoId, desafio, sala) : null
  const prazo = prazoDoDesafio(desafio, sala)
  const autorAluno = desafio.criadoPorAluno ? dados.usuarios.find((u) => u.id === desafio.autorId) : null
  const urgente = status === "pendente" && prazo.getTime() - Date.now() < 2 * 86400000

  return (
    <Link
      to={href ?? `/desafios/${sala.id}/${desafio.id}`}
      className="group flex items-center gap-3 rounded-2xl border bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl text-2xl",
          desafio.tipo === "meme" && "bg-amber-100 dark:bg-amber-400/15",
          desafio.tipo === "audio" && "bg-violet-100 dark:bg-violet-400/15",
          desafio.tipo === "texto" && "bg-pink-100 dark:bg-pink-400/15",
          desafio.tipo === "imagem" && "bg-emerald-100 dark:bg-emerald-400/15",
          desafio.tipo === "video" && "bg-sky-100 dark:bg-sky-400/15",
        )}
      >
        {ICONE_TIPO[desafio.tipo].emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{desafio.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {mostrarSala && (
            <span>
              {sala.emoji} {sala.nome}
            </span>
          )}
          {autorAluno && (
            <span className="font-medium text-pink-600 dark:text-pink-400">
              🔥 por {autorAluno.avatar} {autorAluno.nome.split(" ")[0]}
            </span>
          )}
          <span className={cn(urgente && "font-semibold text-pink-600 dark:text-pink-400")}>⏳ {textoPrazo(prazo)}</span>
          <span>{desafio.formatoResposta === "audio" ? "🎙️ resposta em áudio" : desafio.formatoResposta === "texto" ? "✍️ resposta em texto" : "✍️🎙️ texto ou áudio"}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <XpPill xp={xpDoDesafio(dados, desafio, sala)} />
        {status && <StatusBadge status={status} />}
      </div>
      <ChevronRightIcon className="hidden size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 sm:block" />
    </Link>
  )
}
