import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { GRADIENTES, ROTULO_NOTA } from "@/lib/regras"
import { ICONE_TIPO } from "@/lib/icones"
import type { Nota, StatusDesafio, TipoConteudo, Usuario } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export function Logo({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-heading font-extrabold tracking-tight", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-lg text-white shadow-lg shadow-primary/30 -rotate-6">
        💬
      </span>
      {!compacto && (
        <span className="text-xl">
          Explica <span className="text-gradient">Aí!</span>
        </span>
      )}
    </span>
  )
}

const TAMANHOS = {
  xs: "size-6 text-sm",
  sm: "size-8 text-base",
  md: "size-10 text-xl",
  lg: "size-14 text-3xl",
  xl: "size-24 text-5xl",
}

export function AvatarEmoji({
  usuario,
  tamanho = "md",
  className,
}: {
  usuario: Pick<Usuario, "avatar" | "cor" | "nome">
  tamanho?: keyof typeof TAMANHOS
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label={usuario.nome}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br ring-2 ring-background select-none",
        GRADIENTES[usuario.cor],
        TAMANHOS[tamanho],
        className,
      )}
    >
      <span className="drop-shadow-sm">{usuario.avatar}</span>
    </span>
  )
}

const STATUS: Record<StatusDesafio, { rotulo: string; className: string }> = {
  pendente: { rotulo: "✏️ Pendente", className: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" },
  respondido: { rotulo: "📨 Respondido", className: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300" },
  avaliado: { rotulo: "✅ Avaliado", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" },
  encerrado: { rotulo: "💤 Prazo encerrado", className: "bg-muted text-muted-foreground" },
}

export function StatusBadge({ status }: { status: StatusDesafio }) {
  return <Badge className={cn("border-0", STATUS[status].className)}>{STATUS[status].rotulo}</Badge>
}

export function NotaBadge({ nota, className }: { nota: Nota; className?: string }) {
  const estilos: Record<Nota, string> = {
    3: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
    2: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
    1: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  }
  return (
    <Badge className={cn("border-0", estilos[nota], className)}>
      {ROTULO_NOTA[nota].emoji} {nota} · {ROTULO_NOTA[nota].texto}
    </Badge>
  )
}

export function TipoBadge({ tipo }: { tipo: TipoConteudo }) {
  return (
    <Badge variant="outline" className="bg-background/60">
      {ICONE_TIPO[tipo].emoji} {ICONE_TIPO[tipo].rotulo}
    </Badge>
  )
}

export function XpPill({ xp, className }: { xp: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-xp px-2 py-0.5 text-xs font-bold text-xp-foreground tabular-nums",
        className,
      )}
    >
      ⚡ {xp} XP
    </span>
  )
}

export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
  emoji,
}: {
  titulo: ReactNode
  descricao?: ReactNode
  acao?: ReactNode
  emoji?: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {emoji && <span className="mr-2">{emoji}</span>}
          {titulo}
        </h1>
        {descricao && <p className="mt-1 text-muted-foreground">{descricao}</p>}
      </div>
      {acao && <div className="flex shrink-0 flex-wrap gap-2">{acao}</div>}
    </div>
  )
}

export function Vazio({ emoji, titulo, texto, children }: { emoji: string; titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="font-heading text-lg font-bold">{titulo}</p>
      {texto && <p className="max-w-sm text-sm text-muted-foreground">{texto}</p>}
      {children}
    </div>
  )
}

/** Barra de progresso colorida (o Progress do shadcn é fino e monocromático). */
export function BarraProgresso({
  valor,
  className,
  corClassName = "bg-brand",
}: {
  valor: number
  className?: string
  corClassName?: string
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(valor)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className={cn("h-full rounded-full transition-all duration-700", corClassName)} style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} />
    </div>
  )
}
