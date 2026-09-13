/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { calcularXp, horarioDeEntrega, xpDoDesafio } from "./regras"
import { criarDadosDeExemplo } from "./seed"
import type {
  ConfigDesafioSala,
  CorTema,
  Dados,
  Desafio,
  Emblema,
  Nota,
  Notificacao,
  Papel,
  Resposta,
  Sala,
  Topico,
  Usuario,
} from "./types"

const CHAVE_DADOS = "explica-ai:dados:v1"
const CHAVE_SESSAO = "explica-ai:sessao:v1"

function carregar(): Dados {
  try {
    const salvo = localStorage.getItem(CHAVE_DADOS)
    if (salvo) return JSON.parse(salvo) as Dados
  } catch {
    /* sem storage disponível: usa os dados de exemplo */
  }
  return criarDadosDeExemplo()
}

function gerarId(prefixo: string) {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`
}

function gerarCodigo(nome: string) {
  const letras = nome.normalize("NFD").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X")
  return `${letras}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

type NovoDesafio = Omit<Desafio, "id" | "criadoEm" | "autorId">

interface Loja {
  dados: Dados
  usuario: Usuario | null
  entrar: (usuarioId: string) => void
  sair: () => void
  cadastrar: (dados: { nome: string; email: string; papel: Papel; avatar: string; cor: CorTema; escola: string }) => Usuario
  atualizarPerfil: (mudancas: Partial<Pick<Usuario, "nome" | "bio" | "avatar" | "cor" | "escola">>) => void
  restaurarExemplos: () => void

  criarSala: (s: Pick<Sala, "nome" | "emoji" | "descricao" | "cor">) => Sala
  convidarAluno: (salaId: string, alunoId: string) => void
  responderConvite: (conviteId: string, aceitar: boolean) => void
  entrarComCodigo: (codigo: string) => Sala | null
  alternarMonitor: (salaId: string, alunoId: string) => void
  criarEmblema: (salaId: string, emblema: Omit<Emblema, "id" | "concedidoA">) => void
  concederEmblema: (salaId: string, emblemaId: string, alunoId: string) => void

  criarTopico: (t: Pick<Topico, "titulo" | "emoji" | "descricao" | "materia" | "publico" | "xpPadrao">) => Topico
  alternarPublico: (topicoId: string) => void
  importarTopico: (topicoId: string) => Topico
  vincularTopico: (salaId: string, topicoId: string) => void
  desvincularTopico: (salaId: string, topicoId: string) => void
  atualizarConfig: (salaId: string, desafioId: string, config: Partial<ConfigDesafioSala>) => void

  criarDesafio: (d: NovoDesafio) => Desafio
  decidirDesafioDeAluno: (desafioId: string, aprovar: boolean) => void

  enviarResposta: (r: Omit<Resposta, "id" | "enviadaEm" | "avaliacao" | "tentativa">) => Resposta
  avaliarResposta: (respostaId: string, nota: Nota, justificativa: string) => void

  marcarNotificacoesLidas: () => void
}

const Contexto = createContext<Loja | null>(null)

export function ProvedorDeDados({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<Dados>(carregar)
  const [usuarioId, setUsuarioId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CHAVE_SESSAO)
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados))
    } catch {
      /* armazenamento cheio (ex.: muitos áudios) — o app segue funcionando em memória */
    }
  }, [dados])

  useEffect(() => {
    try {
      if (usuarioId) localStorage.setItem(CHAVE_SESSAO, usuarioId)
      else localStorage.removeItem(CHAVE_SESSAO)
    } catch {
      /* ignora */
    }
  }, [usuarioId])

  const usuario = dados.usuarios.find((u) => u.id === usuarioId) ?? null

  const notificar = useCallback(
    (d: Dados, usuarioIds: string[], n: Pick<Notificacao, "tipo" | "titulo" | "texto" | "link">): Notificacao[] => {
      const agora = new Date()
      return usuarioIds.map((id) => ({
        ...n,
        id: gerarId("n"),
        usuarioId: id,
        criadaEm: agora.toISOString(),
        entregarEm: horarioDeEntrega(agora).toISOString(),
        lida: false,
      })).concat(d.notificacoes)
    },
    [],
  )

  const alterarSala = (salaId: string, fn: (s: Sala) => Sala) =>
    setDados((d) => ({ ...d, salas: d.salas.map((s) => (s.id === salaId ? fn(s) : s)) }))

  const loja = useMemo<Loja>(() => {
    const exigirUsuario = () => {
      if (!usuario) throw new Error("Nenhum usuário conectado")
      return usuario
    }

    return {
      dados,
      usuario,
      entrar: (id) => setUsuarioId(id),
      sair: () => setUsuarioId(null),
      cadastrar: (novo) => {
        const u: Usuario = { ...novo, id: gerarId(novo.papel), bio: "", tempoDeTela: [0, 0, 0, 0, 0, 0, 0] }
        setDados((d) => ({ ...d, usuarios: [...d.usuarios, u] }))
        setUsuarioId(u.id)
        return u
      },
      atualizarPerfil: (mudancas) => {
        const u = exigirUsuario()
        setDados((d) => ({ ...d, usuarios: d.usuarios.map((x) => (x.id === u.id ? { ...x, ...mudancas } : x)) }))
      },
      restaurarExemplos: () => {
        setDados(criarDadosDeExemplo())
      },

      criarSala: (s) => {
        const u = exigirUsuario()
        const sala: Sala = {
          ...s,
          id: gerarId("sala"),
          codigo: gerarCodigo(s.nome),
          professorId: u.id,
          alunoIds: [],
          monitorIds: [],
          topicoIds: [],
          configs: {},
          emblemas: [
            { id: gerarId("emb"), emoji: "🚀", nome: "Primeira Decolagem", descricao: "Chegou a 50 XP na sala", xpMinimo: 50, concedidoA: [] },
          ],
          criadaEm: new Date().toISOString(),
        }
        setDados((d) => ({ ...d, salas: [...d.salas, sala] }))
        return sala
      },
      convidarAluno: (salaId, alunoId) => {
        setDados((d) => {
          const sala = d.salas.find((s) => s.id === salaId)!
          const jaConvidado = d.convites.some((c) => c.salaId === salaId && c.alunoId === alunoId && c.status === "pendente")
          if (jaConvidado || sala.alunoIds.includes(alunoId)) return d
          return {
            ...d,
            convites: [...d.convites, { id: gerarId("conv"), salaId, alunoId, status: "pendente", criadoEm: new Date().toISOString() }],
            notificacoes: notificar(d, [alunoId], {
              tipo: "convite",
              titulo: `Convite para ${sala.nome} ${sala.emoji}`,
              texto: "Você foi convidado(a) para uma nova sala. Bora?",
              link: "/salas",
            }),
          }
        })
      },
      responderConvite: (conviteId, aceitar) => {
        setDados((d) => {
          const convite = d.convites.find((c) => c.id === conviteId)!
          return {
            ...d,
            convites: d.convites.map((c) => (c.id === conviteId ? { ...c, status: aceitar ? "aceito" : "recusado" } : c)),
            salas: aceitar
              ? d.salas.map((s) =>
                  s.id === convite.salaId && !s.alunoIds.includes(convite.alunoId)
                    ? { ...s, alunoIds: [...s.alunoIds, convite.alunoId] }
                    : s,
                )
              : d.salas,
          }
        })
      },
      entrarComCodigo: (codigo) => {
        const u = exigirUsuario()
        const sala = dados.salas.find((s) => s.codigo.toUpperCase() === codigo.trim().toUpperCase())
        if (!sala) return null
        alterarSala(sala.id, (s) => (s.alunoIds.includes(u.id) ? s : { ...s, alunoIds: [...s.alunoIds, u.id] }))
        return sala
      },
      alternarMonitor: (salaId, alunoId) =>
        alterarSala(salaId, (s) => ({
          ...s,
          monitorIds: s.monitorIds.includes(alunoId) ? s.monitorIds.filter((id) => id !== alunoId) : [...s.monitorIds, alunoId],
        })),
      criarEmblema: (salaId, emblema) =>
        alterarSala(salaId, (s) => ({ ...s, emblemas: [...s.emblemas, { ...emblema, id: gerarId("emb"), concedidoA: [] }] })),
      concederEmblema: (salaId, emblemaId, alunoId) => {
        setDados((d) => {
          const sala = d.salas.find((s) => s.id === salaId)!
          const emblema = sala.emblemas.find((e) => e.id === emblemaId)!
          return {
            ...d,
            salas: d.salas.map((s) =>
              s.id !== salaId
                ? s
                : {
                    ...s,
                    emblemas: s.emblemas.map((e) =>
                      e.id === emblemaId && !e.concedidoA.includes(alunoId) ? { ...e, concedidoA: [...e.concedidoA, alunoId] } : e,
                    ),
                  },
            ),
            notificacoes: notificar(d, [alunoId], {
              tipo: "emblema",
              titulo: `Você ganhou um emblema: ${emblema.nome} ${emblema.emoji}`,
              texto: emblema.descricao,
              link: "/perfil",
            }),
          }
        })
      },

      criarTopico: (t) => {
        const u = exigirUsuario()
        const topico: Topico = { ...t, id: gerarId("top"), autorId: u.id }
        setDados((d) => ({ ...d, topicos: [...d.topicos, topico] }))
        return topico
      },
      alternarPublico: (topicoId) =>
        setDados((d) => ({ ...d, topicos: d.topicos.map((t) => (t.id === topicoId ? { ...t, publico: !t.publico } : t)) })),
      importarTopico: (topicoId) => {
        const u = exigirUsuario()
        const original = dados.topicos.find((t) => t.id === topicoId)!
        const copia: Topico = { ...original, id: gerarId("top"), autorId: u.id, publico: false, origemId: original.id }
        const desafios = dados.desafios
          .filter((d) => d.topicoId === topicoId && !d.criadoPorAluno)
          .map((d) => ({ ...d, id: gerarId("d"), topicoId: copia.id, autorId: u.id, criadoEm: new Date().toISOString() }))
        setDados((d) => ({ ...d, topicos: [...d.topicos, copia], desafios: [...d.desafios, ...desafios] }))
        return copia
      },
      vincularTopico: (salaId, topicoId) => {
        setDados((d) => {
          const sala = d.salas.find((s) => s.id === salaId)!
          if (sala.topicoIds.includes(topicoId)) return d
          const agora = new Date().toISOString()
          const desafios = d.desafios.filter((x) => x.topicoId === topicoId && !x.criadoPorAluno)
          // O prazo de cada desafio reinicia sempre que ele entra em uma nova sala.
          const configs = { ...sala.configs }
          for (const x of desafios) configs[x.id] = { adicionadoEm: agora }
          const topico = d.topicos.find((t) => t.id === topicoId)!
          const comTopico = { ...d, salas: d.salas.map((s) => (s.id === salaId ? { ...s, topicoIds: [...s.topicoIds, topicoId], configs } : s)) }
          return desafios.length
            ? {
                ...comTopico,
                notificacoes: notificar(d, sala.alunoIds, {
                  tipo: "desafio",
                  titulo: `Novos desafios em ${sala.nome} ${topico.emoji}`,
                  texto: `${desafios.length} desafio(s) de “${topico.titulo}” chegaram na sala.`,
                  link: `/salas/${salaId}`,
                }),
              }
            : comTopico
        })
      },
      desvincularTopico: (salaId, topicoId) =>
        alterarSala(salaId, (s) => ({ ...s, topicoIds: s.topicoIds.filter((id) => id !== topicoId) })),
      atualizarConfig: (salaId, desafioId, config) =>
        alterarSala(salaId, (s) => ({ ...s, configs: { ...s.configs, [desafioId]: { ...s.configs[desafioId], ...config } } })),

      criarDesafio: (novo) => {
        const u = exigirUsuario()
        const desafio: Desafio = { ...novo, id: gerarId("d"), autorId: u.id, criadoEm: new Date().toISOString() }
        setDados((d) => {
          let proximo: Dados = { ...d, desafios: [...d.desafios, desafio] }
          if (desafio.criadoPorAluno) {
            const sala = d.salas.find((s) => s.id === desafio.criadoPorAluno!.salaId)!
            proximo = {
              ...proximo,
              notificacoes: notificar(d, [sala.professorId], {
                tipo: "aprovacao",
                titulo: `${u.nome.split(" ")[0]} criou um desafio ${u.avatar}`,
                texto: `“${desafio.titulo}” aguarda sua aprovação.`,
                link: `/salas/${sala.id}`,
              }),
            }
          } else {
            // Desafio novo entra automaticamente nas salas que já usam o tópico.
            const agora = new Date().toISOString()
            const salas = d.salas.filter((s) => s.topicoIds.includes(desafio.topicoId))
            proximo = {
              ...proximo,
              salas: d.salas.map((s) =>
                s.topicoIds.includes(desafio.topicoId) ? { ...s, configs: { ...s.configs, [desafio.id]: { adicionadoEm: agora } } } : s,
              ),
              notificacoes: notificar(d, salas.flatMap((s) => s.alunoIds), {
                tipo: "desafio",
                titulo: "Novo desafio publicado ✨",
                texto: `“${desafio.titulo}” está esperando a sua explicação.`,
                link: "/inicio",
              }),
            }
          }
          return proximo
        })
        return desafio
      },
      decidirDesafioDeAluno: (desafioId, aprovar) => {
        setDados((d) => {
          const desafio = d.desafios.find((x) => x.id === desafioId)!
          const sala = d.salas.find((s) => s.id === desafio.criadoPorAluno!.salaId)!
          const status = aprovar ? "aprovado" : "recusado"
          let notificacoes = notificar(d, [desafio.autorId], {
            tipo: "aprovacao",
            titulo: aprovar ? "Seu desafio foi aprovado ✅" : "Seu desafio precisa de ajustes ✏️",
            texto: aprovar ? `“${desafio.titulo}” já está disponível para a turma.` : `Converse com o professor sobre “${desafio.titulo}”.`,
            link: `/salas/${sala.id}`,
          })
          if (aprovar) {
            notificacoes = notificar({ ...d, notificacoes }, sala.alunoIds.filter((id) => id !== desafio.autorId), {
              tipo: "desafio",
              titulo: "Um colega te desafiou 🔥",
              texto: `“${desafio.titulo}” chegou em ${sala.nome}.`,
              link: `/desafios/${sala.id}/${desafio.id}`,
            })
          }
          return {
            ...d,
            desafios: d.desafios.map((x) =>
              x.id === desafioId ? { ...x, criadoPorAluno: { ...x.criadoPorAluno!, status }, criadoEm: new Date().toISOString() } : x,
            ),
            salas: aprovar
              ? d.salas.map((s) => (s.id === sala.id ? { ...s, configs: { ...s.configs, [desafioId]: { adicionadoEm: new Date().toISOString() } } } : s))
              : d.salas,
            notificacoes,
          }
        })
      },

      enviarResposta: (r) => {
        const anteriores = dados.respostas.filter(
          (x) => x.alunoId === r.alunoId && x.desafioId === r.desafioId && x.salaId === r.salaId,
        )
        const resposta: Resposta = { ...r, id: gerarId("resp"), tentativa: anteriores.length + 1, enviadaEm: new Date().toISOString() }
        setDados((d) => ({ ...d, respostas: [...d.respostas, resposta] }))
        return resposta
      },
      avaliarResposta: (respostaId, nota, justificativa) => {
        const u = exigirUsuario()
        setDados((d) => {
          const resposta = d.respostas.find((r) => r.id === respostaId)!
          const desafio = d.desafios.find((x) => x.id === resposta.desafioId)!
          const sala = d.salas.find((s) => s.id === resposta.salaId)!
          const xpGanho = calcularXp(xpDoDesafio(d, desafio, sala), nota, resposta.usouIA)
          return {
            ...d,
            respostas: d.respostas.map((r) =>
              r.id === respostaId
                ? { ...r, avaliacao: { nota, justificativa, avaliadorId: u.id, avaliadaEm: new Date().toISOString(), xpGanho } }
                : r,
            ),
            notificacoes: notificar(d, [resposta.alunoId], {
              tipo: "correcao",
              titulo: "Sua resposta foi avaliada ✨",
              texto: `${u.nome.split(" ")[0]} avaliou “${desafio.titulo}”. Você ganhou ${xpGanho} XP!`,
              link: `/desafios/${sala.id}/${desafio.id}`,
            }),
          }
        })
      },

      marcarNotificacoesLidas: () => {
        const u = exigirUsuario()
        const agora = Date.now()
        setDados((d) => ({
          ...d,
          notificacoes: d.notificacoes.map((n) =>
            n.usuarioId === u.id && new Date(n.entregarEm).getTime() <= agora ? { ...n, lida: true } : n,
          ),
        }))
      },
    }
  }, [dados, usuario, notificar])

  return <Contexto.Provider value={loja}>{children}</Contexto.Provider>
}

export function useLoja() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error("useLoja precisa estar dentro de <ProvedorDeDados>")
  return ctx
}

/** Atalho para páginas que exigem login (o roteador já garante isso). */
export function useUsuario() {
  const { usuario } = useLoja()
  if (!usuario) throw new Error("Página exige usuário conectado")
  return usuario
}
