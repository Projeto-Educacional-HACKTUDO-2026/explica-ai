import { Link } from "react-router"
import { ArrowRightIcon, BookPlusIcon, CheckCheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { blocosDaSala, desafiosDaSala, mediaDeNotas, respostasParaAvaliar } from "@/lib/regras"
import { primeiroNome, saudacao, tempoRelativo } from "@/lib/formatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ICONE_TIPO } from "@/lib/icones"
import { AvatarEmoji, BarraProgresso, Vazio } from "@/components/comum"
import { MosaicoTurma } from "@/components/Mosaico"
import { DialogNovaSala } from "@/components/DialogNovaSala"

export default function InicioProfessor() {
  const { dados, decidirDesafioDeAluno } = useLoja()
  const usuario = useUsuario()

  const salas = dados.salas.filter((s) => s.professorId === usuario.id)
  const alunosUnicos = new Set(salas.flatMap((s) => s.alunoIds))
  const aAvaliar = respostasParaAvaliar(dados, usuario)

  const participacao = (salaId: string) => {
    const sala = salas.find((s) => s.id === salaId)!
    const desafios = desafiosDaSala(dados, sala)
    const esperado = desafios.length * sala.alunoIds.length
    if (!esperado) return 0
    const feitos = new Set(dados.respostas.filter((r) => r.salaId === salaId).map((r) => `${r.alunoId}:${r.desafioId}`)).size
    return Math.round((feitos / esperado) * 100)
  }
  const participacaoGeral = salas.length ? Math.round(salas.reduce((a, s) => a + participacao(s.id), 0) / salas.length) : 0

  // Conceitos com menor média: onde a turma mais precisa de ajuda.
  const conceitos = salas
    .flatMap((sala) =>
      desafiosDaSala(dados, sala).map((desafio) => {
        const respostas = dados.respostas.filter((r) => r.salaId === sala.id && r.desafioId === desafio.id && r.avaliacao)
        const contagem = { 1: 0, 2: 0, 3: 0 }
        for (const r of respostas) contagem[r.avaliacao!.nota]++
        return { sala, desafio, media: mediaDeNotas(respostas), total: respostas.length, contagem }
      }),
    )
    .filter((c) => c.media !== null)
    .sort((a, b) => a.media! - b.media!)
    .slice(0, 5)

  const aprovacoes = dados.desafios.filter(
    (d) => d.criadoPorAluno?.status === "pendente" && salas.some((s) => s.id === d.criadoPorAluno!.salaId),
  )

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-brand p-5 text-white shadow-xl shadow-primary/25 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -bottom-8 text-[9rem] leading-none opacity-20 select-none">📚</div>
        <div className="relative flex items-center gap-3">
          <AvatarEmoji usuario={usuario} tamanho="lg" className="ring-white/40" />
          <div>
            <p className="text-sm text-white/80">{saudacao()},</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Prof. {primeiroNome(usuario.nome)} ✨</h1>
          </div>
        </div>
        <p className="relative mt-4 max-w-xl text-white/85">
          {aAvaliar.length
            ? `Você tem ${aAvaliar.length} explicações esperando um olhar seu. Cada feedback vira aprendizado! 💬`
            : "Tudo avaliado por aqui. Que tal lançar um desafio novo? 🚀"}
        </p>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Button asChild className="bg-white text-primary hover:bg-white/90">
            <Link to="/avaliar">
              <CheckCheckIcon /> Avaliar respostas
            </Link>
          </Button>
          <DialogNovaSala gatilho={<Button className="bg-white/15 text-white hover:bg-white/25">🏫 Nova sala</Button>} />
          <Button asChild className="bg-white/15 text-white hover:bg-white/25">
            <Link to="/topicos">
              <BookPlusIcon /> Tópicos e desafios
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { emoji: "🏫", valor: salas.length, rotulo: "Salas ativas" },
          { emoji: "🎒", valor: alunosUnicos.size, rotulo: "Alunos" },
          { emoji: "📥", valor: aAvaliar.length, rotulo: "Para avaliar" },
          { emoji: "🙋", valor: `${participacaoGeral}%`, rotulo: "Participação média" },
        ].map((s) => (
          <Card key={s.rotulo} size="sm">
            <CardContent>
              <span className="text-2xl">{s.emoji}</span>
              <p className="mt-1 font-heading text-3xl font-extrabold tabular-nums">{s.valor}</p>
              <p className="text-xs text-muted-foreground">{s.rotulo}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {aprovacoes.length > 0 && (
        <Card className="ring-2 ring-pink-400/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">🔥 Desafios criados por alunos</CardTitle>
            <CardDescription>Revise antes de liberar para a turma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {aprovacoes.map((d) => {
              const autor = dados.usuarios.find((u) => u.id === d.autorId)!
              const sala = dados.salas.find((s) => s.id === d.criadoPorAluno!.salaId)!
              return (
                <div key={d.id} className="flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center">
                  <AvatarEmoji usuario={autor} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{d.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {autor.nome} · {sala.emoji} {sala.nome}
                    </p>
                    <p className="mt-1 text-sm">{d.enunciado}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => decidirDesafioDeAluno(d.id, false)}>
                      Pedir ajustes
                    </Button>
                    <Button className="bg-brand text-white" onClick={() => decidirDesafioDeAluno(d.id, true)}>
                      ✅ Aprovar
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 *:min-w-0 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">🔍 O que a turma ainda não entendeu</CardTitle>
            <CardDescription>Desafios com a menor média de notas — bons candidatos para retomar em aula.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conceitos.length === 0 && <Vazio emoji="📊" titulo="Ainda sem avaliações" texto="Os insights aparecem depois das primeiras correções." />}
            {conceitos.map(({ sala, desafio, media, total, contagem }) => (
              <div key={sala.id + desafio.id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {ICONE_TIPO[desafio.tipo].emoji} {desafio.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sala.emoji} {sala.nome} · {total} avaliações
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                      media! < 2 ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" : "bg-muted text-foreground",
                    )}
                  >
                    {media! < 2 ? "⚠️ " : ""}média {media!.toFixed(1)}
                  </span>
                </div>
                {/* Distribuição das notas: 1 · 2 · 3 */}
                <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
                  {([1, 2, 3] as const).map((n) =>
                    contagem[n] ? (
                      <Tooltip key={n}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-full first:rounded-l-full last:rounded-r-full",
                              n === 1 && "bg-amber-400",
                              n === 2 && "bg-sky-400",
                              n === 3 && "bg-emerald-500",
                            )}
                            style={{ width: `${(contagem[n] / total) * 100}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          Nota {n}: {contagem[n]} aluno(s)
                        </TooltipContent>
                      </Tooltip>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            {conceitos.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-400" /> 1 · Pode ser melhor</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-sky-400" /> 2 · Boa</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500" /> 3 · Excelente</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">📥 Fila de avaliação</CardTitle>
            <CardDescription>Das mais antigas para as mais novas.</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/avaliar">
                  Tudo <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            {aAvaliar.length === 0 && <Vazio emoji="🎉" titulo="Fila zerada!" />}
            {aAvaliar.slice(0, 5).map((r) => {
              const aluno = dados.usuarios.find((u) => u.id === r.alunoId)!
              const desafio = dados.desafios.find((d) => d.id === r.desafioId)!
              return (
                <Link
                  key={r.id}
                  to={`/avaliar/${r.id}`}
                  className="flex items-center gap-3 rounded-2xl border p-2.5 transition hover:border-primary/40 hover:bg-secondary/40"
                >
                  <AvatarEmoji usuario={aluno} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{aluno.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.formato === "audio" ? "🎙️" : "✍️"} {desafio.titulo}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{tempoRelativo(r.enviadaEm)}</span>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold">🏫 Suas salas</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/salas">
              Gerenciar <ArrowRightIcon />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {salas.map((sala) => (
            <Link key={sala.id} to={`/salas/${sala.id}`} className="group">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-primary/10">
                <CardContent className="grid grid-cols-[1fr_7rem] gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-heading text-lg font-bold">
                        {sala.emoji} {sala.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sala.alunoIds.length} alunos · {desafiosDaSala(dados, sala).length} desafios
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Participação</span>
                        <span className="font-semibold tabular-nums">{participacao(sala.id)}%</span>
                      </div>
                      <BarraProgresso valor={participacao(sala.id)} />
                    </div>
                  </div>
                  <MosaicoTurma blocos={blocosDaSala(dados, sala)} className="[&>p]:hidden" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
