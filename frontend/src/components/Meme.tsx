import { cn } from "@/lib/utils"
import type { ConteudoMeme } from "@/lib/types"

/**
 * Memes educacionais renderizados só com emoji + CSS (sem imagens externas),
 * em três formatos clássicos da internet.
 */
export function Meme({ meme, className }: { meme: ConteudoMeme; className?: string }) {
  if (meme.template === "drake") return <MemeDrake meme={meme} className={className} />
  if (meme.template === "expectativa") return <MemeExpectativa meme={meme} className={className} />
  return <MemeClassico meme={meme} className={className} />
}

function MemeClassico({ meme, className }: { meme: ConteudoMeme; className?: string }) {
  return (
    <figure
      className={cn(
        "@container relative mx-auto flex aspect-square w-full max-w-md flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500 p-4 shadow-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_50%)]" />
      <figcaption className="meme-text relative text-center text-[clamp(0.8rem,7.5cqw,2rem)]">{meme.topo}</figcaption>
      <span className="relative text-[24cqw] leading-none drop-shadow-xl" aria-hidden>
        {meme.cena}
      </span>
      <p className="meme-text relative text-center text-[clamp(0.8rem,7.5cqw,2rem)]">{meme.base}</p>
    </figure>
  )
}

function MemeDrake({ meme, className }: { meme: ConteudoMeme; className?: string }) {
  return (
    <figure className={cn("@container mx-auto grid w-full max-w-md grid-cols-[2fr_3fr] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10", className)}>
      <div className="grid aspect-square place-items-center bg-gradient-to-br from-amber-300 to-orange-500 text-[18cqw] leading-none" aria-hidden>
        {meme.cena}
      </div>
      <div className="grid place-items-center p-3 text-center font-heading text-[clamp(0.7rem,4.4cqw,1.125rem)] font-bold text-neutral-900">{meme.topo}</div>
      <div className="grid aspect-square place-items-center bg-gradient-to-br from-lime-300 to-emerald-500 text-[18cqw] leading-none" aria-hidden>
        {meme.cenaB}
      </div>
      <div className="grid place-items-center border-t border-neutral-200 p-3 text-center font-heading text-[clamp(0.7rem,4.4cqw,1.125rem)] font-bold text-neutral-900">
        {meme.base}
      </div>
    </figure>
  )
}

function MemeExpectativa({ meme, className }: { meme: ConteudoMeme; className?: string }) {
  return (
    <figure className={cn("@container mx-auto grid w-full max-w-lg grid-cols-2 gap-1 overflow-hidden rounded-2xl bg-neutral-900 p-1 shadow-xl", className)}>
      {[
        { rotulo: "Expectativa", cena: meme.cena, legenda: meme.topo, cor: "from-violet-400 to-sky-400" },
        { rotulo: "Realidade", cena: meme.cenaB, legenda: meme.base, cor: "from-orange-500 to-red-600" },
      ].map((p) => (
        <div key={p.rotulo} className={cn("relative flex aspect-[3/4] flex-col items-center justify-between rounded-xl bg-gradient-to-b p-3", p.cor)}>
          <span className="meme-text text-[clamp(0.8rem,5cqw,1.5rem)]">{p.rotulo}</span>
          <span className="text-[13cqw] leading-none drop-shadow-lg" aria-hidden>
            {p.cena}
          </span>
          <span className="rounded-lg bg-black/55 px-2 py-1 text-center text-[clamp(0.6rem,2.8cqw,0.875rem)] font-semibold text-white">{p.legenda}</span>
        </div>
      ))}
    </figure>
  )
}
