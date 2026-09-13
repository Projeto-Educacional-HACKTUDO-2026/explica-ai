import { useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja } from "@/lib/store"
import { GRADIENTES, tituloAtual, xpTotal } from "@/lib/regras"
import type { CorTema, Papel } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarEmoji, Logo } from "@/components/comum"
import { Meme } from "@/components/Meme"

const AVATARES = ["🦊", "🐼", "🐸", "🦄", "🐙", "🐝", "🐯", "🐧", "🦖", "🐨", "👩‍🏫", "👨‍🏫", "👩‍🔬", "🧑‍🎨"]
const CORES: CorTema[] = ["violeta", "rosa", "limao", "ceu", "laranja", "menta"]

export default function Entrar() {
  const { dados, entrar, cadastrar } = useLoja()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [verSenha, setVerSenha] = useState(false)

  const [papel, setPapel] = useState<Papel>("aluno")
  const [nome, setNome] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [escola, setEscola] = useState("")
  const [avatar, setAvatar] = useState("🦊")
  const [cor, setCor] = useState<CorTema>("violeta")

  const professores = dados.usuarios.filter((u) => u.papel === "professor")
  const alunos = dados.usuarios.filter((u) => u.papel === "aluno")

  const irPara = (id: string) => {
    entrar(id)
    navigate("/inicio")
  }

  const fazerLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const u = dados.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u || senha.length < 4) {
      toast.error("E-mail ou senha inválidos", { description: "Dica: use um e-mail de exemplo e qualquer senha com 4+ caracteres." })
      return
    }
    toast.success(`Bem-vindo(a) de volta, ${u.nome.split(" ")[0]}! ${u.avatar}`)
    irPara(u.id)
  }

  const criarConta = (e: React.FormEvent) => {
    e.preventDefault()
    if (nome.trim().length < 3) return toast.error("Conta pra gente seu nome 🙂")
    if (!/^\S+@\S+\.\S+$/.test(novoEmail)) return toast.error("Esse e-mail não parece válido")
    if (dados.usuarios.some((u) => u.email.toLowerCase() === novoEmail.toLowerCase())) return toast.error("Já existe uma conta com esse e-mail")
    if (novaSenha.length < 8 || !/\d/.test(novaSenha)) return toast.error("A senha precisa de 8+ caracteres e pelo menos um número 🔒")
    cadastrar({ nome: nome.trim(), email: novoEmail.trim(), papel, avatar, cor, escola: escola.trim() || "Minha escola" })
    toast.success("Conta criada! 🎉", { description: papel === "professor" ? "Crie sua primeira sala." : "Peça o código da sala ao seu professor." })
    navigate("/inicio")
  }

  return (
    <div className="min-h-dvh bg-mesh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <span className="hidden rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border sm:inline">
          🧪 Protótipo com dados de exemplo
        </span>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-8">
        {/* Apresentação */}
        <section className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-xp px-3 py-1 text-xs font-bold text-xp-foreground">
            🧠 Técnica de Feynman no bolso
          </span>
          <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
            Quem explica, <span className="text-gradient">aprende duas vezes.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            O <strong className="text-foreground">Explica Aí!</strong> transforma o celular de distração em ferramenta de aprendizagem ativa: você explica
            memes, textos e áudios com as suas palavras, recebe feedback e refaz até dominar. 💬
          </p>

          <div className="flex flex-wrap gap-2">
            {["🌿 Uso consciente", "🙅 Sem ranking tóxico", "🧩 Mosaico da turma", "🔕 Sem notificação 22h–7h", "🎧 Áudio até 2x"].map((t) => (
              <span key={t} className="rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium ring-1 ring-border">
                {t}
              </span>
            ))}
          </div>

          <div className="relative hidden gap-4 sm:grid sm:grid-cols-[1fr_1.1fr] lg:mt-4">
            <div className="animate-float">
              <Meme
                className="max-w-64 rotate-[-4deg]"
                meme={{ template: "classico", cena: "🌿☀️😎", topo: "Planta fazendo fotossíntese", base: "Eu achando que a energia é minha" }}
              />
            </div>
            <div className="space-y-3 self-center">
              {[
                { n: "1", t: "O professor lança um desafio", d: "Meme, texto, imagem, vídeo ou áudio." },
                { n: "2", t: "Você explica do seu jeito", d: "Texto corrido sem apagar ou áudio com tempo." },
                { n: "3", t: "Recebe feedback e evolui", d: "Ganha XP, emblemas e revela seu mosaico." },
              ].map((p) => (
                <div key={p.n} className="flex gap-3 rounded-2xl bg-background/80 p-3 shadow-sm ring-1 ring-border backdrop-blur">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand font-heading font-bold text-white">{p.n}</span>
                  <div>
                    <p className="font-semibold">{p.t}</p>
                    <p className="text-sm text-muted-foreground">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Acesso */}
        <Card className="rounded-3xl bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardContent>
            <Tabs defaultValue="exemplos">
              <TabsList className="grid h-10! w-full grid-cols-3">
                <TabsTrigger value="exemplos">✨ Exemplos</TabsTrigger>
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="exemplos" className="mt-4 space-y-5">
                <p className="text-sm text-muted-foreground">Escolha alguém para explorar o app sem precisar de senha:</p>
                <GrupoUsuarios
                  titulo="👩‍🏫 Professores"
                  usuarios={professores.map((u) => ({
                    ...u,
                    detalhe: `${dados.salas.filter((s) => s.professorId === u.id).length} salas · ${u.escola}`,
                  }))}
                  onEscolher={irPara}
                />
                <GrupoUsuarios
                  titulo="🎒 Alunos"
                  usuarios={alunos.map((u) => {
                    const xp = xpTotal(dados, u.id)
                    const monitor = dados.salas.some((s) => s.monitorIds.includes(u.id))
                    return { ...u, detalhe: `${tituloAtual(xp).atual.emoji} ${xp} XP${monitor ? " · 🛡️ monitor(a)" : ""}` }
                  })}
                  onEscolher={irPara}
                />
              </TabsContent>

              <TabsContent value="entrar" className="mt-4">
                <form onSubmit={fazerLogin} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle className="text-xl font-bold">Que bom te ver de novo 👋</CardTitle>
                    <CardDescription>Use um e-mail de exemplo, como lucas@explicaai.app, e qualquer senha.</CardDescription>
                  </CardHeader>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@escola.com" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={verSenha ? "text" : "password"}
                        autoComplete="current-password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setVerSenha((v) => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                        aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {verSenha ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="h-11 w-full bg-brand text-base text-white">
                    Entrar <ArrowRightIcon />
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <LockIcon className="size-3" /> Em produção: autenticação segura com senha criptografada e sessão expirável.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="criar" className="mt-4">
                <form onSubmit={criarConta} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { v: "aluno", emoji: "🎒", t: "Sou aluno(a)", d: "Explico e ganho XP" },
                        { v: "professor", emoji: "👩‍🏫", t: "Sou professor(a)", d: "Crio salas e desafios" },
                      ] as const
                    ).map((o) => (
                      <button
                        type="button"
                        key={o.v}
                        onClick={() => setPapel(o.v)}
                        className={cn(
                          "rounded-2xl border-2 p-3 text-left transition",
                          papel === o.v ? "border-primary bg-secondary shadow-md" : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="text-2xl">{o.emoji}</span>
                        <p className="mt-1 font-semibold">{o.t}</p>
                        <p className="text-xs text-muted-foreground">{o.d}</p>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="escola">Escola</Label>
                      <Input id="escola" value={escola} onChange={(e) => setEscola(e.target.value)} placeholder="Nome da escola" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="novo-email">E-mail</Label>
                    <Input id="novo-email" type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="voce@escola.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nova-senha">Senha</Label>
                    <Input id="nova-senha" type="password" autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="8+ caracteres com um número" />
                  </div>
                  <div className="space-y-2">
                    <Label>Seu avatar</Label>
                    <div className="flex items-center gap-3">
                      <AvatarEmoji usuario={{ avatar, cor, nome: nome || "Você" }} tamanho="lg" />
                      <div className="flex flex-wrap gap-1">
                        {AVATARES.map((a) => (
                          <button
                            type="button"
                            key={a}
                            onClick={() => setAvatar(a)}
                            className={cn("grid size-8 place-items-center rounded-lg text-lg transition hover:bg-muted", avatar === a && "bg-secondary ring-2 ring-primary")}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {CORES.map((c) => (
                        <button
                          type="button"
                          key={c}
                          aria-label={`Cor ${c}`}
                          onClick={() => setCor(c)}
                          className={cn("size-7 rounded-full bg-gradient-to-br ring-offset-2 ring-offset-background", GRADIENTES[c], cor === c && "ring-2 ring-primary")}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="h-11 w-full bg-brand text-base text-white">
                    Criar minha conta 🚀
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GrupoUsuarios({
  titulo,
  usuarios,
  onEscolher,
}: {
  titulo: string
  usuarios: { id: string; nome: string; avatar: string; cor: CorTema; detalhe: string }[]
  onEscolher: (id: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">{titulo}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {usuarios.map((u) => (
          <button
            key={u.id}
            onClick={() => onEscolher(u.id)}
            className="group flex items-center gap-3 rounded-2xl border bg-background/60 p-2.5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <AvatarEmoji usuario={u} tamanho="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{u.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{u.detalhe}</p>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  )
}
