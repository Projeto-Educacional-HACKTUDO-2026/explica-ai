import { useRef } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  valor: string
  onChange: (v: string) => void
  limite: number
  placeholder?: string
}

/**
 * Campo de resposta "só para frente": não dá para apagar, selecionar e sobrescrever
 * ou colar texto. Para corrigir, o aluno reinicia a resposta inteira.
 */
export function TextoSemApagar({ valor, onChange, limite, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const avisouRef = useRef(0)

  const avisar = (msg: string) => {
    const agora = Date.now()
    if (agora - avisouRef.current < 2500) return
    avisouRef.current = agora
    toast(msg)
  }

  const cursorNoFim = () => {
    const el = ref.current
    if (el && (el.selectionStart !== el.value.length || el.selectionEnd !== el.value.length)) {
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }

  const restante = limite - valor.length
  const pct = (valor.length / limite) * 100

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={ref}
          value={valor}
          placeholder={placeholder}
          rows={7}
          spellCheck
          className="min-h-44 resize-none rounded-2xl bg-background p-4 pb-8 text-base leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === "Backspace" || e.key === "Delete") {
              e.preventDefault()
              avisar("✋ Aqui não dá pra apagar! Se quiser mudar, reinicie a resposta.")
            }
            if (e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End" || e.key === "PageUp") {
              e.preventDefault()
            }
          }}
          onBeforeInput={(e) => {
            const tipo = (e.nativeEvent as InputEvent).inputType ?? ""
            if (tipo.startsWith("delete") || tipo === "historyUndo") e.preventDefault()
          }}
          onPaste={(e) => {
            e.preventDefault()
            avisar("✍️ Nada de colar: o legal é explicar com as suas palavras!")
          }}
          onCut={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onSelect={cursorNoFim}
          onClick={cursorNoFim}
          onChange={(e) => {
            const novo = e.target.value
            // Só aceita texto que acrescenta ao final do que já existe.
            if (!novo.startsWith(valor)) return
            if (novo.length > limite) {
              onChange(novo.slice(0, limite))
              avisar("📏 Limite de caracteres atingido.")
              return
            }
            onChange(novo)
          }}
        />
        <span
          className={cn(
            "pointer-events-none absolute right-3 bottom-2 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
            restante <= 20 ? "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300" : "bg-muted text-muted-foreground",
          )}
        >
          {valor.length}/{limite}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", pct > 90 ? "bg-pink-500" : "bg-brand")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
