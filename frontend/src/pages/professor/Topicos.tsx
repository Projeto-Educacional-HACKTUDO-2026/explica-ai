import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { DownloadIcon, GlobeIcon, LockIcon, PlusIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import type { Topico } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ICONE_TIPO } from "@/lib/icones"
import { AvatarEmoji, CabecalhoPagina, Vazio } from "@/components/comum"

export default function Topicos() {
  const { dados, importarTopico } = useLoja()
  const usuario = useUsuario()
  const navigate = useNavigate()
  const [busca, setBusca] = useState("")

  const casa = (t: Topico) => `${t.titulo} ${t.materia} ${t.descricao}`.toLowerCase().includes(busca.toLowerCase())
  const meus = dados.topicos.filter((t) => t.autorId === usuario.id && casa(t))
  const publicos = dados.topicos.filter((t) => t.publico && t.autorId !== usuario.id && casa(t))

  return (
    <div>
      <CabecalhoPagina
        emoji="📚"
        titulo="Tópicos e desafios"
        descricao="Monte seus tópicos ou use os que outros professores compartilharam."
        acao={<DialogNovoTopico onCriado={(t) => navigate(`/topicos/${t.id}`)} />}
      />

      <div className="relative mb-4">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por tema ou matéria…" className="h-11 pl-9" />
      </div>

      <Tabs defaultValue="meus">
        <TabsList className="h-10!">
          <TabsTrigger value="meus">🗂️ Meus tópicos ({meus.length})</TabsTrigger>
          <TabsTrigger value="publicos">🌎 Biblioteca pública ({publicos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="meus" className="mt-4">
          {meus.length === 0 && <Vazio emoji="🗂️" titulo="Nenhum tópico ainda" texto="Crie um ou importe da biblioteca pública." />}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {meus.map((t) => (
              <CartaoTopico key={t.id} topico={t} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="publicos" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {publicos.map((t) => (
              <CartaoTopico
                key={t.id}
                topico={t}
                acao={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      const copia = importarTopico(t.id)
                      toast.success(`${t.emoji} ${t.titulo} agora está nos seus tópicos!`)
                      navigate(`/topicos/${copia.id}`)
                    }}
                  >
                    <DownloadIcon /> Usar
                  </Button>
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CartaoTopico({ topico, acao }: { topico: Topico; acao?: React.ReactNode }) {
  const { dados } = useLoja()
  const autor = dados.usuarios.find((u) => u.id === topico.autorId)!
  const desafios = dados.desafios.filter((d) => d.topicoId === topico.id && !d.criadoPorAluno)
  const salas = dados.salas.filter((s) => s.topicoIds.includes(topico.id))
  const tipos = [...new Set(desafios.map((d) => d.tipo))]

  return (
    <Link to={`/topicos/${topico.id}`} className="group flex flex-col rounded-3xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-3xl transition group-hover:scale-105 group-hover:-rotate-6">{topico.emoji}</span>
        <Badge variant="outline" className={cn(topico.publico && "border-emerald-300 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300")}>
          {topico.publico ? <GlobeIcon /> : <LockIcon />} {topico.publico ? "Público" : "Privado"}
        </Badge>
      </div>
      <h2 className="mt-3 font-heading text-lg leading-tight font-bold">{topico.titulo}</h2>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{topico.descricao}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <Badge variant="secondary">{topico.materia}</Badge>
        <Badge variant="secondary">⚡ {topico.xpPadrao} XP</Badge>
        <Badge variant="secondary">{tipos.map((t) => ICONE_TIPO[t].emoji).join(" ")} {desafios.length} desafios</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <AvatarEmoji usuario={autor} tamanho="xs" />
          <span className="truncate">{acao ? autor.nome : salas.length ? `Em ${salas.map((s) => s.emoji).join(" ")}` : "Em nenhuma sala"}</span>
        </span>
        {acao}
      </div>
    </Link>
  )
}

const EMOJIS_TOPICO = ["🌱", "🦠", "⚡", "🥖", "💡", "🍕", "📐", "🌍", "🧪", "📖", "🎭", "🧮"]

function DialogNovoTopico({ onCriado }: { onCriado: (t: Topico) => void }) {
  const { criarTopico } = useLoja()
  const [aberto, setAberto] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [materia, setMateria] = useState("")
  const [emoji, setEmoji] = useState("🌱")
  const [xpPadrao, setXpPadrao] = useState("50")
  const [publico, setPublico] = useState(false)

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button className="bg-brand text-white">
          <PlusIcon /> Novo tópico
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (titulo.trim().length < 3) return toast.error("Dê um título ao tópico")
            const t = criarTopico({
              titulo: titulo.trim(),
              descricao: descricao.trim(),
              materia: materia.trim() || "Geral",
              emoji,
              xpPadrao: Math.max(0, Number(xpPadrao) || 50),
              publico,
            })
            toast.success("Tópico criado! Agora adicione desafios ✨")
            setAberto(false)
            onCriado(t)
          }}
        >
          <DialogHeader>
            <DialogTitle>📚 Novo tópico</DialogTitle>
            <DialogDescription>Um tópico agrupa desafios sobre um mesmo assunto.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-1">
            {EMOJIS_TOPICO.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={cn("grid size-9 place-items-center rounded-lg text-xl hover:bg-muted", emoji === e && "bg-secondary ring-2 ring-primary")}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="t-titulo">Título</Label>
              <Input id="t-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Ciclo da água" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-materia">Matéria</Label>
              <Input id="t-materia" value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Geografia" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-desc">Descrição</Label>
            <Textarea id="t-desc" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="t-xp">XP padrão por desafio</Label>
              <Input id="t-xp" type="number" min={0} value={xpPadrao} onChange={(e) => setXpPadrao(e.target.value)} />
            </div>
            <label className="flex h-9 items-center gap-2 text-sm">
              <Switch checked={publico} onCheckedChange={setPublico} /> 🌎 Público
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-brand text-white">
              Criar tópico
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
