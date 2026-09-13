import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { useLoja, useUsuario } from "@/lib/store"
import {
  blocosDaSala,
  desafiosDaSala,
  emblemasConquistados,
  estatisticasDoAluno,
  prazoDoDesafio,
  statusDoDesafio,
  tituloAtual,
  xpNaSala,
  xpTotal,
} from "@/lib/regras"
import { primeiroNome, saudacao, tempoRelativo } from "@/lib/formatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarEmoji, BarraProgresso, NotaBadge, Vazio, XpPill } from "@/components/comum"
import { CartaoDesafio } from "@/components/CartaoDesafio"
import { ConvitesPendentes, DialogEntrarComCodigo } from "@/components/Convites"
import { GraficoTempoDeTela } from "@/components/GraficoTempoDeTela"
import { MosaicoAluno } from "@/components/Mosaico"

export default function InicioAluno() {
  const { dados } = useLoja()
  const usuario = useUsuario()

  const salas = dados.salas.filter((s) => s.alunoIds.includes(usuario.id))
  const xp = xpTotal(dados, usuario.id)
  const { atual, proximo, progresso } = tituloAtual(xp)
  const stats = estatisticasDoAluno(dados, usuario.id)
  const emblemas = salas.flatMap((s) => emblemasConquistados(dados, usuario.id, s))

  // "Você vs. você de ontem": XP ganho nos últimos 7 dias comparado aos 7 anteriores.
  const semana = 7 * 86400000
  const agora = Date.now()
  const xpNoPeriodo = (de: number, ate: number) =>
    dados.respostas
      .filter((r) => r.alunoId === usuario.id && r.avaliacao)
      .filter((r) => {
        const t = new Date(r.avaliacao!.avaliadaEm).getTime()
        return t > de && t <= ate
      })
      .reduce((a, r) => a + r.avaliacao!.xpGanho, 0)
  const xpSemana = xpNoPeriodo(agora - semana, agora)
  const xpSemanaPassada = xpNoPeriodo(agora - 2 * semana, agora - semana)

  const pendentes = salas
    .flatMap((sala) => desafiosDaSala(dados, sala).map((desafio) => ({ sala, desafio })))
    .filter(({ sala, desafio }) => desafio.autorId !== usuario.id && statusDoDesafio(dados, usuario.id, desafio, sala) === "pendente")
    .sort((a, b) => prazoDoDesafio(a.desafio, a.sala).getTime() - prazoDoDesafio(b.desafio, b.sala).getTime())

  const feedbacks = dados.respostas
    .filter((r) => r.alunoId === usuario.id && r.avaliacao)
    .sort((a, b) => b.avaliacao!.avaliadaEm.localeCompare(a.avaliacao!.avaliadaEm))
    .slice(0, 3)

  const hojeMin = usuario.tempoDeTela.at(-1) ?? 0
  const mediaMin = Math.round(usuario.tempoDeTela.reduce((a, b) => a + b, 0) / usuario.tempoDeTela.length)

  return (
    <div className="space-y-6">
      {/* Herói */}
      <section className="relative overflow-hidden rounded-3xl bg-brand p-5 text-white shadow-xl shadow-primary/25 sm:p-7">
        <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-6 bottom-4 hidden text-8xl opacity-90 sm:block animate-float">{atual.emoji}</div>
        <div className="relative flex items-center gap-3">
          <AvatarEmoji usuario={usuario} tamanho="lg" className="ring-white/40" />
          <div>
            <p className="text-sm text-white/80">{saudacao()},</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{primeiroNome(usuario.nome)}! 👋</h1>
          </div>
        </div>
        <div className="relative mt-5 max-w-md space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-heading text-lg font-bold">
              {atual.emoji} {atual.nome}
            </p>
            <p className="text-sm font-semibold tabular-nums">⚡ {xp} XP</p>
          </div>
          <BarraProgresso valor={progresso} className="h-3 bg-white/25" corClassName="bg-xp" />
          <p className="text-sm text-white/85">
            {proximo ? `Faltam ${proximo.xp - xp} XP para ${proximo.emoji} ${proximo.nome}` : "Você chegou ao título máximo! 🏆"}
          </p>
        </div>
        <div className="relative mt-5 inline-flex flex-wrap items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-sm backdrop-blur">
          <span>🪞 Você vs. você da semana passada:</span>
          <strong className="tabular-nums">
            {xpSemana >= xpSemanaPassada ? "📈" : "🌱"} {xpSemana} XP <span className="font-normal text-white/75">(antes: {xpSemanaPassada})</span>
          </strong>
        </div>
      </section>

      <ConvitesPendentes />

      {/* Números */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { emoji: "🤩", valor: stats.excelentes, rotulo: "Excelentes", cor: "from-emerald-400/20" },
          { emoji: "👍", valor: stats.boas, rotulo: "Boas respostas", cor: "from-sky-400/20" },
          { emoji: "🌱", valor: stats.aMelhorar, rotulo: "Para melhorar", cor: "from-amber-400/20" },
          { emoji: "⏳", valor: stats.aguardando, rotulo: "Aguardando", cor: "from-violet-400/20" },
        ].map((s) => (
          <Card key={s.rotulo} size="sm" className={`bg-gradient-to-br ${s.cor} to-card`}>
            <CardContent>
              <span className="text-2xl">{s.emoji}</span>
              <p className="mt-1 font-heading text-3xl font-extrabold tabular-nums">{s.valor}</p>
              <p className="text-xs text-muted-foreground">{s.rotulo}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 *:min-w-0 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">🎯 Pra explicar agora</CardTitle>
              <CardDescription>Sessões curtas: um desafio por vez já faz diferença.</CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/salas">
                    Ver salas <ArrowRightIcon />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendentes.length ? (
                pendentes.slice(0, 5).map(({ sala, desafio }) => (
                  <CartaoDesafio key={sala.id + desafio.id} desafio={desafio} sala={sala} alunoId={usuario.id} mostrarSala />
                ))
              ) : salas.length ? (
                <Vazio emoji="🎉" titulo="Tudo em dia!" texto="Nenhum desafio pendente. Aproveita pra descansar a vista 🌿" />
              ) : (
                <Vazio emoji="🏫" titulo="Você ainda não está em nenhuma sala" texto="Aceite um convite ou use o código que seu professor passou.">
                  <DialogEntrarComCodigo />
                </Vazio>
              )}
            </CardContent>
          </Card>

          {/* Feedbacks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">💌 Últimos feedbacks</CardTitle>
              <CardDescription>Quem avaliou e o que dá pra melhorar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feedbacks.length === 0 && <Vazio emoji="📭" titulo="Nenhum feedback ainda" />}
              {feedbacks.map((r) => {
                const desafio = dados.desafios.find((d) => d.id === r.desafioId)!
                const avaliador = dados.usuarios.find((u) => u.id === r.avaliacao!.avaliadorId)!
                const sala = dados.salas.find((s) => s.id === r.salaId)!
                const papelAvaliador =
                  avaliador.papel === "professor" ? "professor(a)" : sala.monitorIds.includes(avaliador.id) ? "monitor(a)" : "autor(a) do desafio"
                return (
                  <Link key={r.id} to={`/desafios/${r.salaId}/${r.desafioId}`} className="block rounded-2xl border p-3 transition hover:border-primary/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{desafio.titulo}</p>
                      <XpPill xp={r.avaliacao!.xpGanho} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <NotaBadge nota={r.avaliacao!.nota} />
                      {r.usouIA && <span className="text-xs text-muted-foreground">🤖 IA declarada (−50%)</span>}
                    </div>
                    {r.avaliacao!.justificativa && (
                      <p className="mt-2 text-sm text-muted-foreground">“{r.avaliacao!.justificativa}”</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      <AvatarEmoji usuario={avaliador} tamanho="xs" className="mr-1 align-middle" /> Avaliado por <strong className="text-foreground">{avaliador.nome}</strong> ({papelAvaliador}) ·{" "}
                      {tempoRelativo(r.avaliacao!.avaliadaEm)}
                    </p>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Bem-estar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">🌿 Seu tempo no app</CardTitle>
              <CardDescription>
                Hoje: <strong className="text-foreground">{hojeMin} min</strong> · média da semana: {mediaMin} min
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <GraficoTempoDeTela minutos={usuario.tempoDeTela} />
              <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200">
                {hojeMin <= 30
                  ? "Uso equilibrado! Aprender em pequenas doses funciona melhor que maratonar. 💚"
                  : "Hoje foi puxado. Que tal fechar o app e fazer uma pausa? 🌳"}
              </p>
            </CardContent>
          </Card>

          {/* Mosaicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">🧩 Seus mosaicos</CardTitle>
              <CardDescription>Cada XP revela uma peça da imagem da turma.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {salas.map((sala) => {
                const blocos = blocosDaSala(dados, sala)
                const meu = blocos.find((b) => b.aluno.id === usuario.id)
                return (
                  <Link key={sala.id} to={`/salas/${sala.id}?aba=mosaico`} className="group space-y-1.5">
                    <div className="transition group-hover:scale-[1.02]">
                      <MosaicoAluno blocos={blocos} alunoId={usuario.id} />
                    </div>
                    <p className="truncate text-xs font-semibold">
                      {sala.emoji} {sala.nome}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {meu?.pecas ?? 0}/16 peças · {xpNaSala(dados, usuario.id, sala)} XP
                    </p>
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          {/* Emblemas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">🏅 Emblemas</CardTitle>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/perfil">Ver todos</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {emblemas.length === 0 && <p className="text-sm text-muted-foreground">Seu primeiro emblema está chegando 👀</p>}
              {emblemas.map((e) => (
                <span key={e.id} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
                  {e.emoji} {e.nome}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
