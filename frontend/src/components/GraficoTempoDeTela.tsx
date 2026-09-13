import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

/** Barras dos últimos 7 dias (minutos no app). Hoje fica em destaque. */
export function GraficoTempoDeTela({ minutos, metaMin = 30 }: { minutos: number[]; metaMin?: number }) {
  const maximo = Math.max(metaMin, ...minutos)
  const hoje = new Date().getDay()
  const rotulos = minutos.map((_, i) => DIAS[(hoje - (minutos.length - 1 - i) + 7) % 7])

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-emerald-500/60"
        style={{ bottom: `calc(1.25rem + ${(metaMin / maximo) * 7}rem)` }}
      >
        <span className="absolute -top-4 right-0 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">meta saudável · {metaMin} min</span>
      </div>
      <div className="flex items-end gap-2">
        {minutos.map((m, i) => {
          const ehHoje = i === minutos.length - 1
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="flex flex-1 cursor-default flex-col items-center gap-1">
                  <div className="flex h-28 w-full items-end justify-center">
                    <div
                      className={cn("w-full max-w-7 rounded-t-[4px] transition-all", ehHoje ? "bg-primary" : "bg-primary/35 hover:bg-primary/55")}
                      style={{ height: `${Math.max(3, (m / maximo) * 100)}%` }}
                    />
                  </div>
                  <span className={cn("h-4 text-[11px] text-muted-foreground", ehHoje && "font-bold text-foreground")}>
                    {ehHoje ? "hoje" : rotulos[i]}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {ehHoje ? "Hoje" : rotulos[i]}: {m} min no app
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
