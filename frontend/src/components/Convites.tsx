import { useState } from "react"
import { useNavigate } from "react-router"
import { KeyRoundIcon } from "lucide-react"
import { toast } from "sonner"
import { useLoja, useUsuario } from "@/lib/store"
import { tempoRelativo } from "@/lib/formatar"
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
import { AvatarEmoji } from "./comum"

export function ConvitesPendentes() {
  const { dados, responderConvite } = useLoja()
  const usuario = useUsuario()
  const convites = dados.convites.filter((c) => c.alunoId === usuario.id && c.status === "pendente")
  if (!convites.length) return null

  return (
    <div className="space-y-2">
      {convites.map((c) => {
        const sala = dados.salas.find((s) => s.id === c.salaId)!
        const prof = dados.usuarios.find((u) => u.id === sala.professorId)!
        return (
          <div
            key={c.id}
            className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/60 p-4 sm:flex-row sm:items-center"
          >
            <span className="text-3xl">💌</span>
            <div className="flex-1">
              <p className="font-semibold">
                Convite para {sala.emoji} {sala.nome}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <AvatarEmoji usuario={prof} tamanho="xs" /> {prof.nome} te convidou · {tempoRelativo(c.criadoEm)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => responderConvite(c.id, false)}>
                Agora não
              </Button>
              <Button
                className="bg-brand text-white"
                onClick={() => {
                  responderConvite(c.id, true)
                  toast.success(`Você entrou em ${sala.nome}! ${sala.emoji}`)
                }}
              >
                Aceitar convite
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function DialogEntrarComCodigo() {
  const { entrarComCodigo } = useLoja()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [codigo, setCodigo] = useState("")

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRoundIcon /> Entrar com código
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const sala = entrarComCodigo(codigo)
            if (!sala) {
              toast.error("Código não encontrado 🤔", { description: "Confira com seu professor. Ex.: CIE-EL9" })
              return
            }
            toast.success(`Bem-vindo(a) a ${sala.nome}! ${sala.emoji}`)
            setAberto(false)
            navigate(`/salas/${sala.id}`)
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>🔑 Entrar com código</DialogTitle>
            <DialogDescription>Seu professor compartilha o código da sala. Experimente CIE-EL9.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="ABC-123"
            className="h-12 text-center font-mono text-xl tracking-widest"
          />
          <DialogFooter>
            <Button type="submit" className="w-full bg-brand text-white" disabled={codigo.length < 5}>
              Entrar na sala
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
