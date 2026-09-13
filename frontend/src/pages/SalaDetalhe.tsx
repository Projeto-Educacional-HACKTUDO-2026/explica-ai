import { useState } from "react"
import { Link, Navigate, useParams, useSearchParams } from "react-router"
import { ArrowLeftIcon, CopyIcon, LinkIcon, PlusIcon, UnlinkIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import {
  blocosDaSala,
  desafiosDaSala,
  emblemasConquistados,
  GRADIENTES,
  xpMaximoDaSala,
  xpNaSala,
} from "@/lib/regras"
import type { Sala } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarEmoji, BarraProgresso, Vazio } from "@/components/comum"
import { CartaoDesafio } from "@/components/CartaoDesafio"
import { DialogNovoDesafio } from "@/components/DialogNovoDesafio"
import { ListaRespostas } from "@/components/ListaRespostas"
import { MosaicoAluno, MosaicoTurma } from "@/components/Mosaico"

export default function SalaDetalhe() {
  const { salaId } = useParams()
  const { dados } = useLoja()
  const usuario = useUsuario()
  const [params, setParams] = useSearchParams()
  const sala = dados.salas.find((s) => s.id === salaId)

  if (!sala) return <Navigate to="/salas" replace />
  const ehProfessor = sala.professorId === usuario.id
  const ehMonitor = sala.monitorIds.includes(usuario.id)
  if (!ehProfessor && !sala.alunoIds.includes(usuario.id)) return <Navigate to="/salas" replace />

  const prof = dados.usuarios.find((u) => u.id === sala.professorId)!
  const aba = params.get("aba") ?? "desafios"
  const respostasDaSala = dados.respostas.filter((r) => r.salaId === sala.id)
  const aguardando = respostasDaSala.filter((r) => !r.avaliacao && r.alunoId !== usuario.id).length
  const aprovacoes = dados.desafios.filter((d) => d.criadoPorAluno?.salaId === sala.id && d.criadoPorAluno.status === "pendente")

  return (
    <div className="space-y-6">
      <Link to="/salas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Salas
      </Link>

      <section className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-xl sm:p-7", GRADIENTES[sala.cor])}>
        <span className="pointer-events-none absolute -right-2 -bottom-6 text-[8rem] leading-none opacity-30 select-none sm:opacity-90">{sala.emoji}</span>
        <div className="relative max-w-2xl space-y-3">
          <div className="flex flex-wrap gap-2">
            {ehProfessor && <Badge className="border-0 bg-black/25 text-white">👩‍🏫 Você é o(a) professor(a)</Badge>}
            {ehMonitor && <Badge className="border-0 bg-white/90 text-neutral-900">🛡️ Você é monitor(a)</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold drop-shadow-sm sm:text-4xl">{sala.nome}</h1>
          <p className="text-white/90">{sala.descricao}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5">
              <AvatarEmoji usuario={prof} tamanho="xs" /> {prof.nome}
            </span>
            <span>🎒 {sala.alunoIds.length} alunos</span>
            {ehProfessor && (
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(sala.codigo)
                  toast.success("Código copiado! 📋")
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 font-mono text-xs"
              >
                🔑 {sala.codigo} <CopyIcon className="size-3" />
              </button>
            )}
          </div>
          {!ehProfessor && (
            <div className="pt-1">
              <DialogNovoDesafio
                salaDoAluno={sala.id}
                gatilho={<Button className="bg-white text-neutral-900 hover:bg-white/90">🔥 Desafiar colegas</Button>}
              />
            </div>
          )}
        </div>
      </section>

      <Tabs value={aba} onValueChange={(v) => setParams({ aba: v }, { replace: true })}>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList className="h-10!">
            <TabsTrigger value="desafios">🎯 Desafios</TabsTrigger>
            <TabsTrigger value="mosaico">🧩 Mosaico</TabsTrigger>
            <TabsTrigger value="turma">🎒 Turma</TabsTrigger>
            <TabsTrigger value="emblemas">🏅 Emblemas</TabsTrigger>
            {(ehProfessor || ehMonitor) && <TabsTrigger value="respostas">📥 Respostas {aguardando > 0 && `(${aguardando})`}</TabsTrigger>}
            {ehProfessor && <TabsTrigger value="aprovacoes">✅ Aprovações {aprovacoes.length > 0 && `(${aprovacoes.length})`}</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="desafios" className="mt-4">
          <AbaDesafios sala={sala} ehProfessor={ehProfessor} />
        </TabsContent>
        <TabsContent value="mosaico" className="mt-4">
          <AbaMosaico sala={sala} ehProfessor={ehProfessor} />
        </TabsContent>
        <TabsContent value="turma" className="mt-4">
          <AbaTurma sala={sala} ehProfessor={ehProfessor} />
        </TabsContent>
        <TabsContent value="emblemas" className="mt-4">
          <AbaEmblemas sala={sala} ehProfessor={ehProfessor} />
        </TabsContent>
        <TabsContent value="respostas" className="mt-4">
          <ListaRespostas respostas={respostasDaSala.filter((r) => r.alunoId !== usuario.id)} />
        </TabsContent>
        <TabsContent value="aprovacoes" className="mt-4">
          <AbaAprovacoes sala={sala} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ───────────────────────── Desafios ───────────────────────── */

function AbaDesafios({ sala, ehProfessor }: { sala: Sala; ehProfessor: boolean }) {
  const { dados, desvincularTopico } = useLoja()
  const usuario = useUsuario()
  const desafios = desafiosDaSala(dados, sala)
  const topicos = sala.topicoIds.map((id) => dados.topicos.find((t) => t.id === id)!).filter(Boolean)
  const daTurma = desafios.filter((d) => d.criadoPorAluno)
  const meusCriados = dados.desafios.filter((d) => d.criadoPorAluno?.salaId === sala.id && d.autorId === usuario.id && d.criadoPorAluno.status !== "aprovado")

  return (
    <div className="space-y-6">
      {ehProfessor && (
        <div className="flex flex-wrap gap-2">
          <DialogVincularTopico sala={sala} />
          <DialogNovoDesafio
            gatilho={
              <Button variant="outline">
                <PlusIcon /> Novo desafio
              </Button>
            }
          />
        </div>
      )}

      {topicos.length === 0 && <Vazio emoji="📚" titulo="Nenhum tópico nesta sala" texto={ehProfessor ? "Vincule um tópico para liberar desafios." : "Logo seu professor vai liberar desafios."} />}

      {topicos.map((topico) => {
        const lista = desafios.filter((d) => d.topicoId === topico.id && !d.criadoPorAluno)
        return (
          <section key={topico.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">
                  {topico.emoji} {topico.titulo}
                </h2>
                <p className="text-sm text-muted-foreground">{topico.descricao}</p>
              </div>
              {ehProfessor && (
                <div className="flex gap-1">
                  {topico.autorId === usuario.id && (
                    <DialogNovoDesafio
                      topicoId={topico.id}
                      gatilho={
                        <Button size="sm" variant="ghost">
                          <PlusIcon /> Desafio
                        </Button>
                      }
                    />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      desvincularTopico(sala.id, topico.id)
                      toast("Tópico desvinculado da sala")
                    }}
                  >
                    <UnlinkIcon /> Desvincular
                  </Button>
                </div>
              )}
            </div>
            <div className="grid gap-2 lg:grid-cols-2">
              {lista.map((d) => (
                <CartaoDesafio key={d.id} desafio={d} sala={sala} alunoId={ehProfessor ? undefined : usuario.id} />
              ))}
            </div>
          </section>
        )
      })}

      {(daTurma.length > 0 || meusCriados.length > 0) && (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">🔥 Desafios criados pela turma</h2>
            <p className="text-sm text-muted-foreground">Colegas desafiando colegas, com aprovação do professor.</p>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {daTurma.map((d) => (
              <CartaoDesafio key={d.id} desafio={d} sala={sala} alunoId={ehProfessor || d.autorId === usuario.id ? undefined : usuario.id} />
            ))}
            {meusCriados.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-dashed p-3">
                <span className="text-2xl">{d.criadoPorAluno!.status === "pendente" ? "⏳" : "✏️"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.criadoPorAluno!.status === "pendente" ? "Seu desafio está aguardando aprovação" : "O professor pediu ajustes neste desafio"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function DialogVincularTopico({ sala }: { sala: Sala }) {
  const { dados, vincularTopico } = useLoja()
  const usuario = useUsuario()
  const [aberto, setAberto] = useState(false)
  const disponiveis = dados.topicos.filter((t) => t.autorId === usuario.id && !sala.topicoIds.includes(t.id))

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button className="bg-brand text-white">
          <LinkIcon /> Vincular tópico
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>📚 Vincular tópico</DialogTitle>
          <DialogDescription>Os prazos dos desafios começam a contar a partir de agora nesta sala.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {disponiveis.length === 0 && (
            <Vazio emoji="📭" titulo="Nenhum tópico disponível">
              <Button asChild variant="outline" size="sm">
                <Link to="/topicos">Criar ou importar tópicos</Link>
              </Button>
            </Vazio>
          )}
          {disponiveis.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                vincularTopico(sala.id, t.id)
                toast.success(`${t.emoji} ${t.titulo} vinculado! Alunos notificados.`)
                setAberto(false)
              }}
              className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:border-primary/40 hover:bg-secondary/40"
            >
              <span className="text-2xl">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.titulo}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {dados.desafios.filter((d) => d.topicoId === t.id && !d.criadoPorAluno).length} desafios · {t.materia}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────── Mosaico ───────────────────────── */

function AbaMosaico({ sala, ehProfessor }: { sala: Sala; ehProfessor: boolean }) {
  const { dados } = useLoja()
  const usuario = useUsuario()
  const blocos = blocosDaSala(dados, sala)
  const max = xpMaximoDaSala(dados, sala)
  const meuXp = xpNaSala(dados, usuario.id, sala)

  return (
    <div className="grid grid-cols-1 gap-6 *:min-w-0 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">🌅 Mosaico da turma</CardTitle>
          <CardDescription>Cada aluno constrói um pedaço. A imagem só fica completa quando todo mundo chegar lá — juntos, sem ranking.</CardDescription>
        </CardHeader>
        <CardContent>
          <MosaicoTurma blocos={blocos} destacarId={ehProfessor ? undefined : usuario.id} />
        </CardContent>
      </Card>
      {!ehProfessor ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">🧩 Seu pedaço</CardTitle>
            <CardDescription>
              {meuXp} de {max} XP possíveis nesta sala
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto max-w-56">
              <MosaicoAluno blocos={blocos} alunoId={usuario.id} />
            </div>
            <BarraProgresso valor={max ? (meuXp / max) * 100 : 0} />
            <p className="text-sm text-muted-foreground">
              Cada {Math.max(1, Math.round(max / 16))} XP revela uma nova peça. Refazer desafios conta a melhor tentativa — seu XP nunca diminui. 💚
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">📊 Progresso individual</CardTitle>
            <CardDescription>Visível só para você. Os alunos não veem o XP dos colegas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {blocos
              .slice()
              .sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome))
              .map((b) => {
                const xp = xpNaSala(dados, b.aluno.id, sala)
                return (
                  <div key={b.aluno.id} className="flex items-center gap-3">
                    <AvatarEmoji usuario={b.aluno} tamanho="sm" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{b.aluno.nome}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{xp} XP · {b.pecas}/16</span>
                      </div>
                      <BarraProgresso valor={max ? (xp / max) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ───────────────────────── Turma ───────────────────────── */

function AbaTurma({ sala, ehProfessor }: { sala: Sala; ehProfessor: boolean }) {
  const { dados, alternarMonitor } = useLoja()
  const alunos = sala.alunoIds
    .map((id) => dados.usuarios.find((u) => u.id === id)!)
    .filter(Boolean)
    .sort((a, b) => a.nome.localeCompare(b.nome))
  const convitesPendentes = dados.convites.filter((c) => c.salaId === sala.id && c.status === "pendente")
  const desafios = desafiosDaSala(dados, sala)

  return (
    <div className="space-y-4">
      {ehProfessor && (
        <div className="flex flex-wrap items-center gap-2">
          <DialogConvidar sala={sala} />
          {convitesPendentes.length > 0 && (
            <span className="text-sm text-muted-foreground">
              💌 {convitesPendentes.length} convite(s) pendente(s):{" "}
              {convitesPendentes.map((c) => dados.usuarios.find((u) => u.id === c.alunoId)?.nome.split(" ")[0]).join(", ")}
            </span>
          )}
        </div>
      )}
      {!ehProfessor && (
        <p className="rounded-2xl bg-secondary/60 p-3 text-sm">
          🤝 Aqui ninguém compete com ninguém: cada um no seu ritmo. Os monitores 🛡️ ajudam a avaliar as respostas.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {alunos.map((a) => {
          const monitor = sala.monitorIds.includes(a.id)
          const respondidos = new Set(dados.respostas.filter((r) => r.salaId === sala.id && r.alunoId === a.id).map((r) => r.desafioId)).size
          return (
            <Card key={a.id} size="sm">
              <CardContent className="flex gap-3">
                <AvatarEmoji usuario={a} tamanho="lg" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                    {a.nome}
                    {monitor && <Badge className="border-0 bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300">🛡️ monitor(a)</Badge>}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{a.bio || "Sem bio ainda"}</p>
                  {ehProfessor && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        🎯 {respondidos}/{desafios.length} desafios · ⚡ {xpNaSala(dados, a.id, sala)} XP
                      </p>
                      <label className="flex items-center gap-2 pt-1 text-xs font-medium">
                        <Switch
                          checked={monitor}
                          onCheckedChange={() => {
                            alternarMonitor(sala.id, a.id)
                            toast.success(monitor ? `${a.nome.split(" ")[0]} deixou de ser monitor(a)` : `${a.nome.split(" ")[0]} agora é monitor(a) 🛡️`)
                          }}
                        />
                        Monitor(a) da sala
                      </label>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function DialogConvidar({ sala }: { sala: Sala }) {
  const { dados, convidarAluno } = useLoja()
  const [busca, setBusca] = useState("")
  const candidatos = dados.usuarios.filter(
    (u) =>
      u.papel === "aluno" &&
      !sala.alunoIds.includes(u.id) &&
      (u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())),
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-brand text-white">
          <UserPlusIcon /> Convidar alunos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>💌 Convidar alunos</DialogTitle>
          <DialogDescription>
            Busque por nome ou e-mail, ou compartilhe o código <strong className="font-mono">{sala.codigo}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Input placeholder="Buscar aluno…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {candidatos.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Todo mundo já está aqui 🎉</p>}
          {candidatos.map((u) => {
            const pendente = dados.convites.some((c) => c.salaId === sala.id && c.alunoId === u.id && c.status === "pendente")
            return (
              <div key={u.id} className="flex items-center gap-3 rounded-xl border p-2">
                <AvatarEmoji usuario={u} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  size="sm"
                  variant={pendente ? "secondary" : "default"}
                  disabled={pendente}
                  onClick={() => {
                    convidarAluno(sala.id, u.id)
                    toast.success(`Convite enviado para ${u.nome.split(" ")[0]} 💌`)
                  }}
                >
                  {pendente ? "Convidado" : "Convidar"}
                </Button>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ───────────────────────── Emblemas ───────────────────────── */

const EMOJIS_EMBLEMA = ["🏆", "🌟", "🚀", "🎤", "🧠", "💡", "🔥", "🌿", "🦠", "📜", "🍎", "🎨", "🤝", "🛡️", "💎", "🐉"]

function AbaEmblemas({ sala, ehProfessor }: { sala: Sala; ehProfessor: boolean }) {
  const { dados, criarEmblema, concederEmblema } = useLoja()
  const usuario = useUsuario()
  const conquistados = new Set(emblemasConquistados(dados, usuario.id, sala).map((e) => e.id))
  const meuXp = xpNaSala(dados, usuario.id, sala)
  const [aberto, setAberto] = useState(false)
  const [emoji, setEmoji] = useState("🏆")
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [xpMinimo, setXpMinimo] = useState("")

  return (
    <div className="space-y-4">
      {ehProfessor && (
        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button className="bg-brand text-white">
              <PlusIcon /> Criar emblema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!nome.trim()) return toast.error("Dê um nome ao emblema")
                criarEmblema(sala.id, {
                  emoji,
                  nome: nome.trim(),
                  descricao: descricao.trim() || (xpMinimo ? `Chegou a ${xpMinimo} XP na sala` : "Concedido pelo professor"),
                  xpMinimo: xpMinimo ? Number(xpMinimo) : undefined,
                })
                toast.success(`Emblema ${emoji} ${nome} criado!`)
                setAberto(false)
                setNome("")
                setDescricao("")
                setXpMinimo("")
              }}
            >
              <DialogHeader>
                <DialogTitle>🏅 Novo emblema</DialogTitle>
                <DialogDescription>Automático por XP ou concedido manualmente, para celebrar conquistas.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-1">
                {EMOJIS_EMBLEMA.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={cn("grid size-10 place-items-center rounded-xl text-2xl hover:bg-muted", emoji === e && "bg-secondary ring-2 ring-primary")}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-nome">Nome</Label>
                <Input id="e-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Rei(nha) da Analogia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-desc">Descrição</Label>
                <Input id="e-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-xp">XP mínimo (deixe vazio para conceder manualmente)</Label>
                <Input id="e-xp" type="number" min={0} value={xpMinimo} onChange={(e) => setXpMinimo(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-brand text-white">
                  Criar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sala.emblemas.map((e) => {
          const tem = conquistados.has(e.id)
          const donos = sala.alunoIds.filter((id) => emblemasConquistados(dados, id, sala).some((x) => x.id === e.id))
          return (
            <Card key={e.id} size="sm" className={cn(!ehProfessor && !tem && "opacity-70")}>
              <CardContent className="flex gap-3">
                <span
                  className={cn(
                    "grid size-16 shrink-0 place-items-center rounded-2xl text-4xl",
                    ehProfessor || tem ? "bg-gradient-to-br from-amber-200 to-pink-300 shadow-md dark:from-amber-400/30 dark:to-pink-500/30" : "bg-muted grayscale",
                  )}
                >
                  {e.emoji}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold">{e.nome}</p>
                  <p className="text-xs text-muted-foreground">{e.descricao}</p>
                  {!ehProfessor &&
                    (tem ? (
                      <Badge className="border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">✨ Conquistado</Badge>
                    ) : e.xpMinimo !== undefined ? (
                      <div className="space-y-1">
                        <BarraProgresso valor={(meuXp / e.xpMinimo) * 100} className="h-1.5" />
                        <p className="text-[11px] text-muted-foreground">
                          {meuXp}/{e.xpMinimo} XP
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">🎁 Concedido pelo professor</p>
                    ))}
                  {ehProfessor && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">
                        {donos.length} aluno(s) · {e.xpMinimo !== undefined ? `automático (${e.xpMinimo} XP)` : "manual"}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="xs" variant="outline">
                            🎁 Conceder
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Conceder para…</DropdownMenuLabel>
                          {sala.alunoIds
                            .filter((id) => !donos.includes(id))
                            .map((id) => {
                              const a = dados.usuarios.find((u) => u.id === id)!
                              return (
                                <DropdownMenuItem
                                  key={id}
                                  onClick={() => {
                                    concederEmblema(sala.id, e.id, id)
                                    toast.success(`${e.emoji} concedido para ${a.nome.split(" ")[0]}!`)
                                  }}
                                >
                                  {a.avatar} {a.nome}
                                </DropdownMenuItem>
                              )
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ───────────────────────── Aprovações ───────────────────────── */

function AbaAprovacoes({ sala }: { sala: Sala }) {
  const { dados, decidirDesafioDeAluno } = useLoja()
  const lista = dados.desafios.filter((d) => d.criadoPorAluno?.salaId === sala.id)

  if (!lista.length) return <Vazio emoji="🔥" titulo="Nenhum desafio criado por alunos" texto="Quando alguém desafiar a turma, aparece aqui para você aprovar." />

  return (
    <div className="space-y-3">
      {lista.map((d) => {
        const autor = dados.usuarios.find((u) => u.id === d.autorId)!
        const status = d.criadoPorAluno!.status
        const tentativas = dados.respostas.filter((r) => r.desafioId === d.id).length
        return (
          <Card key={d.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <AvatarEmoji usuario={autor} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{d.titulo}</p>
                  <Badge variant={status === "aprovado" ? "secondary" : "outline"}>
                    {status === "aprovado" ? "✅ aprovado" : status === "pendente" ? "⏳ pendente" : "✏️ ajustes pedidos"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">por {autor.nome}</p>
                {d.conteudo.texto && <p className="text-sm">{d.conteudo.texto}</p>}
                <p className="text-sm font-medium">🎯 {d.enunciado}</p>
                {status === "aprovado" && <p className="text-xs text-muted-foreground">{tentativas} resposta(s) até agora</p>}
              </div>
              {status === "pendente" && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => decidirDesafioDeAluno(d.id, false)}>
                    Pedir ajustes
                  </Button>
                  <Button
                    className="bg-brand text-white"
                    onClick={() => {
                      decidirDesafioDeAluno(d.id, true)
                      toast.success("Desafio aprovado e liberado para a turma 🔥")
                    }}
                  >
                    ✅ Aprovar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

