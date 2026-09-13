import { useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router"
import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import {
  calcularXp,
  percentualXp,
  podeAvaliar,
  respostasDoAluno,
  respostasParaAvaliar,
  ROTULO_NOTA,
  xpDoDesafio,
} from "@/lib/regras"
import type { Nota } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AvatarEmoji, TipoBadge, XpPill } from "@/components/comum"
import { ConteudoDoDesafio } from "@/components/ConteudoDoDesafio"
import { TentativaCard } from "@/components/TentativaCard"

const SUGESTOES: Record<Nota, string[]> = {
  3: ["Explicação clara e com exemplo! 👏", "Deu pra entender de primeira 🤩", "Amei a analogia!"],
  2: ["Tá no caminho certo! Faltou um detalhe:", "Boa! Tenta incluir um exemplo do dia a dia.", "Quase lá 💪"],
  1: ["Bom começo! Tenta explicar o porquê.", "Revisa este ponto e tenta de novo 🌱", "Que tal usar uma comparação?"],
}

/** Remonta a tela a cada resposta, para o formulário começar limpo. */
export default function CorrigirRota() {
  const { respostaId } = useParams()
  return <Corrigir key={respostaId} />
}

function Corrigir() {
  const { respostaId } = useParams()
  const { dados, avaliarResposta } = useLoja()
  const usuario = useUsuario()
  const navigate = useNavigate()
  const resposta = dados.respostas.find((r) => r.id === respostaId)
  const [nota, setNota] = useState<Nota | null>(resposta?.avaliacao?.nota ?? null)
  const [justificativa, setJustificativa] = useState(resposta?.avaliacao?.justificativa ?? "")
  const [verDesafio, setVerDesafio] = useState(false)

  if (!resposta) return <Navigate to="/avaliar" replace />
  const sala = dados.salas.find((s) => s.id === resposta.salaId)!
  const desafio = dados.desafios.find((d) => d.id === resposta.desafioId)!
  if (!podeAvaliar(usuario, sala, desafio) || resposta.alunoId === usuario.id) return <Navigate to="/avaliar" replace />

  const aluno = dados.usuarios.find((u) => u.id === resposta.alunoId)!
  const base = xpDoDesafio(dados, desafio, sala)
  const anteriores = respostasDoAluno(dados, aluno.id, desafio.id, sala.id).filter((r) => r.tentativa < resposta.tentativa)

  const salvar = () => {
    if (!nota) return toast.error("Escolha uma nota")
    avaliarResposta(resposta.id, nota, justificativa.trim())
    toast.success(`Avaliação enviada! ${aluno.nome.split(" ")[0]} ganhou ${calcularXp(base, nota, resposta.usouIA)} XP ⚡`)
    const proxima = respostasParaAvaliar(dados, usuario).find((r) => r.id !== resposta.id)
    navigate(proxima ? `/avaliar/${proxima.id}` : "/avaliar")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/avaliar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Fila de avaliação
      </Link>

      <header className="flex flex-wrap items-center gap-4">
        <AvatarEmoji usuario={aluno} tamanho="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">{aluno.nome}</h1>
          <p className="text-sm text-muted-foreground">
            {sala.emoji} {sala.nome} · tentativa {resposta.tentativa}
          </p>
        </div>
        <XpPill xp={base} className="text-sm" />
      </header>

      <div className="grid grid-cols-1 items-start gap-6 *:min-w-0 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <Card size="sm">
            <button onClick={() => setVerDesafio((v) => !v)} className="flex w-full items-center gap-3 px-3 text-left">
              <TipoBadge tipo={desafio.tipo} />
              <span className="min-w-0 flex-1 truncate font-semibold">{desafio.titulo}</span>
              <ChevronDownIcon className={cn("size-4 transition", verDesafio && "rotate-180")} />
            </button>
            {verDesafio && (
              <CardContent className="space-y-3 pt-2">
                <ConteudoDoDesafio desafio={desafio} />
              </CardContent>
            )}
            <CardContent>
              <p className="rounded-xl bg-xp/25 p-3 text-sm font-medium">🎯 {desafio.enunciado}</p>
            </CardContent>
          </Card>

          <TentativaCard resposta={resposta} mostrarAvaliacao={false} rotulo={`Resposta · tentativa ${resposta.tentativa}`} />

          {anteriores.length > 0 && (
            <details className="group rounded-2xl border bg-card p-3">
              <summary className="cursor-pointer text-sm font-semibold">🕘 Tentativas anteriores ({anteriores.length})</summary>
              <div className="mt-3 space-y-3">
                {anteriores.map((r) => (
                  <TentativaCard key={r.id} resposta={r} />
                ))}
              </div>
            </details>
          )}
        </div>

        <Card className="rounded-3xl shadow-lg shadow-primary/5 lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{resposta.avaliacao ? "✏️ Editar avaliação" : "⭐ Sua avaliação"}</CardTitle>
            <CardDescription>
              {resposta.usouIA ? "🤖 O aluno declarou uso de IA: o XP ganho será reduzido em 50 pontos percentuais." : "O aluno não usou IA nesta resposta."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              {([3, 2, 1] as Nota[]).map((n) => (
                <button
                  key={n}
                  onClick={() => setNota(n)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition",
                    nota === n ? "border-primary bg-secondary shadow-md" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="text-3xl">{ROTULO_NOTA[n].emoji}</span>
                  <span className="flex-1">
                    <span className="block font-semibold">
                      {n} · {ROTULO_NOTA[n].texto}
                    </span>
                    <span className="text-xs text-muted-foreground">{percentualXp(n, resposta.usouIA)}% do XP</span>
                  </span>
                  <XpPill xp={calcularXp(base, n, resposta.usouIA)} />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa (o aluno vê)</Label>
              {nota && (
                <div className="flex flex-wrap gap-1.5">
                  {SUGESTOES[nota].map((s) => (
                    <button
                      key={s}
                      onClick={() => setJustificativa((j) => (j ? `${j} ${s}` : s))}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs transition hover:bg-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <Textarea
                id="justificativa"
                rows={4}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="O que ficou bom? O que dá pra melhorar?"
              />
            </div>

            <Button size="lg" className="h-11 w-full bg-brand text-base text-white" onClick={salvar} disabled={!nota}>
              Enviar avaliação ✨
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Sua avaliação aparece para o aluno com seu nome: “Avaliado por {usuario.nome}”.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
