import { useState } from "react"
import { Share2Icon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLoja, useUsuario } from "@/lib/store"
import { emblemasConquistados, estatisticasDoAluno, GRADIENTES, TITULOS, tituloAtual, xpTotal } from "@/lib/regras"
import type { CorTema } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AvatarEmoji, BarraProgresso, CabecalhoPagina } from "@/components/comum"

const AVATARES = ["🦊", "🐼", "🐸", "🦄", "🐙", "🐝", "🐯", "🐧", "🦖", "🐨", "🐢", "🦉", "👩‍🏫", "👨‍🏫", "👩‍🔬", "👩‍💻", "🧑‍🎨", "🧑‍🚀"]
const LIMITE_BIO = 140

async function compartilhar(texto: string) {
  try {
    if (navigator.share) {
      await navigator.share({ title: "Explica Aí!", text: texto })
      return
    }
    await navigator.clipboard.writeText(texto)
    toast.success("Texto copiado! Cola onde quiser 📋")
  } catch {
    /* compartilhamento cancelado */
  }
}

export default function Perfil() {
  const { dados, atualizarPerfil } = useLoja()
  const usuario = useUsuario()
  const [nome, setNome] = useState(usuario.nome)
  const [bio, setBio] = useState(usuario.bio)
  const [escola, setEscola] = useState(usuario.escola)
  const [avatar, setAvatar] = useState(usuario.avatar)
  const [cor, setCor] = useState<CorTema>(usuario.cor)

  const ehAluno = usuario.papel === "aluno"
  const xp = xpTotal(dados, usuario.id)
  const { atual, proximo, progresso } = tituloAtual(xp)
  const stats = estatisticasDoAluno(dados, usuario.id)
  const salas = dados.salas.filter((s) => (ehAluno ? s.alunoIds.includes(usuario.id) : s.professorId === usuario.id))
  const alterado = nome !== usuario.nome || bio !== usuario.bio || escola !== usuario.escola || avatar !== usuario.avatar || cor !== usuario.cor

  return (
    <div className="mx-auto max-w-5xl">
      <CabecalhoPagina emoji="🪪" titulo="Meu perfil" descricao="Do seu jeitinho." />

      <div className="grid grid-cols-1 items-start gap-6 *:min-w-0 lg:grid-cols-[1fr_1.2fr]">
        {/* Cartão de perfil */}
        <Card className="overflow-hidden rounded-3xl pt-0">
          <div className={cn("h-28 bg-gradient-to-br", GRADIENTES[cor])} />
          <CardContent className="-mt-14 space-y-4">
            <AvatarEmoji usuario={{ avatar, cor, nome }} tamanho="xl" className="ring-4" />
            <div>
              <h2 className="text-2xl font-extrabold">{nome || "Seu nome"}</h2>
              <p className="text-sm text-muted-foreground">
                {ehAluno ? `${atual.emoji} ${atual.nome}` : "👩‍🏫 Professor(a)"} · {escola}
              </p>
              {bio && <p className="mt-2 text-sm">{bio}</p>}
            </div>

            {ehAluno ? (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">⚡ {xp} XP</span>
                    <span className="text-muted-foreground">{proximo ? `${proximo.xp - xp} XP para ${proximo.emoji}` : "🏆 Máximo!"}</span>
                  </div>
                  <BarraProgresso valor={progresso} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { v: stats.enviadas, r: "explicações" },
                    { v: stats.excelentes, r: "excelentes 🤩" },
                    { v: salas.length, r: "salas" },
                  ].map((s) => (
                    <div key={s.r} className="rounded-2xl bg-muted/60 p-2">
                      <p className="font-heading text-xl font-extrabold tabular-nums">{s.v}</p>
                      <p className="text-[11px] text-muted-foreground">{s.r}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    compartilhar(`Sou ${atual.emoji} ${atual.nome} no Explica Aí! com ${xp} XP e ${stats.excelentes} explicações excelentes. Quem explica, aprende duas vezes 💬`)
                  }
                >
                  <Share2Icon /> Compartilhar minha conquista
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-muted/60 p-2">
                  <p className="font-heading text-xl font-extrabold">{salas.length}</p>
                  <p className="text-[11px] text-muted-foreground">salas</p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-2">
                  <p className="font-heading text-xl font-extrabold">{dados.topicos.filter((t) => t.autorId === usuario.id).length}</p>
                  <p className="text-[11px] text-muted-foreground">tópicos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Edição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">✏️ Editar perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (nome.trim().length < 3) return toast.error("Nome muito curto")
                  atualizarPerfil({ nome: nome.trim(), bio: bio.trim(), escola: escola.trim(), avatar, cor })
                  toast.success("Perfil atualizado ✨")
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p-nome">Nome</Label>
                    <Input id="p-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-escola">Escola</Label>
                    <Input id="p-escola" value={escola} onChange={(e) => setEscola(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="p-bio">Bio</Label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {bio.length}/{LIMITE_BIO}
                    </span>
                  </div>
                  <Textarea id="p-bio" rows={3} maxLength={LIMITE_BIO} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conta um pouco sobre você ✨" />
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex flex-wrap gap-1">
                    {AVATARES.map((a) => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => setAvatar(a)}
                        className={cn("grid size-9 place-items-center rounded-lg text-xl hover:bg-muted", avatar === a && "bg-secondary ring-2 ring-primary")}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {(Object.keys(GRADIENTES) as CorTema[]).map((c) => (
                      <button
                        type="button"
                        key={c}
                        aria-label={`Cor ${c}`}
                        onClick={() => setCor(c)}
                        className={cn("size-8 rounded-full bg-gradient-to-br ring-offset-2 ring-offset-background", GRADIENTES[c], cor === c && "ring-2 ring-primary")}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={!alterado} className="bg-brand text-white">
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>

          {ehAluno && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">🎖️ Títulos</CardTitle>
                  <CardDescription>Desbloqueados pelo seu XP total — só você contra você mesmo.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-5 gap-2">
                  {TITULOS.map((t) => {
                    const tem = xp >= t.xp
                    return (
                      <div key={t.nome} className={cn("flex flex-col items-center gap-1 rounded-2xl p-2 text-center", tem ? "bg-secondary" : "opacity-45 grayscale")}>
                        <span className="text-3xl">{t.emoji}</span>
                        <span className="text-[11px] leading-tight font-semibold">{t.nome}</span>
                        <span className="text-[10px] text-muted-foreground">{t.xp} XP</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">🏅 Emblemas por sala</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {salas.map((s) => {
                    const meus = emblemasConquistados(dados, usuario.id, s)
                    return (
                      <div key={s.id}>
                        <p className="mb-2 text-sm font-semibold">
                          {s.emoji} {s.nome}{" "}
                          <span className="font-normal text-muted-foreground">
                            · {meus.length}/{s.emblemas.length}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {s.emblemas.map((e) => {
                            const tem = meus.some((m) => m.id === e.id)
                            return (
                              <button
                                key={e.id}
                                disabled={!tem}
                                title={e.descricao}
                                onClick={() => compartilhar(`Ganhei o emblema ${e.emoji} ${e.nome} em ${s.nome} no Explica Aí! 🎉`)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                                  tem ? "bg-gradient-to-r from-amber-100 to-pink-100 hover:shadow-md dark:from-amber-400/20 dark:to-pink-500/20" : "bg-muted text-muted-foreground grayscale",
                                )}
                              >
                                {e.emoji} {e.nome} {tem && <Share2Icon className="size-3 opacity-60" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
