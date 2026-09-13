import { Link } from "react-router"
import { CheckCheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { emHorarioDeDescanso, FIM_SILENCIO, INICIO_SILENCIO } from "@/lib/regras"
import { dataHora, tempoRelativo } from "@/lib/formatar"
import type { Notificacao, TipoNotificacao } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CabecalhoPagina, Vazio } from "@/components/comum"

const ICONES: Record<TipoNotificacao, string> = {
  desafio: "🎯",
  correcao: "✅",
  resumo: "📬",
  emblema: "🏅",
  convite: "💌",
  aprovacao: "🔥",
}

export default function Notificacoes() {
  const { dados, marcarNotificacoesLidas } = useLoja()
  const usuario = useUsuario()
  const agora = Date.now()

  const minhas = dados.notificacoes
    .filter((n) => n.usuarioId === usuario.id)
    .sort((a, b) => b.entregarEm.localeCompare(a.entregarEm))
  const entregues = minhas.filter((n) => new Date(n.entregarEm).getTime() <= agora)
  const agendadas = minhas.filter((n) => new Date(n.entregarEm).getTime() > agora)
  const novas = entregues.filter((n) => !n.lida)
  const antigas = entregues.filter((n) => n.lida)
  const silencio = emHorarioDeDescanso(new Date())

  return (
    <div className="mx-auto max-w-3xl">
      <CabecalhoPagina
        emoji="🔔"
        titulo="Avisos"
        descricao="Só o que importa, sem bombardeio."
        acao={
          novas.length > 0 && (
            <Button variant="outline" onClick={marcarNotificacoesLidas}>
              <CheckCheckIcon /> Marcar todas como lidas
            </Button>
          )
        }
      />

      <div
        className={cn(
          "mb-6 flex gap-3 rounded-2xl p-4 text-sm",
          silencio ? "bg-indigo-950 text-indigo-100" : "bg-gradient-to-r from-violet-100 to-pink-100 text-violet-950 dark:from-violet-500/15 dark:to-pink-500/15 dark:text-violet-100",
        )}
      >
        <span className="text-2xl">{silencio ? "🌙" : "🔕"}</span>
        <div>
          <p className="font-semibold">
            {silencio ? "Modo descanso ativo agora" : "Horário de descanso protegido"}: {INICIO_SILENCIO}h às {FIM_SILENCIO}h
          </p>
          <p className="opacity-80">
            Nesse período nenhuma notificação é enviada — elas esperam até as {FIM_SILENCIO}h.{" "}
            {usuario.papel === "professor"
              ? "As novas respostas chegam num resumo diário, uma vez por dia."
              : "Você é avisado(a) sobre desafios novos e correções."}
          </p>
        </div>
      </div>

      {minhas.length === 0 && <Vazio emoji="🍃" titulo="Nenhum aviso" texto="Tudo tranquilo por aqui." />}

      {novas.length > 0 && <Grupo titulo="✨ Novas" itens={novas} />}
      {agendadas.length > 0 && <Grupo titulo="🌙 Agendadas para o fim do horário de descanso" itens={agendadas} agendada />}
      {antigas.length > 0 && <Grupo titulo="Anteriores" itens={antigas} />}
    </div>
  )
}

function Grupo({ titulo, itens, agendada = false }: { titulo: string; itens: Notificacao[]; agendada?: boolean }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-bold text-muted-foreground">{titulo}</h2>
      <div className="space-y-2">
        {itens.map((n) => {
          const conteudo = (
            <div
              className={cn(
                "flex gap-3 rounded-2xl border bg-card p-3 transition",
                !n.lida && !agendada && "border-primary/30 bg-secondary/40",
                agendada && "border-dashed opacity-70",
                n.link && "hover:border-primary/50 hover:shadow-md",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-xl">{ICONES[n.tipo]}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{n.titulo}</p>
                <p className="text-sm text-muted-foreground">{n.texto}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {agendada ? `📵 será entregue ${dataHora(n.entregarEm)}` : tempoRelativo(n.entregarEm)}
                </p>
              </div>
              {!n.lida && !agendada && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-pink-500" />}
            </div>
          )
          return n.link && !agendada ? (
            <Link key={n.id} to={n.link} className="block">
              {conteudo}
            </Link>
          ) : (
            <div key={n.id}>{conteudo}</div>
          )
        })}
      </div>
    </section>
  )
}
