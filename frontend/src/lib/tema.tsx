/* eslint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Tema = "light" | "dark" | "system"
const CHAVE = "explica-ai:tema"

interface ContextoTema {
  tema: Tema
  resolvido: "light" | "dark"
  setTema: (t: Tema) => void
}

const Contexto = createContext<ContextoTema | null>(null)
const consulta = () => window.matchMedia("(prefers-color-scheme: dark)")

function lerTema(): Tema {
  try {
    const t = localStorage.getItem(CHAVE)
    if (t === "light" || t === "dark") return t
  } catch {
    /* ignora */
  }
  return "system"
}

/** Tema claro/escuro com a classe `.dark` no <html> (o index.html aplica antes do React, sem piscar). */
export function ProvedorDeTema({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(lerTema)
  const [sistemaEscuro, setSistemaEscuro] = useState(() => consulta().matches)
  const resolvido = tema === "system" ? (sistemaEscuro ? "dark" : "light") : tema

  useEffect(() => {
    const mq = consulta()
    const ouvir = (e: MediaQueryListEvent) => setSistemaEscuro(e.matches)
    mq.addEventListener("change", ouvir)
    return () => mq.removeEventListener("change", ouvir)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvido === "dark")
    document.documentElement.style.colorScheme = resolvido
  }, [resolvido])

  const setTema = (t: Tema) => {
    setTemaState(t)
    try {
      if (t === "system") localStorage.removeItem(CHAVE)
      else localStorage.setItem(CHAVE, t)
    } catch {
      /* ignora */
    }
  }

  return <Contexto.Provider value={{ tema, resolvido, setTema }}>{children}</Contexto.Provider>
}

export function useTema() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error("useTema precisa estar dentro de <ProvedorDeTema>")
  return ctx
}
