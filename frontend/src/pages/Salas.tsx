import { Link } from "react-router"
import { PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { desafiosDaSala, GRADIENTES, statusDoDesafio, xpMaximoDaSala, xpNaSala } from "@/lib/regras"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AvatarEmoji, BarraProgresso, CabecalhoPagina, Vazio } from "@/components/comum"
import { ConvitesPendentes, DialogEntrarComCodigo } from "@/components/Convites"
import { DialogNovaSala } from "@/components/DialogNovaSala"

export default function Salas() {
  const { dados } = useLoja()
  const usuario = useUsuario()
  const ehProfessor = usuario.papel === "professor"
  const salas = dados.salas.filter((s) => (ehProfessor ? s.professorId === usuario.id : s.alunoIds.includes(usuario.id)))

  return (
    <div>
      <CabecalhoPagina
        emoji="🏫"
        titulo={ehProfessor ? "Suas salas" : "Minhas salas"}
        descricao={ehProfessor ? "Organize turmas, tópicos, monitores e emblemas." : "Seus desafios organizados por turma."}
        acao={
          ehProfessor ? (
            <DialogNovaSala
              gatilho={
                <Button className="bg-brand text-white">
                  <PlusIcon /> Nova sala
                </Button>
              }
            />
          ) : (
            <DialogEntrarComCodigo />
          )
        }
      />

      {!ehProfessor && (
        <div className="mb-6">
          <ConvitesPendentes />
        </div>
      )}

      {salas.length === 0 && (
        <Vazio emoji="🪴" titulo="Nenhuma sala por aqui" texto={ehProfessor ? "Crie a primeira sala e convide seus alunos." : "Peça o código ao seu professor."} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {salas.map((sala) => {
          const prof = dados.usuarios.find((u) => u.id === sala.professorId)!
          const desafios = desafiosDaSala(dados, sala)
          const xp = xpNaSala(dados, usuario.id, sala)
          const max = xpMaximoDaSala(dados, sala)
          const pendentes = desafios.filter((d) => d.autorId !== usuario.id && statusDoDesafio(dados, usuario.id, d, sala) === "pendente").length
          const alunos = sala.alunoIds.map((id) => dados.usuarios.find((u) => u.id === id)!).filter(Boolean)
          return (
            <Link
              key={sala.id}
              to={`/salas/${sala.id}`}
              className="group overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className={cn("relative h-24 bg-gradient-to-br p-4", GRADIENTES[sala.cor])}>
                <span className="absolute right-4 -bottom-6 text-6xl drop-shadow-lg transition group-hover:scale-110 group-hover:-rotate-6">{sala.emoji}</span>
                {!ehProfessor && sala.monitorIds.includes(usuario.id) && (
                  <Badge className="border-0 bg-white/90 text-neutral-900">🛡️ Você é monitor(a)</Badge>
                )}
                {ehProfessor && <Badge className="border-0 bg-black/25 font-mono text-white">🔑 {sala.codigo}</Badge>}
              </div>
              <div className="space-y-3 p-4 pt-3">
                <div className="pr-14">
                  <h2 className="font-heading text-lg leading-tight font-bold">{sala.nome}</h2>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{sala.descricao}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex -space-x-2">
                    {alunos.slice(0, 5).map((a) => (
                      <AvatarEmoji key={a.id} usuario={a} tamanho="sm" />
                    ))}
                    {alunos.length > 5 && (
                      <span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold ring-2 ring-background">+{alunos.length - 5}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {ehProfessor ? `${alunos.length} alunos` : `${prof.avatar} ${prof.nome.split(" ")[0]}`}
                  </span>
                </div>
                {ehProfessor ? (
                  <p className="text-sm text-muted-foreground">
                    📚 {sala.topicoIds.length} tópicos · 🎯 {desafios.length} desafios · 🏅 {sala.emblemas.length} emblemas
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{pendentes ? `✏️ ${pendentes} pendente(s)` : "🎉 Tudo em dia"}</span>
                      <span className="font-semibold tabular-nums">
                        ⚡ {xp}/{max} XP
                      </span>
                    </div>
                    <BarraProgresso valor={max ? (xp / max) * 100 : 0} />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
