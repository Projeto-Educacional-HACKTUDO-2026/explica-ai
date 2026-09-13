import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { duracao } from "@/lib/formatar"
import type { ConteudoDesafio, FormatoResposta, MemeTemplate, TipoConteudo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ICONE_TIPO } from "@/lib/icones"
import { GravadorAudio, type Gravacao } from "./GravadorAudio"
import { Meme } from "./Meme"

interface Props {
  gatilho: ReactNode
  /** Tópico fixo (professor criando dentro de um tópico). */
  topicoId?: string
  /** Modo "Desafiar colegas": aluno cria um desafio para a sala, que vai para aprovação. */
  salaDoAluno?: string
}

const XP_DESAFIO_DE_ALUNO = 30

export function DialogNovoDesafio({ gatilho, topicoId: topicoFixo, salaDoAluno }: Props) {
  const { dados, criarDesafio } = useLoja()
  const usuario = useUsuario()
  const modoAluno = !!salaDoAluno
  const sala = dados.salas.find((s) => s.id === salaDoAluno)
  const topicosDisponiveis = modoAluno
    ? dados.topicos.filter((t) => sala?.topicoIds.includes(t.id))
    : dados.topicos.filter((t) => t.autorId === usuario.id)

  const [aberto, setAberto] = useState(false)
  const [topicoId, setTopicoId] = useState(topicoFixo ?? topicosDisponiveis[0]?.id ?? "")
  const [titulo, setTitulo] = useState("")
  const [tipo, setTipo] = useState<TipoConteudo>("meme")
  const [enunciado, setEnunciado] = useState("")
  const [texto, setTexto] = useState("")
  const [template, setTemplate] = useState<MemeTemplate>("classico")
  const [cena, setCena] = useState("🤔📚")
  const [cenaB, setCenaB] = useState("💡😎")
  const [topo, setTopo] = useState("")
  const [base, setBase] = useState("")
  const [roteiro, setRoteiro] = useState("")
  const [gravacao, setGravacao] = useState<Gravacao | null>(null)
  const [imagemUrl, setImagemUrl] = useState<string>()
  const [legenda, setLegenda] = useState("")
  const [videoTitulo, setVideoTitulo] = useState("")
  const [formato, setFormato] = useState<FormatoResposta>("texto")
  const [limiteCaracteres, setLimiteCaracteres] = useState(400)
  const [limiteAudio, setLimiteAudio] = useState(60)
  const [prazoDias, setPrazoDias] = useState(7)
  const topico = dados.topicos.find((t) => t.id === topicoId)
  const [xp, setXp] = useState<number | null>(null)
  const [tentativas, setTentativas] = useState(2)

  const xpEfetivo = modoAluno ? XP_DESAFIO_DE_ALUNO : (xp ?? topico?.xpPadrao ?? 50)

  const montarConteudo = (): ConteudoDesafio | null => {
    switch (tipo) {
      case "texto":
        return texto.trim() ? { texto: texto.trim() } : null
      case "meme":
        return topo.trim() && base.trim() ? { meme: { template, cena, cenaB, topo: topo.trim(), base: base.trim() } } : null
      case "audio":
        if (!gravacao && !roteiro.trim()) return null
        return {
          audio: {
            locutor: usuario.nome,
            audioUrl: gravacao?.audioUrl,
            transcricao: roteiro.trim() || gravacao?.transcricao || "",
            duracaoSeg: gravacao?.duracaoSeg ?? Math.max(8, Math.round(roteiro.split(/\s+/).length / 2.6)),
          },
        }
      case "imagem":
        return { imagem: imagemUrl ? { url: imagemUrl, legenda } : { ilustracao: "celula", legenda: legenda || "Ilustração" } }
      case "video":
        return videoTitulo.trim() ? { video: { titulo: videoTitulo.trim(), duracaoSeg: 90, resumo: legenda || "Vídeo do desafio" } } : null
    }
  }

  const salvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicoId) return toast.error("Escolha um tópico")
    if (titulo.trim().length < 4) return toast.error("Dê um título ao desafio")
    if (enunciado.trim().length < 10) return toast.error("Escreva o que o aluno deve explicar")
    const conteudo = montarConteudo()
    if (!conteudo) return toast.error(`Complete o conteúdo do tipo ${ICONE_TIPO[tipo].rotulo.toLowerCase()}`)

    criarDesafio({
      topicoId,
      titulo: titulo.trim(),
      tipo,
      enunciado: enunciado.trim(),
      conteudo,
      formatoResposta: formato,
      limiteCaracteres,
      limiteAudioSeg: limiteAudio,
      prazoDias,
      xp: modoAluno ? XP_DESAFIO_DE_ALUNO : (xp ?? undefined),
      maxTentativas: modoAluno ? 1 : tentativas,
      criadoPorAluno: modoAluno ? { salaId: salaDoAluno!, status: "pendente" } : undefined,
    })
    toast.success(modoAluno ? "Desafio enviado para aprovação do professor 📨" : "Desafio publicado! Os alunos foram notificados ✨")
    setAberto(false)
    setTitulo("")
    setEnunciado("")
    setTopo("")
    setBase("")
    setTexto("")
    setRoteiro("")
    setGravacao(null)
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{gatilho}</DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={salvar} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl">{modoAluno ? "🔥 Desafiar colegas" : "✨ Novo desafio"}</DialogTitle>
            <DialogDescription>
              {modoAluno
                ? "Crie um desafio para sua turma. Ele aparece para todos depois que o professor aprovar, e você poderá avaliar as respostas."
                : "Um bom desafio pede uma explicação simples de algo importante."}
            </DialogDescription>
          </DialogHeader>

          {!topicoFixo && (
            <div className="space-y-2">
              <Label>Tópico</Label>
              <Select value={topicoId} onValueChange={setTopicoId}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Escolha um tópico" />
                </SelectTrigger>
                <SelectContent>
                  {topicosDisponiveis.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.emoji} {t.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="d-titulo">Título</Label>
            <Input id="d-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Explica o meme da mitocôndria 🦠" />
          </div>

          <div className="space-y-2">
            <Label>Tipo de conteúdo</Label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(ICONE_TIPO) as TipoConteudo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 py-2 text-xs font-medium transition",
                    tipo === t ? "border-primary bg-secondary" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="text-xl">{ICONE_TIPO[t].emoji}</span>
                  {ICONE_TIPO[t].rotulo}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo específico do tipo */}
          <div className="space-y-3 rounded-2xl bg-muted/50 p-3">
            {tipo === "texto" && (
              <div className="space-y-2">
                <Label htmlFor="d-texto">Texto de apoio</Label>
                <Textarea id="d-texto" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Uma situação, citação ou trecho para o aluno analisar." />
              </div>
            )}
            {tipo === "meme" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Formato do meme</Label>
                    <Select value={template} onValueChange={(v) => setTemplate(v as MemeTemplate)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classico">🖼️ Clássico (texto em cima e embaixo)</SelectItem>
                        <SelectItem value="drake">🙅👉 Não × Sim</SelectItem>
                        <SelectItem value="expectativa">✨💀 Expectativa × Realidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="d-cena">Emojis {template !== "classico" && "(1)"}</Label>
                      <Input id="d-cena" value={cena} onChange={(e) => setCena(e.target.value)} />
                    </div>
                    {template !== "classico" && (
                      <div className="space-y-1">
                        <Label htmlFor="d-cenab">Emojis (2)</Label>
                        <Input id="d-cenab" value={cenaB} onChange={(e) => setCenaB(e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="d-topo">{template === "classico" ? "Texto de cima" : "Primeiro painel"}</Label>
                    <Input id="d-topo" value={topo} onChange={(e) => setTopo(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="d-base">{template === "classico" ? "Texto de baixo" : "Segundo painel"}</Label>
                    <Input id="d-base" value={base} onChange={(e) => setBase(e.target.value)} />
                  </div>
                </div>
                <div className="grid place-items-center">
                  <Meme className="max-w-60" meme={{ template, cena, cenaB, topo: topo || "Texto de cima", base: base || "Texto de baixo" }} />
                </div>
              </div>
            )}
            {tipo === "audio" && (
              <div className="space-y-3">
                <Label>Grave sua pergunta 🎙️</Label>
                <GravadorAudio limiteSeg={180} gravacao={gravacao} onChange={setGravacao} onReiniciar={() => undefined} />
                <div className="space-y-1">
                  <Label htmlFor="d-roteiro">Transcrição / roteiro (acessibilidade)</Label>
                  <Textarea
                    id="d-roteiro"
                    rows={3}
                    value={roteiro}
                    onChange={(e) => setRoteiro(e.target.value)}
                    placeholder="Sem gravação? Escreva o roteiro: ele será lido por voz sintética."
                  />
                </div>
              </div>
            )}
            {tipo === "imagem" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="d-img">Imagem</Label>
                  <Input
                    id="d-img"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0]
                      if (!arquivo) return
                      if (arquivo.size > 1_500_000) return toast.error("Imagem muito grande (máx. 1,5 MB no protótipo)")
                      const leitor = new FileReader()
                      leitor.onload = () => setImagemUrl(String(leitor.result))
                      leitor.readAsDataURL(arquivo)
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Sem arquivo? Usamos uma ilustração de célula de exemplo.</p>
                </div>
                {imagemUrl && <img src={imagemUrl} alt="Pré-visualização" className="max-h-40 rounded-xl" />}
                <div className="space-y-1">
                  <Label htmlFor="d-legenda">Legenda</Label>
                  <Input id="d-legenda" value={legenda} onChange={(e) => setLegenda(e.target.value)} />
                </div>
              </div>
            )}
            {tipo === "video" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="d-video">Título do vídeo</Label>
                  <Input id="d-video" value={videoTitulo} onChange={(e) => setVideoTitulo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-resumo">Resumo</Label>
                  <Input id="d-resumo" value={legenda} onChange={(e) => setLegenda(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">🎬 No protótipo o vídeo é simulado; em produção o arquivo iria para um storage.</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-enunciado">O que o aluno deve explicar?</Label>
            <Textarea
              id="d-enunciado"
              rows={3}
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Ex.: Explique como se fosse para uma criança de 10 anos…"
            />
          </div>

          <div className="space-y-2">
            <Label>Formato da resposta</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["texto", "✍️ Texto"],
                  ["audio", "🎙️ Áudio"],
                  ["ambos", "✍️🎙️ Os dois"],
                ] as const
              ).map(([v, r]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormato(v)}
                  className={cn("rounded-xl border-2 py-2 text-sm font-medium transition", formato === v ? "border-primary bg-secondary" : "border-border")}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {formato !== "audio" && (
              <Controle rotulo="Limite de caracteres" valor={`${limiteCaracteres}`}>
                <Slider min={100} max={1000} step={10} value={[limiteCaracteres]} onValueChange={([v]) => setLimiteCaracteres(v)} />
              </Controle>
            )}
            {formato !== "texto" && (
              <Controle rotulo="Tempo máximo de áudio" valor={duracao(limiteAudio)}>
                <Slider min={15} max={180} step={5} value={[limiteAudio]} onValueChange={([v]) => setLimiteAudio(v)} />
              </Controle>
            )}
            <Controle rotulo="Prazo (a partir da entrada na sala)" valor={`${prazoDias} dias`}>
              <Slider min={1} max={30} value={[prazoDias]} onValueChange={([v]) => setPrazoDias(v)} />
            </Controle>
            {!modoAluno && (
              <>
                <Controle rotulo="Tentativas permitidas" valor={`${tentativas}x`}>
                  <Slider min={1} max={5} value={[tentativas]} onValueChange={([v]) => setTentativas(v)} />
                </Controle>
                <Controle
                  rotulo="XP do desafio"
                  valor={xp === null ? `${xpEfetivo} (padrão)` : `${xp}`}
                  acao={
                    xp !== null && (
                      <button type="button" className="text-xs text-primary underline" onClick={() => setXp(null)}>
                        usar padrão
                      </button>
                    )
                  }
                >
                  <Slider min={0} max={150} step={5} value={[xpEfetivo]} onValueChange={([v]) => setXp(v)} />
                </Controle>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" size="lg" className="bg-brand text-white">
              {modoAluno ? "Enviar para aprovação 📨" : "Publicar desafio 🚀"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Controle({ rotulo, valor, acao, children }: { rotulo: string; valor: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{rotulo}</Label>
        <span className="flex items-center gap-2">
          {acao}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold tabular-nums">{valor}</span>
        </span>
      </div>
      {children}
    </div>
  )
}
