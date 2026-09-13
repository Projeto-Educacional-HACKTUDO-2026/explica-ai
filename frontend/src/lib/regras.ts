import type {
  CorTema,
  Dados,
  Desafio,
  Nota,
  Resposta,
  Sala,
  StatusDesafio,
  Usuario,
} from "./types"

/* ───────────────────────── XP ───────────────────────── */

export const PERCENTUAL_NOTA: Record<Nota, number> = { 3: 100, 2: 75, 1: 20 }

export const ROTULO_NOTA: Record<Nota, { emoji: string; texto: string }> = {
  3: { emoji: "🤩", texto: "Excelente resposta" },
  2: { emoji: "👍", texto: "Boa resposta" },
  1: { emoji: "🌱", texto: "Pode ser melhor" },
}

/** Penalidade (em pontos percentuais) quando o aluno declara uso de IA generativa. */
export const PENALIDADE_IA = 50

export function percentualXp(nota: Nota, usouIA: boolean) {
  return Math.max(0, PERCENTUAL_NOTA[nota] - (usouIA ? PENALIDADE_IA : 0))
}

export function calcularXp(base: number, nota: Nota, usouIA: boolean) {
  return Math.round((base * percentualXp(nota, usouIA)) / 100)
}

export function xpDoDesafio(dados: Dados, desafio: Desafio, sala?: Sala) {
  const override = sala?.configs[desafio.id]?.xp
  if (override !== undefined) return override
  if (desafio.xp !== undefined) return desafio.xp
  return dados.topicos.find((t) => t.id === desafio.topicoId)?.xpPadrao ?? 50
}

export function maxTentativas(desafio: Desafio, sala?: Sala) {
  return sala?.configs[desafio.id]?.maxTentativas ?? desafio.maxTentativas
}

/* ───────────────────── Níveis / títulos ───────────────────── */

export const TITULOS = [
  { xp: 0, emoji: "🐣", nome: "Curioso(a)" },
  { xp: 100, emoji: "🧭", nome: "Explorador(a)" },
  { xp: 250, emoji: "💬", nome: "Explicador(a)" },
  { xp: 500, emoji: "🧪", nome: "Cientista de Bolso" },
  { xp: 900, emoji: "🧠", nome: "Mestre Feynman" },
]

export function tituloAtual(xp: number) {
  let atual = TITULOS[0]
  for (const t of TITULOS) if (xp >= t.xp) atual = t
  const proximo = TITULOS.find((t) => t.xp > xp)
  const progresso = proximo ? ((xp - atual.xp) / (proximo.xp - atual.xp)) * 100 : 100
  return { atual, proximo, progresso }
}

/* ───────────────────── Desafios de uma sala ───────────────────── */

export function desafiosDaSala(dados: Dados, sala: Sala) {
  return dados.desafios.filter((d) => {
    if (d.criadoPorAluno) {
      return d.criadoPorAluno.salaId === sala.id && d.criadoPorAluno.status === "aprovado"
    }
    return sala.topicoIds.includes(d.topicoId) && sala.configs[d.id]
  })
}

export function prazoDoDesafio(desafio: Desafio, sala: Sala) {
  const inicio = sala.configs[desafio.id]?.adicionadoEm ?? desafio.criadoEm
  const d = new Date(inicio)
  d.setDate(d.getDate() + desafio.prazoDias)
  return d
}

export function respostasDoAluno(dados: Dados, alunoId: string, desafioId: string, salaId: string) {
  return dados.respostas
    .filter((r) => r.alunoId === alunoId && r.desafioId === desafioId && r.salaId === salaId)
    .sort((a, b) => a.tentativa - b.tentativa)
}

export function statusDoDesafio(
  dados: Dados,
  alunoId: string,
  desafio: Desafio,
  sala: Sala,
): StatusDesafio {
  const respostas = respostasDoAluno(dados, alunoId, desafio.id, sala.id)
  const ultima = respostas.at(-1)
  if (ultima) return ultima.avaliacao ? "avaliado" : "respondido"
  if (prazoDoDesafio(desafio, sala).getTime() < Date.now()) return "encerrado"
  return "pendente"
}

export function podeRefazer(dados: Dados, alunoId: string, desafio: Desafio, sala: Sala) {
  const respostas = respostasDoAluno(dados, alunoId, desafio.id, sala.id)
  const ultima = respostas.at(-1)
  if (!ultima?.avaliacao) return false
  return respostas.length < maxTentativas(desafio, sala)
}

/** XP de um aluno numa sala: vale a melhor tentativa de cada desafio (nunca diminui). */
export function xpNaSala(dados: Dados, alunoId: string, sala: Sala) {
  const melhores = new Map<string, number>()
  for (const r of dados.respostas) {
    if (r.alunoId !== alunoId || r.salaId !== sala.id || !r.avaliacao) continue
    melhores.set(r.desafioId, Math.max(melhores.get(r.desafioId) ?? 0, r.avaliacao.xpGanho))
  }
  return [...melhores.values()].reduce((a, b) => a + b, 0)
}

