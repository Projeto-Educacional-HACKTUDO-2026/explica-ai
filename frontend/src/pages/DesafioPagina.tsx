import { useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { ArrowLeftIcon, RotateCcwIcon, SendIcon, SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import {
  calcularXp,
  desafiosDaSala,
  maxTentativas,
  PENALIDADE_IA,
  podeAvaliar,
  podeRefazer,
  prazoDoDesafio,
  respostasDoAluno,
  statusDoDesafio,
  xpDoDesafio,
} from "@/lib/regras"
import { dataCurta, duracao, textoPrazo } from "@/lib/formatar"
import type { Desafio, Sala } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AvatarEmoji, StatusBadge, TipoBadge, Vazio, XpPill } from "@/components/comum"
import { ConteudoDoDesafio } from "@/components/ConteudoDoDesafio"
import { GravadorAudio, type Gravacao } from "@/components/GravadorAudio"
import { ListaRespostas } from "@/components/ListaRespostas"
import { TentativaCard } from "@/components/TentativaCard"
import { TextoSemApagar } from "@/components/TextoSemApagar"

export default function DesafioPagina() {
  const { salaId, desafioId } = useParams()
  const { dados } = useLoja()
  const usuario = useUsuario()
  const sala = dados.salas.find((s) => s.id === salaId)
  const desafio = dados.desafios.find((d) => d.id === desafioId)

  if (!sala || !desafio) return <Navigate to="/inicio" replace />
  const participa = sala.professorId === usuario.id || sala.alunoIds.includes(usuario.id)
  if (!participa || !desafiosDaSala(dados, sala).some((d) => d.id === desafio.id)) return <Navigate to={`/salas/${sala.id}`} replace />

  const avaliador = podeAvaliar(usuario, sala, desafio)
  const ehAutor = desafio.autorId === usuario.id
  const ehAluno = usuario.papel === "aluno" && !ehAutor
  const xp = xpDoDesafio(dados, desafio, sala)
  const prazo = prazoDoDesafio(desafio, sala)
  const autor = dados.usuarios.find((u) => u.id === desafio.autorId)!

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to={`/salas/${sala.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> {sala.emoji} {sala.nome}
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TipoBadge tipo={desafio.tipo} />
          <XpPill xp={xp} />
          <span className="text-sm text-muted-foreground">⏳ {textoPrazo(prazo)} · até {dataCurta(prazo)}</span>
          {ehAluno && <StatusBadge status={statusDoDesafio(dados, usuario.id, desafio, sala)} />}
        </div>
        <h1 className="text-2xl leading-tight font-extrabold sm:text-3xl">{desafio.titulo}</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <AvatarEmoji usuario={autor} tamanho="xs" />
          {desafio.criadoPorAluno ? `Desafio criado por ${autor.nome} 🔥` : `Por ${autor.nome}`}
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 *:min-w-0 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 lg:sticky lg:top-6">
          <ConteudoDoDesafio desafio={desafio} />
          <div className="rounded-2xl bg-xp/25 p-4 ring-1 ring-xp/60">
            <p className="text-xs font-bold tracking-wide text-xp-foreground uppercase dark:text-xp">🎯 Sua missão</p>
            <p className="mt-1 font-medium">{desafio.enunciado}</p>
          </div>
        </div>

        <div className="space-y-4">
          {ehAluno && <AreaDoAluno desafio={desafio} sala={sala} />}
          {avaliador && <AreaDoAvaliador desafio={desafio} sala={sala} />}
          {ehAutor && !avaliador && <Vazio emoji="🔥" titulo="Esse desafio é seu!" texto="Aguardando aprovação do professor." />}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Aluno ───────────────────────── */

function AreaDoAluno({ desafio, sala }: { desafio: Desafio; sala: Sala }) {
  const { dados, enviarResposta } = useLoja()
  const usuario = useUsuario()
  const tentativas = respostasDoAluno(dados, usuario.id, desafio.id, sala.id)
  const status = statusDoDesafio(dados, usuario.id, desafio, sala)
  const refazer = podeRefazer(dados, usuario.id, desafio, sala)
  const [querRefazer, setQuerRefazer] = useState(false)
  const xpBase = xpDoDesafio(dados, desafio, sala)

  const [formato, setFormato] = useState<"texto" | "audio">(desafio.formatoResposta === "audio" ? "audio" : "texto")
  const [texto, setTexto] = useState("")
  const [gravacao, setGravacao] = useState<Gravacao | null>(null)
  const [usouIA, setUsouIA] = useState(false)
  const [reinicios, setReinicios] = useState(0)
  const [enviadoAgora, setEnviadoAgora] = useState(false)

  const mostrarEditor = status === "pendente" || (refazer && querRefazer)

  const enviar = () => {
    if (formato === "texto" && texto.trim().length < 20) return toast.error("Capricha mais um pouquinho: pelo menos 20 caracteres ✍️")
    if (formato === "audio" && !gravacao) return toast.error("Grave seu áudio antes de enviar 🎙️")
    enviarResposta({
      desafioId: desafio.id,
      salaId: sala.id,
      alunoId: usuario.id,
      formato,
      texto: formato === "texto" ? texto.trim() : undefined,
      audioUrl: formato === "audio" ? gravacao?.audioUrl : undefined,
      transcricao: formato === "audio" ? gravacao?.transcricao : undefined,
      duracaoSeg: formato === "audio" ? gravacao?.duracaoSeg : undefined,
      usouIA,
      reinicios,
    })
    setEnviadoAgora(true)
    setQuerRefazer(false)
    setTexto("")
    setGravacao(null)
    setReinicios(0)
    toast.success("Explicação enviada! 🚀", { description: "Você será avisado(a) quando for avaliada." })
  }

  return (
    <>
      {enviadoAgora && (
        <div className="animate-pop rounded-3xl bg-brand p-5 text-center text-white shadow-xl">
          <p className="text-5xl">🎉</p>
          <p className="mt-2 font-heading text-xl font-bold">Mandou bem!</p>
          <p className="text-white/85">Explicar com as próprias palavras é o jeito mais forte de aprender. Agora é hora de uma pausa 🌿</p>
          <Button asChild className="mt-4 bg-white text-primary hover:bg-white/90">
            <Link to="/inicio">Voltar ao início</Link>
          </Button>
        </div>
      )}

      {tentativas.map((r) => (
        <TentativaCard key={r.id} resposta={r} total={maxTentativas(desafio, sala)} />
      ))}

      {status === "encerrado" && (
        <Vazio emoji="💤" titulo="O prazo deste desafio acabou" texto="Sem stress! Converse com seu professor se quiser uma nova chance. Tem outros desafios te esperando." />
      )}

      {refazer && !querRefazer && (
        <Card className="ring-2 ring-primary/30">
          <CardContent className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <span className="text-4xl">🔁</span>
            <div className="flex-1">
              <p className="font-semibold">Quer tentar de novo?</p>
              <p className="text-sm text-muted-foreground">
                Você usou {tentativas.length} de {maxTentativas(desafio, sala)} tentativas. Vale a sua melhor nota — o XP nunca diminui.
              </p>
            </div>
            <Button className="bg-brand text-white" onClick={() => setQuerRefazer(true)}>
              Refazer desafio
            </Button>
          </CardContent>
        </Card>
      )}

      {mostrarEditor && (
        <Card className="rounded-3xl shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{tentativas.length ? "🔁 Nova tentativa" : "💬 Explica aí!"}</CardTitle>
            <CardDescription>
              {formato === "texto"
                ? "Escreva de uma vez, como numa conversa. Não dá pra apagar — se travar, reinicie."
                : `Fale como se estivesse explicando para um amigo. Até ${duracao(desafio.limiteAudioSeg)}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {desafio.formatoResposta === "ambos" && (
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
                {(["texto", "audio"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormato(f)}
                    disabled={(f === "texto" && !!gravacao) || (f === "audio" && texto.length > 0)}
                    className={cn(
                      "rounded-xl py-2 text-sm font-semibold transition disabled:opacity-40",
                      formato === f ? "bg-background shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    {f === "texto" ? "✍️ Texto" : "🎙️ Áudio"}
                  </button>
                ))}
              </div>
            )}

            {formato === "texto" ? (
              <>
                <TextoSemApagar
                  valor={texto}
                  onChange={setTexto}
                  limite={desafio.limiteCaracteres}
                  placeholder="Imagina que você está explicando pra alguém que nunca ouviu falar disso…"
                />
                <DialogReiniciar
                  desabilitado={!texto}
                  onConfirmar={() => {
                    setTexto("")
                    setReinicios((n) => n + 1)
                  }}
                />
              </>
            ) : (
              <GravadorAudio
                limiteSeg={desafio.limiteAudioSeg}
                gravacao={gravacao}
                onChange={setGravacao}
                onReiniciar={() => setReinicios((n) => n + 1)}
              />
            )}

            <label className="flex items-start gap-3 rounded-2xl border p-3">
              <Switch checked={usouIA} onCheckedChange={setUsouIA} className="mt-0.5" />
              <span className="text-sm">
                <span className="font-semibold">🤖 Usei IA generativa nesta resposta</span>
                <span className="block text-muted-foreground">
                  Tudo bem! A honestidade conta: o XP ganho fica {PENALIDADE_IA}% menor, nada além disso.
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>
                ⚡ Com nota máxima você ganha <strong>{calcularXp(xpBase, 3, usouIA)} XP</strong>
                {usouIA && <span className="text-muted-foreground"> (sem IA: {xpBase})</span>}
              </span>
              <Button size="lg" className="bg-brand text-white" onClick={enviar}>
                <SendIcon /> Enviar explicação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function DialogReiniciar({ desabilitado, onConfirmar }: { desabilitado: boolean; onConfirmar: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={desabilitado}>
          <RotateCcwIcon /> Reiniciar resposta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Começar do zero? 🔄</DialogTitle>
          <DialogDescription>Todo o texto será apagado. Às vezes recomeçar ajuda a organizar as ideias!</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Continuar escrevendo</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirmar}>
              Reiniciar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────── Professor / monitor ───────────────────────── */

function AreaDoAvaliador({ desafio, sala }: { desafio: Desafio; sala: Sala }) {
  const { dados } = useLoja()
  const usuario = useUsuario()
  const respostas = dados.respostas.filter((r) => r.desafioId === desafio.id && r.salaId === sala.id)
  const responderam = new Set(respostas.map((r) => r.alunoId))
  const faltam = sala.alunoIds.filter((id) => !responderam.has(id) && id !== desafio.autorId)

  return (
    <>
      {(sala.professorId === usuario.id || sala.monitorIds.includes(usuario.id)) && !desafio.criadoPorAluno && (
        <ConfigDoDesafio desafio={desafio} sala={sala} podeMudarXp={sala.professorId === usuario.id} />
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">📥 Respostas da turma</CardTitle>
          <CardDescription>
            {responderam.size} de {sala.alunoIds.length - (desafio.criadoPorAluno ? 1 : 0)} alunos responderam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ListaRespostas respostas={respostas.filter((r) => r.alunoId !== usuario.id)} />
          {faltam.length > 0 && (
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Ainda não responderam</p>
              <div className="flex flex-wrap gap-2">
                {faltam.map((id) => {
                  const a = dados.usuarios.find((u) => u.id === id)!
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-background px-2 py-1 text-xs">
                      <AvatarEmoji usuario={a} tamanho="xs" /> {a.nome.split(" ")[0]}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ConfigDoDesafio({ desafio, sala, podeMudarXp }: { desafio: Desafio; sala: Sala; podeMudarXp: boolean }) {
  const { dados, atualizarConfig } = useLoja()
  const config = sala.configs[desafio.id]
  const padrao = dados.topicos.find((t) => t.id === desafio.topicoId)?.xpPadrao ?? 50
  const [xp, setXp] = useState(String(xpDoDesafio(dados, desafio, sala)))
  const [tentativas, setTentativas] = useState(String(maxTentativas(desafio, sala)))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <SettingsIcon /> Ajustes nesta sala · ⚡ {xpDoDesafio(dados, desafio, sala)} XP · 🔁 {maxTentativas(desafio, sala)} tentativas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>⚙️ Ajustes do desafio em {sala.nome}</DialogTitle>
          <DialogDescription>Valem só para esta sala. O XP padrão do tópico é {padrao}.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cfg-xp">XP do desafio</Label>
            <Input id="cfg-xp" type="number" min={0} max={500} value={xp} disabled={!podeMudarXp} onChange={(e) => setXp(e.target.value)} />
            {!podeMudarXp && <p className="text-[11px] text-muted-foreground">Só o professor altera o XP.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfg-tent">Tentativas por aluno</Label>
            <Input id="cfg-tent" type="number" min={1} max={10} value={tentativas} onChange={(e) => setTentativas(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          📅 Na sala desde {config ? dataCurta(config.adicionadoEm) : "—"} · prazo de {desafio.prazoDias} dias
        </p>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={!podeMudarXp}
              onClick={() => {
                atualizarConfig(sala.id, desafio.id, { adicionadoEm: new Date().toISOString() })
                toast.success("Prazo reiniciado a partir de hoje ⏳")
              }}
            >
              Reiniciar prazo
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="bg-brand text-white"
              onClick={() => {
                atualizarConfig(sala.id, desafio.id, {
                  ...(podeMudarXp && { xp: Math.max(0, Number(xp) || 0) }),
                  maxTentativas: Math.max(1, Number(tentativas) || 1),
                })
                toast.success("Ajustes salvos ✅")
              }}
            >
              Salvar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
