import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { ProvedorDeTema } from "@/lib/tema"
import { useLoja } from "@/lib/store"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/AppShell"
import InicioAluno from "@/pages/aluno/InicioAluno"
import Avaliar from "@/pages/Avaliar"
import Corrigir from "@/pages/Corrigir"
import DesafioPagina from "@/pages/DesafioPagina"
import Entrar from "@/pages/Entrar"
import Notificacoes from "@/pages/Notificacoes"
import Perfil from "@/pages/Perfil"
import InicioProfessor from "@/pages/professor/InicioProfessor"
import TopicoDetalhe from "@/pages/professor/TopicoDetalhe"
import Topicos from "@/pages/professor/Topicos"
import SalaDetalhe from "@/pages/SalaDetalhe"
import Salas from "@/pages/Salas"

function Rotas() {
  const { usuario } = useLoja()

  if (!usuario) {
    return (
      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    )
  }

  const ehProfessor = usuario.papel === "professor"
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/inicio" element={ehProfessor ? <InicioProfessor /> : <InicioAluno />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/salas/:salaId" element={<SalaDetalhe />} />
        <Route path="/desafios/:salaId/:desafioId" element={<DesafioPagina />} />
        <Route path="/avaliar" element={<Avaliar />} />
        <Route path="/avaliar/:respostaId" element={<Corrigir />} />
        {ehProfessor && <Route path="/topicos" element={<Topicos />} />}
        {ehProfessor && <Route path="/topicos/:topicoId" element={<TopicoDetalhe />} />}
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ProvedorDeTema>
      <TooltipProvider delayDuration={150}>
        <BrowserRouter>
          <Rotas />
        </BrowserRouter>
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </ProvedorDeTema>
  )
}
