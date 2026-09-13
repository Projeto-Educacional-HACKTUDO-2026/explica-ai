import { useLoja } from "@/lib/store"
import { tempoRelativo } from "@/lib/formatar"
import type { Resposta } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { AvatarEmoji, NotaBadge, XpPill } from "./comum"
import { PlayerAudio } from "./PlayerAudio"

/** Uma tentativa de resposta: conteúdo enviado + avaliação (e quem avaliou). */
export function TentativaCard({
  resposta,
  total,
  rotulo,
  mostrarAvaliacao = true,
}: {
  resposta: Resposta
  total?: number
  rotulo?: string
  /** Na tela de correção a avaliação fica no painel ao lado. */
  mostrarAvaliacao?: boolean
}) {
  const { dados } = useLoja()
  const avaliador = resposta.avaliacao && dados.usuarios.find((u) => u.id === resposta.avaliacao!.avaliadorId)
  const sala = dados.salas.find((s) => s.id === resposta.salaId)!
  const papel =
    avaliador && (avaliador.papel === "professor" ? "professor(a)" : sala.monitorIds.includes(avaliador.id) ? "monitor(a)" : "autor(a) do desafio")

  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {rotulo ?? `Tentativa ${resposta.tentativa}${total ? ` de ${total}` : ""}`}
          </span>
          <span>
            {resposta.formato === "audio" ? "🎙️" : "✍️"} enviada {tempoRelativo(resposta.enviadaEm)}
            {resposta.reinicios > 0 && ` · 🔄 ${resposta.reinicios} reinício(s)`}
            {resposta.usouIA && " · 🤖 IA declarada"}
          </span>
        </div>
        {resposta.formato === "texto" ? (
          <p className="rounded-2xl bg-muted/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">{resposta.texto}</p>
        ) : (
          <PlayerAudio src={resposta.audioUrl} transcricao={resposta.transcricao} duracaoSeg={resposta.duracaoSeg ?? 30} />
        )}
        {!mostrarAvaliacao ? null : resposta.avaliacao ? (
          <div className="space-y-2 rounded-2xl border-2 border-dashed p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <NotaBadge nota={resposta.avaliacao.nota} />
              <XpPill xp={resposta.avaliacao.xpGanho} />
            </div>
            {resposta.avaliacao.justificativa && <p className="text-sm">“{resposta.avaliacao.justificativa}”</p>}
            {avaliador && (
              <p className="text-xs text-muted-foreground">
                <AvatarEmoji usuario={avaliador} tamanho="xs" className="mr-1 align-middle" /> Avaliado por <strong className="text-foreground">{avaliador.nome}</strong> ({papel}) ·{" "}
                {tempoRelativo(resposta.avaliacao.avaliadaEm)}
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-xl bg-sky-50 p-2.5 text-center text-sm text-sky-900 dark:bg-sky-400/10 dark:text-sky-200">
            📨 Aguardando avaliação. Você recebe um aviso quando sair!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
