import { useLoja, useUsuario } from "@/lib/store"
import { podeAvaliar, ROTULO_NOTA, PERCENTUAL_NOTA, PENALIDADE_IA } from "@/lib/regras"
import type { Nota } from "@/lib/types"
import { CabecalhoPagina } from "@/components/comum"
import { ListaRespostas } from "@/components/ListaRespostas"

export default function Avaliar() {
  const { dados } = useLoja()
  const usuario = useUsuario()

  const respostas = dados.respostas.filter((r) => {
    if (r.alunoId === usuario.id) return false
    const sala = dados.salas.find((s) => s.id === r.salaId)
    const desafio = dados.desafios.find((d) => d.id === r.desafioId)
    return !!sala && podeAvaliar(usuario, sala, desafio)
  })

  return (
    <div className="mx-auto max-w-4xl">
      <CabecalhoPagina
        emoji="✅"
        titulo="Avaliar respostas"
        descricao={
          usuario.papel === "professor"
            ? "Respostas das suas salas. Um feedback curto e gentil já muda tudo."
            : "Como monitor(a) ou autor(a) de desafio, você ajuda a turma a evoluir. 🛡️"
        }
      />
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        {([3, 2, 1] as Nota[]).map((n) => (
          <div key={n} className="rounded-2xl border bg-card p-3 text-sm">
            <p className="font-semibold">
              {ROTULO_NOTA[n].emoji} {n} · {ROTULO_NOTA[n].texto}
            </p>
            <p className="text-muted-foreground">{PERCENTUAL_NOTA[n]}% do XP</p>
          </div>
        ))}
      </div>
      <p className="mb-5 text-xs text-muted-foreground">🤖 Se o aluno declarou uso de IA, o percentual cai {PENALIDADE_IA} pontos (mínimo 0%).</p>
      <ListaRespostas respostas={respostas} mostrarSala />
    </div>
  )
}
