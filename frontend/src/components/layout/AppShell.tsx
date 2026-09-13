import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { useTema } from "@/lib/tema"
import {
  BellIcon,
  BookOpenIcon,
  CheckCheckIcon,
  HouseIcon,
  LogOutIcon,
  MoonIcon,
  RefreshCwIcon,
  SchoolIcon,
  SunIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { respostasParaAvaliar } from "@/lib/regras"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AvatarEmoji, Logo } from "@/components/comum"

const LEMBRETE_PAUSA_MIN = 20

function useMinutosDeSessao() {
  const [minutos, setMinutos] = useState(0)
  useEffect(() => {
    const inicio = Date.now()
    const id = window.setInterval(() => {
      const m = Math.floor((Date.now() - inicio) / 60000)
      setMinutos(m)
      if (m === LEMBRETE_PAUSA_MIN) {
        toast("🌿 Que tal uma pausa?", {
          description: `Você está há ${LEMBRETE_PAUSA_MIN} minutos no app. Beba água, olhe pela janela e volte quando quiser.`,
          duration: 10000,
        })
      }
    }, 30000)
    return () => window.clearInterval(id)
  }, [])
  return minutos
}

export function AppShell() {
  const { dados, sair, restaurarExemplos } = useLoja()
  const usuario = useUsuario()
  const navigate = useNavigate()
  const { resolvido, setTema } = useTema()
  const minutos = useMinutosDeSessao()

  const agora = Date.now()
  const naoLidas = dados.notificacoes.filter(
    (n) => n.usuarioId === usuario.id && !n.lida && new Date(n.entregarEm).getTime() <= agora,
  ).length
  const paraAvaliar = respostasParaAvaliar(dados, usuario).length
  const ehProfessor = usuario.papel === "professor"
  const avaliaAlgo = ehProfessor || paraAvaliar > 0 || dados.salas.some((s) => s.monitorIds.includes(usuario.id))

  const itens = [
    { to: "/inicio", rotulo: "Início", icone: HouseIcon, mostrar: true },
    { to: "/salas", rotulo: "Salas", icone: SchoolIcon, mostrar: true },
    { to: "/topicos", rotulo: "Tópicos", icone: BookOpenIcon, mostrar: ehProfessor },
    { to: "/avaliar", rotulo: "Avaliar", icone: CheckCheckIcon, mostrar: avaliaAlgo, contador: paraAvaliar },
    { to: "/notificacoes", rotulo: "Avisos", icone: BellIcon, mostrar: true, contador: naoLidas },
    { to: "/perfil", rotulo: "Perfil", icone: UserIcon, mostrar: true },
  ].filter((i) => i.mostrar)

  // No celular a barra inferior tem no máximo 5 itens; avisos ficam no sino do topo.
  const itensMobile = itens.length > 5 ? itens.filter((i) => i.to !== "/notificacoes") : itens

  const menuUsuario = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Menu da conta">
          <AvatarEmoji usuario={usuario} tamanho="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="font-semibold text-foreground">{usuario.nome}</p>
          <p className="text-xs text-muted-foreground">{ehProfessor ? "👩‍🏫 Professor(a)" : "🎒 Aluno(a)"} · {usuario.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/perfil")}>
          <UserIcon /> Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTema(resolvido === "dark" ? "light" : "dark")}>
          {resolvido === "dark" ? <SunIcon /> : <MoonIcon />} Tema {resolvido === "dark" ? "claro" : "escuro"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => sair()}>
          <UsersIcon /> Trocar de usuário
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            restaurarExemplos()
            toast.success("Dados de exemplo restaurados ✨")
          }}
        >
          <RefreshCwIcon /> Restaurar dados de exemplo
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => sair()}>
          <LogOutIcon /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="min-h-dvh bg-mesh">
      {/* Barra lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar/80 px-4 py-5 backdrop-blur-xl lg:flex">
        <Logo className="px-2" />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {itens.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive && "bg-brand text-white shadow-md shadow-primary/25 hover:bg-brand hover:text-white",
                )
              }
            >
              <item.icone className="size-4.5" />
              <span className="flex-1">{item.rotulo}</span>
              {!!item.contador && (
                <span className="grid min-w-5 place-items-center rounded-full bg-pink-500 px-1.5 text-[11px] font-bold text-white">
                  {item.contador}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-2xl bg-gradient-to-br from-lime-200 to-emerald-200 p-4 text-emerald-950 dark:from-lime-300/15 dark:to-emerald-400/15 dark:text-emerald-100">
          <p className="font-heading font-bold">🌿 Uso consciente</p>
          <p className="mt-1 text-xs opacity-80">
            {minutos < 1 ? "Sessão começando agora." : `Sessão de ${minutos} min.`} Sugerimos pausas a cada {LEMBRETE_PAUSA_MIN} min.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl px-2 py-2">
          {menuUsuario}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{usuario.nome}</p>
            <p className="truncate text-xs text-muted-foreground">{ehProfessor ? "Professor(a)" : "Aluno(a)"}</p>
          </div>
        </div>
      </aside>

      {/* Topo (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/75 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notificacoes")} aria-label="Notificações">
            <BellIcon className="size-5" />
            {naoLidas > 0 && <span className="absolute top-1 right-1 size-2.5 rounded-full bg-pink-500 ring-2 ring-background" />}
          </Button>
          {menuUsuario}
        </div>
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Navegação inferior (celular) */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 px-2 pt-1.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md justify-around">
          {itensMobile.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition",
                  isActive && "text-primary",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", isActive && "bg-secondary")}>
                    <item.icone className="size-5" />
                  </span>
                  {item.rotulo}
                  {!!item.contador && (
                    <span className="absolute top-0.5 right-2 grid min-w-4 place-items-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                      {item.contador}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
