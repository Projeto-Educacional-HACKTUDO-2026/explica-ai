import { useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router"
import { ArrowLeftIcon, ChevronDownIcon, DownloadIcon, LinkIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { duracao } from "@/lib/formatar"
import type { Desafio } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { AvatarEmoji, TipoBadge, Vazio, XpPill } from "@/components/comum"
import { ConteudoDoDesafio } from "@/components/ConteudoDoDesafio"
import { DialogNovoDesafio } from "@/components/DialogNovoDesafio"

export default function TopicoDetalhe() {
  const { topicoId } = useParams()
  const { dados, alternarPublico, vincularTopico, importarTopico } = useLoja()
  const usuario = useUsuario()
  const navigate = useNavigate()
  const topico = dados.topicos.find((t) => t.id === topicoId)

  if (!topico || (topico.autorId !== usuario.id && !topico.publico)) return <Navigate to="/topicos" replace />
  const meu = topico.autorId === usuario.id
  const autor = dados.usuarios.find((u) => u.id === topico.autorId)!
  const desafios = dados.desafios.filter((d) => d.topicoId === topico.id && !d.criadoPorAluno)
  const minhasSalas = dados.salas.filter((s) => s.professorId === usuario.id)
  const origem = topico.origemId && dados.topicos.find((t) => t.id === topico.origemId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/topicos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Tópicos
      </Link>

      <header className="flex flex-col gap-4 rounded-3xl border bg-card p-5 sm:flex-row sm:items-center">
        <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-secondary text-5xl">{topico.emoji}</span>
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{topico.titulo}</h1>
          <p className="text-muted-foreground">{topico.descricao}</p>
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <AvatarEmoji usuario={autor} tamanho="xs" /> {autor.nome} · {topico.materia} · ⚡ {topico.xpPadrao} XP padrão
            {origem && ` · importado de “${origem.titulo}”`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {meu ? (
            <>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch
                  checked={topico.publico}
                  onCheckedChange={() => {
                    alternarPublico(topico.id)
                    toast.success(topico.publico ? "Tópico agora é privado 🔒" : "Tópico publicado na biblioteca 🌎")
                  }}
                />
                {topico.publico ? "🌎 Público" : "🔒 Privado"}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <LinkIcon /> Vincular a uma sala
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Suas salas</DropdownMenuLabel>
                  {minhasSalas.map((s) => {
                    const ja = s.topicoIds.includes(topico.id)
                    return (
                      <DropdownMenuItem
                        key={s.id}
                        disabled={ja}
                        onClick={() => {
                          vincularTopico(s.id, topico.id)
                          toast.success(`Vinculado a ${s.nome}! Os prazos começam hoje ⏳`)
                        }}
                      >
                        {s.emoji} {s.nome} {ja && "· já vinculado"}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              className="bg-brand text-white"
              onClick={() => {
                const copia = importarTopico(topico.id)
                toast.success("Tópico copiado para você! Agora pode editar e vincular ✨")
                navigate(`/topicos/${copia.id}`)
              }}
            >
              <DownloadIcon /> Usar este tópico
            </Button>
          )}
        </div>
      </header>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🎯 Desafios ({desafios.length})</h2>
        {meu && (
          <DialogNovoDesafio
            topicoId={topico.id}
            gatilho={
              <Button className="bg-brand text-white">
                <PlusIcon /> Novo desafio
              </Button>
            }
          />
        )}
      </div>

      {desafios.length === 0 && <Vazio emoji="✨" titulo="Nenhum desafio ainda" texto="Que tal começar com um meme educacional?" />}
      <div className="space-y-3">
        {desafios.map((d) => (
          <DesafioExpansivel key={d.id} desafio={d} xpPadrao={topico.xpPadrao} />
        ))}
      </div>
    </div>
  )
}

function DesafioExpansivel({ desafio, xpPadrao }: { desafio: Desafio; xpPadrao: number }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <button onClick={() => setAberto((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-semibold">{desafio.titulo}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <TipoBadge tipo={desafio.tipo} />
            <span>
              {desafio.formatoResposta === "audio" ? `🎙️ até ${duracao(desafio.limiteAudioSeg)}` : desafio.formatoResposta === "texto" ? `✍️ até ${desafio.limiteCaracteres} caracteres` : `✍️ ${desafio.limiteCaracteres} car. ou 🎙️ ${duracao(desafio.limiteAudioSeg)}`}
            </span>
            <span>📅 {desafio.prazoDias} dias</span>
            <span>🔁 {desafio.maxTentativas}x</span>
          </div>
        </div>
        <XpPill xp={desafio.xp ?? xpPadrao} />
        <ChevronDownIcon className={cn("size-4 shrink-0 transition", aberto && "rotate-180")} />
      </button>
      {aberto && (
        <div className="space-y-3 border-t bg-muted/30 p-4">
          <ConteudoDoDesafio desafio={desafio} />
          <p className="rounded-xl bg-xp/25 p-3 text-sm font-medium">🎯 {desafio.enunciado}</p>
        </div>
      )}
    </div>
  )
}
