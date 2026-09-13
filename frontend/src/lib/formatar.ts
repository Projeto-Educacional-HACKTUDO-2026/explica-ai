const relativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

export function tempoRelativo(iso: string | Date) {
  const data = typeof iso === "string" ? new Date(iso) : iso
  const diffSeg = (data.getTime() - Date.now()) / 1000
  const abs = Math.abs(diffSeg)
  if (abs < 60) return "agora mesmo"
  if (abs < 3600) return relativo.format(Math.round(diffSeg / 60), "minute")
  if (abs < 86400) return relativo.format(Math.round(diffSeg / 3600), "hour")
  if (abs < 86400 * 30) return relativo.format(Math.round(diffSeg / 86400), "day")
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function dataCurta(iso: string | Date) {
  const data = typeof iso === "string" ? new Date(iso) : iso
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function dataHora(iso: string | Date) {
  const data = typeof iso === "string" ? new Date(iso) : iso
  return data.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

/** "faltam 3 dias", "último dia!", "encerrado" */
export function textoPrazo(prazo: Date) {
  const dias = Math.ceil((prazo.getTime() - Date.now()) / 86400000)
  if (dias < 0) return "prazo encerrado"
  if (dias === 0) return "último dia! ⏰"
  if (dias === 1) return "falta 1 dia"
  return `faltam ${dias} dias`
}

export function duracao(seg: number) {
  const s = Math.max(0, Math.round(seg))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function primeiroNome(nome: string) {
  return nome.split(" ")[0]
}

export function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

export function plural(n: number, singular: string, pluralForma = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForma}`
}