export function xpMaximoDaSala(dados: Dados, sala: Sala) {
  return desafiosDaSala(dados, sala).reduce((acc, d) => acc + xpDoDesafio(dados, d, sala), 0)
}

export function xpTotal(dados: Dados, alunoId: string) {
  return dados.salas
    .filter((s) => s.alunoIds.includes(alunoId))
    .reduce((acc, s) => acc + xpNaSala(dados, alunoId, s), 0)
}

export function emblemasConquistados(dados: Dados, alunoId: string, sala: Sala) {
  const xp = xpNaSala(dados, alunoId, sala)
  return sala.emblemas.filter(
    (e) => e.concedidoA.includes(alunoId) || (e.xpMinimo !== undefined && xp >= e.xpMinimo),
  )
}

export function estatisticasDoAluno(dados: Dados, alunoId: string) {
  const respostas = dados.respostas.filter((r) => r.alunoId === alunoId)
  const avaliadas = respostas.filter((r) => r.avaliacao)
  return {
    enviadas: respostas.length,
    excelentes: avaliadas.filter((r) => r.avaliacao!.nota === 3).length,
    boas: avaliadas.filter((r) => r.avaliacao!.nota === 2).length,
    aMelhorar: avaliadas.filter((r) => r.avaliacao!.nota === 1).length,
    aguardando: respostas.length - avaliadas.length,
  }
}

/* ───────────────────── Permissões ───────────────────── */

export function podeAvaliar(usuario: Usuario, sala: Sala, desafio?: Desafio) {
  if (sala.professorId === usuario.id) return true
  if (sala.monitorIds.includes(usuario.id)) return true
  return !!desafio?.criadoPorAluno && desafio.autorId === usuario.id
}

export function respostasParaAvaliar(dados: Dados, usuario: Usuario) {
  return dados.respostas
    .filter((r) => {
      if (r.avaliacao || r.alunoId === usuario.id) return false
      const sala = dados.salas.find((s) => s.id === r.salaId)
      const desafio = dados.desafios.find((d) => d.id === r.desafioId)
      return !!sala && podeAvaliar(usuario, sala, desafio)
    })
    .sort((a, b) => a.enviadaEm.localeCompare(b.enviadaEm))
}

/* ───────────────── Notificações: horário de descanso ───────────────── */

export const INICIO_SILENCIO = 22
export const FIM_SILENCIO = 7

export function emHorarioDeDescanso(data: Date) {
  const h = data.getHours()
  return h >= INICIO_SILENCIO || h < FIM_SILENCIO
}

/** Nenhuma notificação é entregue entre 22h e 7h: empurra para as 7h seguintes. */
export function horarioDeEntrega(data: Date) {
  if (!emHorarioDeDescanso(data)) return data
  const entrega = new Date(data)
  if (data.getHours() >= INICIO_SILENCIO) entrega.setDate(entrega.getDate() + 1)
  entrega.setHours(FIM_SILENCIO, 0, 0, 0)
  return entrega
}

/* ───────────────────── Mosaico ───────────────────── */

export const TAMANHO_BLOCO = 4 // cada aluno é um bloco 4×4

/** Quantas peças (0–16) do mosaico o aluno já revelou. */
export function pecasReveladas(xp: number, xpMaximo: number) {
  if (xpMaximo <= 0) return 0
  return Math.min(TAMANHO_BLOCO ** 2, Math.floor((xp / xpMaximo) * TAMANHO_BLOCO ** 2))
}

export function blocosDaSala(dados: Dados, sala: Sala) {
  const maximo = xpMaximoDaSala(dados, sala)
  return sala.alunoIds
    .map((id) => dados.usuarios.find((u) => u.id === id))
    .filter((u): u is Usuario => !!u)
    .map((aluno) => ({ aluno, pecas: pecasReveladas(xpNaSala(dados, aluno.id, sala), maximo) }))
}

/* ───────────────────── Aparência ───────────────────── */

export const GRADIENTES: Record<CorTema, string> = {
  violeta: "from-violet-500 to-fuchsia-500",
  rosa: "from-pink-500 to-orange-400",
  limao: "from-lime-400 to-emerald-500",
  ceu: "from-sky-400 to-indigo-500",
  laranja: "from-amber-400 to-rose-500",
  menta: "from-teal-400 to-cyan-500",
}

export function mediaDeNotas(respostas: Resposta[]) {
  const notas = respostas.filter((r) => r.avaliacao).map((r) => r.avaliacao!.nota)
  if (!notas.length) return null
  return notas.reduce((a, b) => a + b, 0) / notas.length
}
