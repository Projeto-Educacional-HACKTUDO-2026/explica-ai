import { useState } from "react"
import { Link } from "react-router"
import { ChevronRightIcon } from "lucide-react"
import { useLoja } from "@/lib/store"
import { tempoRelativo } from "@/lib/formatar"
import type { Resposta } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarEmoji, NotaBadge, Vazio } from "./comum"

export function ListaRespostas({ respostas, mostrarSala = false }: { respostas: Resposta[]; mostrarSala?: boolean }) {
  const { dados } = useLoja()
  const [filtro, setFiltro] = useState<"aguardando" | "avaliadas" | "todas">("aguardando")

  const filtradas = respostas
    .filter((r) => (filtro === "todas" ? true : filtro === "aguardando" ? !r.avaliacao : !!r.avaliacao))
    .sort((a, b) => (filtro === "aguardando" ? a.enviadaEm.localeCompare(b.enviadaEm) : b.enviadaEm.localeCompare(a.enviadaEm)))

  const aguardando = respostas.filter((r) => !r.avaliacao).length

  return (
    <div className="space-y-3">
      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
        <TabsList>
          <TabsTrigger value="aguardando">⏳ Aguardando ({aguardando})</TabsTrigger>
          <TabsTrigger value="avaliadas">✅ Avaliadas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtradas.length === 0 && (
        <Vazio emoji={filtro === "aguardando" ? "🎉" : "📭"} titulo={filtro === "aguardando" ? "Nenhuma resposta esperando" : "Nada por aqui ainda"} />
      )}

      <div className="space-y-2">
        {filtradas.map((r) => {
          const aluno = dados.usuarios.find((u) => u.id === r.alunoId)!
          const desafio = dados.desafios.find((d) => d.id === r.desafioId)!
          const sala = dados.salas.find((s) => s.id === r.salaId)!
          const avaliador = r.avaliacao && dados.usuarios.find((u) => u.id === r.avaliacao!.avaliadorId)
          return (
            <Link
              key={r.id}
              to={`/avaliar/${r.id}`}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-3 transition hover:border-primary/40 hover:shadow-md"
            >
              <AvatarEmoji usuario={aluno} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {aluno.nome}
                  {r.tentativa > 1 && <span className="ml-2 text-xs font-medium text-pink-600 dark:text-pink-400">🔁 tentativa {r.tentativa}</span>}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {r.formato === "audio" ? "🎙️" : "✍️"} {desafio.titulo}
                  {mostrarSala && ` · ${sala.emoji} ${sala.nome}`}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{tempoRelativo(r.enviadaEm)}</span>
                  {r.usouIA && <span className="rounded-full bg-muted px-2 py-0.5">🤖 usou IA</span>}
                  {r.avaliacao && <NotaBadge nota={r.avaliacao.nota} />}
                  {avaliador && <span>por {avaliador.nome.split(" ")[0]}</span>}
                </div>
              </div>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
