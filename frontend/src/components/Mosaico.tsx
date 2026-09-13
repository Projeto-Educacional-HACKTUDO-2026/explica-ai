import { cn } from "@/lib/utils"
import { TAMANHO_BLOCO } from "@/lib/regras"
import type { Usuario } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface BlocoMosaico {
  aluno: Usuario
  pecas: number // 0..16
}

/** Cor de cada peça: juntas, as peças formam um pôr do sol sobre o mar. */
function corDaPeca(u: number, v: number, semente: number) {
  const jitter = ((Math.sin(semente * 12.9898) * 43758.5453) % 1) * 6
  const dSol = Math.hypot(u - 0.68, (v - 0.42) * 1.2)
  const horizonteMontanha = 0.6 - 0.12 * Math.abs(Math.sin(u * 5.5)) - 0.05 * Math.sin(u * 13)
  if (v > 0.72) {
    const reflexo = Math.abs(u - 0.68) < 0.1 && Math.sin(v * 60) > 0
    return reflexo ? `hsl(${42 + jitter} 95% 68%)` : `hsl(${205 + jitter} 70% ${48 - (v - 0.72) * 50}%)`
  }
  if (v > horizonteMontanha) return `hsl(${275 + jitter} 45% ${26 + v * 10}%)`
  if (dSol < 0.16) return `hsl(${48 - dSol * 80 + jitter} 100% ${62 - dSol * 40}%)`
  const hue = 270 + v * 110 // violeta → rosa → laranja
  return `hsl(${(hue + jitter) % 360} 85% ${58 + v * 10}%)`
}

/** Ordem pseudo-aleatória (mas fixa por aluno) em que as peças são reveladas. */
function ordemDeRevelacao(seed: string) {
  let h = 7
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) >>> 0
  const idx = Array.from({ length: TAMANHO_BLOCO ** 2 }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0
    const j = h % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

function colunasPara(n: number) {
  return Math.max(1, Math.ceil(Math.sqrt(n)))
}

export function MosaicoTurma({
  blocos,
  destacarId,
  className,
}: {
  blocos: BlocoMosaico[]
  destacarId?: string
  className?: string
}) {
  const colunas = colunasPara(blocos.length)
  const linhas = Math.ceil(blocos.length / colunas)
  const total = blocos.reduce((a, b) => a + b.pecas, 0)
  const maximo = blocos.length * TAMANHO_BLOCO ** 2

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="grid gap-1 rounded-2xl bg-neutral-900 p-1.5 shadow-inner dark:bg-black/60"
        style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
      >
        {blocos.map((b, i) => (
          <Tooltip key={b.aluno.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-md transition",
                  destacarId === b.aluno.id && "ring-2 ring-xp ring-offset-2 ring-offset-neutral-900",
                )}
              >
                <Bloco
                  pecas={b.pecas}
                  seed={b.aluno.id}
                  coluna={i % colunas}
                  linha={Math.floor(i / colunas)}
                  colunas={colunas}
                  linhas={linhas}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {b.aluno.avatar} {b.aluno.nome.split(" ")[0]} · {b.pecas}/{TAMANHO_BLOCO ** 2} peças
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        🧩 {total} de {maximo} peças ({maximo ? Math.round((total / maximo) * 100) : 0}%) · a imagem se completa quando todo mundo chega ao XP máximo
      </p>
    </div>
  )
}

export function Bloco({
  pecas,
  seed,
  coluna = 0,
  linha = 0,
  colunas = 1,
  linhas = 1,
  grande = false,
}: {
  pecas: number
  seed: string
  coluna?: number
  linha?: number
  colunas?: number
  linhas?: number
  grande?: boolean
}) {
  const ordem = ordemDeRevelacao(seed)
  const reveladas = new Set(ordem.slice(0, pecas))
  const n = TAMANHO_BLOCO

  return (
    <div className={cn("grid grid-cols-4", grande ? "gap-1" : "gap-px")}>
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        const u = (coluna + (x + 0.5) / n) / colunas
        const v = (linha + (y + 0.5) / n) / linhas
        const on = reveladas.has(i)
        const cor = corDaPeca(u, v, i + coluna * 17 + linha * 31)
        return (
          <span
            key={i}
            className={cn(
              "aspect-square",
              grande ? "rounded-md" : "rounded-[2px]",
              on ? "animate-pop shadow-[inset_0_-2px_0_rgba(0,0,0,.15)]" : "opacity-30 saturate-[0.6]",
            )}
            // Peças ainda não conquistadas aparecem "apagadas", como uma prévia da imagem final.
            style={{ backgroundColor: cor, animationDelay: on ? `${i * 25}ms` : undefined }}
          />
        )
      })}
    </div>
  )
}

/** O pedaço do aluno, mostrado grande — com a posição certa dentro da imagem da turma. */
export function MosaicoAluno({ blocos, alunoId }: { blocos: BlocoMosaico[]; alunoId: string }) {
  const i = blocos.findIndex((b) => b.aluno.id === alunoId)
  if (i < 0) return null
  const colunas = colunasPara(blocos.length)
  const linhas = Math.ceil(blocos.length / colunas)
  return (
    <div className="rounded-2xl bg-neutral-900 p-2 dark:bg-black/60">
      <Bloco
        grande
        pecas={blocos[i].pecas}
        seed={alunoId}
        coluna={i % colunas}
        linha={Math.floor(i / colunas)}
        colunas={colunas}
        linhas={linhas}
      />
    </div>
  )
}
