import { useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja } from "@/lib/store"
import { GRADIENTES } from "@/lib/regras"
import type { CorTema } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"

const EMOJIS = ["🧬", "🏛️", "🔬", "➗", "🌍", "📖", "🎨", "⚗️", "💻", "🎵", "🏃", "🗣️"]

export function DialogNovaSala({ gatilho }: { gatilho: ReactNode }) {
  const { criarSala } = useLoja()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [emoji, setEmoji] = useState("🧬")
  const [cor, setCor] = useState<CorTema>("violeta")

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{gatilho}</DialogTrigger>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (nome.trim().length < 3) return toast.error("Dê um nome para a sala")
            const sala = criarSala({ nome: nome.trim(), descricao: descricao.trim(), emoji, cor })
            toast.success(`Sala criada! Código: ${sala.codigo} 🎉`)
            setAberto(false)
            setNome("")
            setDescricao("")
            navigate(`/salas/${sala.id}`)
          }}
        >
          <DialogHeader>
            <DialogTitle>🏫 Nova sala</DialogTitle>
            <DialogDescription>Depois é só vincular tópicos e convidar a turma.</DialogDescription>
          </DialogHeader>
          <div className={cn("flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-white", GRADIENTES[cor])}>
            <span className="text-4xl">{emoji}</span>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold">{nome || "Nome da sala"}</p>
              <p className="truncate text-sm text-white/85">{descricao || "Uma descrição curtinha"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sala-nome">Nome</Label>
            <Input id="sala-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: 3º C · Geografia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sala-desc">Descrição</Label>
            <Textarea id="sala-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Emoji e cor</Label>
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((e) => (
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
            <div className="flex gap-2 pt-1">
              {(Object.keys(GRADIENTES) as CorTema[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  aria-label={`Cor ${c}`}
                  onClick={() => setCor(c)}
                  className={cn("size-7 rounded-full bg-gradient-to-br ring-offset-2 ring-offset-background", GRADIENTES[c], cor === c && "ring-2 ring-primary")}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-brand text-white">
              Criar sala
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
