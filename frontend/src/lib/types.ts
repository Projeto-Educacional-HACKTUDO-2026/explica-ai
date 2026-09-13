export type Papel = "professor" | "aluno"

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: Papel
  avatar: string // emoji
  cor: CorTema
  bio: string
  escola: string
  /** Minutos de uso do app nos últimos 7 dias (do mais antigo para hoje). */
  tempoDeTela: number[]
}

export type CorTema = "violeta" | "rosa" | "limao" | "ceu" | "laranja" | "menta"

export type TipoConteudo = "texto" | "meme" | "audio" | "imagem" | "video"
export type FormatoResposta = "texto" | "audio" | "ambos"

export type MemeTemplate = "classico" | "drake" | "expectativa"

export interface ConteudoMeme {
  template: MemeTemplate
  /** Emojis que compõem a "imagem" do meme. */
  cena: string
  topo: string
  base: string
  /** Para templates de dois painéis (drake / expectativa). */
  cenaB?: string
}

export interface ConteudoDesafio {
  texto?: string
  meme?: ConteudoMeme
  /** Áudio do professor: gravação real (audioUrl) ou roteiro lido por síntese de voz. */
  audio?: { transcricao: string; duracaoSeg: number; locutor: string; audioUrl?: string }
  /** Ilustração embutida ou imagem enviada pelo professor (data: URL). */
  imagem?: { ilustracao?: "celula" | "triangulo" | "linha-do-tempo"; url?: string; legenda: string }
  video?: { titulo: string; duracaoSeg: number; resumo: string }
}

export type StatusAprovacao = "aprovado" | "pendente" | "recusado"

export interface Desafio {
  id: string
  topicoId: string
  titulo: string
  tipo: TipoConteudo
  enunciado: string
  conteudo: ConteudoDesafio
  formatoResposta: FormatoResposta
  limiteCaracteres: number
  limiteAudioSeg: number
  prazoDias: number
  /** Sobrescreve o XP padrão do tópico. */
  xp?: number
  maxTentativas: number
  autorId: string
  /** Desafio criado por um aluno para a turma ("Desafiar colegas"). */
  criadoPorAluno?: { salaId: string; status: StatusAprovacao }
  criadoEm: string
}

export interface Topico {
  id: string
  titulo: string
  emoji: string
  descricao: string
  materia: string
  autorId: string
  publico: boolean
  xpPadrao: number
  /** Quando importado da biblioteca pública. */
  origemId?: string
}

export interface ConfigDesafioSala {
  /** Data em que o desafio entrou na sala: o prazo conta a partir daqui. */
  adicionadoEm: string
  xp?: number
  maxTentativas?: number
}

export interface Emblema {
  id: string
  emoji: string
  nome: string
  descricao: string
  /** Conquistado automaticamente ao atingir esse XP na sala. */
  xpMinimo?: number
  /** Alunos que receberam manualmente. */
  concedidoA: string[]
}

export interface Sala {
  id: string
  nome: string
  emoji: string
  descricao: string
  cor: CorTema
  codigo: string
  professorId: string
  alunoIds: string[]
  monitorIds: string[]
  topicoIds: string[]
  configs: Record<string, ConfigDesafioSala>
  emblemas: Emblema[]
  criadaEm: string
}

export interface Convite {
  id: string
  salaId: string
  alunoId: string
  status: "pendente" | "aceito" | "recusado"
  criadoEm: string
}

export type Nota = 1 | 2 | 3

export interface Avaliacao {
  nota: Nota
  justificativa: string
  avaliadorId: string
  avaliadaEm: string
  xpGanho: number
}

export interface Resposta {
  id: string
  desafioId: string
  salaId: string
  alunoId: string
  tentativa: number
  formato: "texto" | "audio"
  texto?: string
  /** data: URL da gravação real (quando existir). */
  audioUrl?: string
  /** Transcrição usada para reproduzir respostas de exemplo em áudio. */
  transcricao?: string
  duracaoSeg?: number
  usouIA: boolean
  reinicios: number
  enviadaEm: string
  avaliacao?: Avaliacao
}

export type TipoNotificacao = "desafio" | "correcao" | "resumo" | "emblema" | "convite" | "aprovacao"

export interface Notificacao {
  id: string
  usuarioId: string
  tipo: TipoNotificacao
  titulo: string
  texto: string
  criadaEm: string
  /** Notificações geradas entre 22h e 7h ficam agendadas para as 7h. */
  entregarEm: string
  lida: boolean
  link?: string
}

export type StatusDesafio = "pendente" | "respondido" | "avaliado" | "encerrado"

export interface Dados {
  usuarios: Usuario[]
  salas: Sala[]
  topicos: Topico[]
  desafios: Desafio[]
  respostas: Resposta[]
  convites: Convite[]
  notificacoes: Notificacao[]
}
