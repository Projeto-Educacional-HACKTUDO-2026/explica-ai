import { calcularXp, horarioDeEntrega } from "./regras"
import type { Dados, Nota, Resposta, Usuario } from "./types"

/* Datas relativas ao momento em que os dados são criados, para os prazos sempre fazerem sentido. */
function diasAtras(dias: number, hora = 14, minuto = 0) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  d.setHours(hora, minuto, 0, 0)
  // Eventos "de hoje" nunca ficam no futuro, seja qual for a hora em que o app abre.
  return new Date(Math.min(d.getTime(), Date.now() - 10 * 60000)).toISOString()
}

/* ───────────────────────── Usuários ───────────────────────── */

const usuarios: Usuario[] = [
  {
    id: "prof-marina",
    nome: "Marina Oliveira",
    email: "marina@explicaai.app",
    papel: "professor",
    avatar: "👩‍🔬",
    cor: "violeta",
    bio: "Professora de Biologia há 12 anos. Acredito que quem explica, aprende duas vezes 🌱",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [22, 35, 18, 40, 27, 12, 20],
  },
  {
    id: "prof-carlos",
    nome: "Carlos Mendes",
    email: "carlos@explicaai.app",
    papel: "professor",
    avatar: "👨‍🏫",
    cor: "laranja",
    bio: "História não é decoreba, é fofoca bem documentada 📜",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [15, 20, 25, 10, 30, 8, 14],
  },
  {
    id: "prof-ana",
    nome: "Ana Beatriz Souza",
    email: "ana@explicaai.app",
    papel: "professor",
    avatar: "👩‍💻",
    cor: "ceu",
    bio: "Matemática com pizza, skate e zero medo ➗🍕",
    escola: "Colégio Estadual Anísio Teixeira",
    tempoDeTela: [10, 12, 9, 20, 11, 5, 7],
  },
  {
    id: "aluno-lucas",
    nome: "Lucas Ferreira",
    email: "lucas@explicaai.app",
    papel: "aluno",
    avatar: "🦊",
    cor: "laranja",
    bio: "Curto física, skate e explicar coisa difícil com meme 🛹",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [14, 22, 9, 17, 25, 11, 16],
  },
  {
    id: "aluno-julia",
    nome: "Júlia Santos",
    email: "julia@explicaai.app",
    papel: "aluno",
    avatar: "🐼",
    cor: "rosa",
    bio: "Futura bióloga marinha 🐙 | playlist lo-fi pra estudar",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [20, 18, 26, 12, 15, 30, 19],
  },
  {
    id: "aluno-pedro",
    nome: "Pedro Henrique",
    email: "pedro@explicaai.app",
    papel: "aluno",
    avatar: "🐸",
    cor: "limao",
    bio: "Gamer nas horas vagas 🎮",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [8, 10, 12, 6, 14, 9, 11],
  },
  {
    id: "aluno-duda",
    nome: "Maria Eduarda",
    email: "duda@explicaai.app",
    papel: "aluno",
    avatar: "🦄",
    cor: "violeta",
    bio: "Desenho, escrevo e pergunto 'mas por quê?' pra tudo ✏️",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [16, 14, 19, 21, 13, 10, 15],
  },
  {
    id: "aluno-gabriel",
    nome: "Gabriel Lima",
    email: "gabriel@explicaai.app",
    papel: "aluno",
    avatar: "🐙",
    cor: "ceu",
    bio: "Tentando de novo até dar certo 💪",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [5, 9, 7, 12, 6, 8, 10],
  },
  {
    id: "aluno-sofia",
    nome: "Sofia Rocha",
    email: "sofia@explicaai.app",
    papel: "aluno",
    avatar: "🐝",
    cor: "laranja",
    bio: "Vôlei, K-pop e biologia (nessa ordem) 🏐",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [11, 7, 13, 9, 10, 12, 8],
  },
  {
    id: "aluno-enzo",
    nome: "Enzo Carvalho",
    email: "enzo@explicaai.app",
    papel: "aluno",
    avatar: "🐯",
    cor: "menta",
    bio: "Quero entender como tudo funciona ⚙️",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [12, 15, 10, 8, 14, 6, 9],
  },
  {
    id: "aluno-valentina",
    nome: "Valentina Costa",
    email: "valentina@explicaai.app",
    papel: "aluno",
    avatar: "🐧",
    cor: "menta",
    bio: "Podcasts de história no fone 24h 🎧",
    escola: "E.E. Paulo Freire",
    tempoDeTela: [18, 21, 15, 19, 17, 13, 22],
  },
]

/* ───────────────────────── Respostas ───────────────────────── */

let contador = 0
function resposta(
  r: Omit<Resposta, "id" | "tentativa" | "reinicios" | "usouIA" | "avaliacao"> & {
    tentativa?: number
    reinicios?: number
    usouIA?: boolean
    nota?: Nota
    base?: number
    avaliador?: string
    justificativa?: string
  },
): Resposta {
  const { nota, base = 50, avaliador, justificativa, ...resto } = r
  const usouIA = r.usouIA ?? false
  const enviada = new Date(r.enviadaEm)
  const avaliadaEm = new Date(enviada.getTime() + 20 * 3600 * 1000)
  return {
    ...resto,
    id: `resp-${++contador}`,
    tentativa: r.tentativa ?? 1,
    reinicios: r.reinicios ?? 0,
    usouIA,
    avaliacao: nota
      ? {
          nota,
          justificativa: justificativa ?? "",
          avaliadorId: avaliador ?? "prof-marina",
          avaliadaEm: avaliadaEm.toISOString(),
          xpGanho: calcularXp(base, nota, usouIA),
        }
      : undefined,
  }
}

const respostas: Resposta[] = [
  /* ── 1º B · Biologia ── d-1: meme da fotossíntese (50 XP) */
  resposta({
    desafioId: "d-1", salaId: "sala-bio", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(5, 19, 12),
    texto:
      "A planta pega luz do sol, água e gás carbônico e transforma em açúcar (glicose). Esse açúcar é tipo uma bateria de energia guardada. Quando eu como a salada, meu corpo quebra esse açúcar e usa a energia. Então a energia não é minha: veio do sol, passou pela planta e chegou em mim! ☀️➡️🌿➡️😎",
    nota: 3, justificativa: "Perfeito! Você mostrou o caminho completo da energia. Amei a setinha no final 😄",
  }),
  resposta({
    desafioId: "d-1", salaId: "sala-bio", alunoId: "aluno-julia", formato: "texto", enviadaEm: diasAtras(5, 16, 40),
    texto:
      "A planta faz fotossíntese usando a luz do sol pra fabricar o próprio alimento. Quando a gente come a planta, a gente pega a energia que ela guardou. O meme é engraçado porque a pessoa acha que a energia é dela, mas na verdade foi a planta que trabalhou.",
    nota: 2, avaliador: "aluno-lucas", reinicios: 1,
    justificativa: "Tá bem legal! Só faltou falar do que a planta fabrica (glicose) e de onde vêm os ingredientes (água e CO₂). — Lucas, monitor",
  }),
  resposta({
    desafioId: "d-1", salaId: "sala-bio", alunoId: "aluno-pedro", formato: "texto", enviadaEm: diasAtras(4, 21, 5), usouIA: true,
    texto:
      "A fotossíntese é o processo pelo qual organismos autotróficos convertem energia luminosa em energia química, armazenada em moléculas de glicose. Ao consumir vegetais, o ser humano obtém essa energia por meio da respiração celular.",
    nota: 3,
    justificativa: "O conteúdo está correto, mas parece texto de livro. Obrigada por avisar que usou IA! Na próxima, tenta com as suas palavras: vale mais XP 😉",
  }),
  resposta({
    desafioId: "d-1", salaId: "sala-bio", alunoId: "aluno-duda", formato: "texto", enviadaEm: diasAtras(5, 15, 22),
    texto:
      "Imagina que a planta é uma cozinheira que usa o sol como fogão. Ela junta água (que puxa da raiz) e gás carbônico (do ar) e cozinha um açúcar. Esse açúcar fica guardado nas folhas. Quando eu como a salada, eu tô comendo a comida que ela cozinhou com energia do sol.",
    nota: 3, justificativa: "Que analogia incrível! A planta cozinheira ficou muito clara 👩‍🍳",
  }),
  resposta({
    desafioId: "d-1", salaId: "sala-bio", alunoId: "aluno-gabriel", formato: "texto", enviadaEm: diasAtras(5, 20, 0),
    texto: "a planta faz fotossintese e a gente come ela",
    nota: 1, justificativa: "Tá no caminho! Tenta explicar O QUE a planta fabrica e COMO a energia chega em você. Você pode refazer 💪",
  }),
  resposta({
    desafioId: "d-1", salaId: "sala-bio", alunoId: "aluno-gabriel", formato: "texto", enviadaEm: diasAtras(1, 17, 30), tentativa: 2, reinicios: 2,
    texto:
      "Refiz! A planta usa a luz do sol pra juntar água e gás carbônico e fazer glicose, que é tipo a comida dela e guarda energia. Quando eu como a planta, meu corpo usa essa glicose como combustível. Então a energia que eu uso começou lá no sol.",
  }),

  /* d-2: áudio "por que as folhas são verdes?" (50 XP) */
  resposta({
    desafioId: "d-2", salaId: "sala-bio", alunoId: "aluno-lucas", formato: "audio", enviadaEm: diasAtras(2, 18, 10), duracaoSeg: 48,
    transcricao:
      "E aí! Então, a luz do sol parece branca mas tem todas as cores misturadas. A clorofila, que fica nas folhas, absorve muito o vermelho e o azul pra fazer fotossíntese, mas o verde ela quase não usa, ela rebate. E aí essa luz verde rebatida é a que chega no nosso olho. Por isso a gente vê a folha verde.",
  }),
  resposta({
    desafioId: "d-2", salaId: "sala-bio", alunoId: "aluno-duda", formato: "audio", enviadaEm: diasAtras(3, 16, 45), duracaoSeg: 62,
    transcricao:
      "Oi professora! A folha é verde por causa da clorofila. A clorofila come a luz vermelha e a luz azul, e sobra a verde, que ela devolve pra fora. Tipo quando você tá numa festa e recusa o salgado de azeitona, ele fica sobrando na bandeja, e todo mundo vê.",
    nota: 2,
    justificativa: "Adorei a comparação com a festa 😂 Só cuidado: a clorofila não 'come' a luz, ela absorve a energia dela. Mas a ideia está certa!",
  }),
  resposta({
    desafioId: "d-2", salaId: "sala-bio", alunoId: "aluno-julia", formato: "audio", enviadaEm: diasAtras(1, 13, 5), duracaoSeg: 35,
    transcricao:
      "Então, as folhas são verdes porque a clorofila reflete a cor verde e absorve as outras cores que ela usa pra fazer a fotossíntese.",
  }),

  /* d-3: texto "Caio acha que a planta come terra" (50 XP) */
  resposta({
    desafioId: "d-3", salaId: "sala-bio", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(8, 19, 0),
    texto:
      "Caio, a árvore não come terra! 🌳 Quase toda a massa dela vem do AR: ela puxa gás carbônico e, com luz e água, monta açúcar e madeira. Da terra ela só tira água e uns minerais. A árvore é basicamente ar organizado 😮",
    nota: 3, justificativa: "'Ar organizado' é a melhor definição que já li. 10/10 🌳",
  }),
  resposta({
    desafioId: "d-3", salaId: "sala-bio", alunoId: "aluno-julia", formato: "texto", enviadaEm: diasAtras(9, 14, 30),
    texto:
      "Caio, se a árvore comesse terra ia ficar um buraco gigante embaixo dela 😅 Na real ela usa o CO₂ do ar + água + luz do sol pra fabricar glicose, e é com isso que ela cresce. A terra dá só água e sais minerais.",
    nota: 3, avaliador: "aluno-lucas", justificativa: "O argumento do buraco é genial! — Lucas, monitor",
  }),
  resposta({
    desafioId: "d-3", salaId: "sala-bio", alunoId: "aluno-pedro", formato: "texto", enviadaEm: diasAtras(7, 22, 15),
    texto: "Caio, a planta não come terra, ela faz fotossíntese com luz, água e gás carbônico e produz o próprio alimento. A terra só dá os nutrientes.",
    nota: 2, justificativa: "Correto! Faltou dizer que a MASSA da árvore vem principalmente do gás carbônico — essa é a parte surpreendente.",
  }),
  resposta({
    desafioId: "d-3", salaId: "sala-bio", alunoId: "aluno-duda", formato: "texto", enviadaEm: diasAtras(9, 10, 0),
    texto: "Caio, a planta é tipo uma impressora 3D que usa o ar como material! Ela pega gás carbônico e água e, com energia do sol, fabrica o corpo dela. Terra é mais tipo um suplemento.",
    nota: 2, justificativa: "Impressora 3D de ar, amei! Só explica que ela fabrica glicose e usa isso para crescer.",
  }),
  resposta({
    desafioId: "d-3", salaId: "sala-bio", alunoId: "aluno-sofia", formato: "texto", enviadaEm: diasAtras(6, 18, 0),
    texto: "Caio ela não come terra ela come luz",
    nota: 1, avaliador: "aluno-lucas", justificativa: "Tem um pedaço de verdade aí! Mas luz é energia, não 'comida'. Tenta explicar de onde vem o material que forma a árvore 🙂 — Lucas, monitor",
  }),

  /* d-4: meme Drake da mitocôndria (60 XP na sala) */
  resposta({
    desafioId: "d-4", salaId: "sala-bio", alunoId: "aluno-julia", formato: "texto", enviadaEm: diasAtras(1, 15, 0),
    texto:
      "Falar que a mitocôndria é a usina é fácil, difícil é saber o que ela produz. Ela pega a glicose (que veio da comida) e o oxigênio (que veio da respiração) e transforma em ATP, que é a 'moeda de energia' que a célula gasta pra tudo: mexer músculo, pensar, crescer. Sem mitocôndria a célula ia ter comida mas não ia conseguir usar.",
  }),
  resposta({
    desafioId: "d-4", salaId: "sala-bio", alunoId: "aluno-duda", formato: "audio", enviadaEm: diasAtras(0, 9, 40), duracaoSeg: 55,
    transcricao:
      "Então, o meme mostra que decorar a frase não adianta. A mitocôndria é usina porque ela transforma a energia da glicose numa energia que a célula consegue usar, que chama ATP. É tipo trocar dinheiro de outro país por real pra conseguir comprar coisa aqui.",
  }),
  resposta({
    desafioId: "d-4", salaId: "sala-bio", alunoId: "aluno-sofia", formato: "texto", enviadaEm: diasAtras(0, 11, 20),
    texto: "A mitocôndria faz a respiração celular. Ela usa glicose e oxigênio e libera energia pra célula funcionar, e também sai gás carbônico que a gente expira.",
  }),

  /* d-5: imagem da célula */
  resposta({
    desafioId: "d-5", salaId: "sala-bio", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(0, 10, 15),
    texto:
      "A célula vegetal tem três coisas que a animal não tem: parede celular (tipo uma armadura que deixa a planta durinha), cloroplasto (onde rola a fotossíntese) e um vacúolo gigante que guarda água. A animal é mais 'molinha' e não faz o próprio alimento.",
  }),

  /* d-17: desafio criado pela Júlia (30 XP) */
  resposta({
    desafioId: "d-17", salaId: "sala-bio", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(2, 20, 30), base: 30,
    texto: "Sem luz a planta não faz fotossíntese, então ela começa a gastar o açúcar que tinha guardado. Ela fica amarelada porque para de produzir clorofila e cresce esticada procurando luz. Se demorar muito, ela morre de fome!",
    nota: 3, avaliador: "aluno-julia", justificativa: "Exatamente isso!! Até a parte de crescer esticada 🌚✨ — Júlia",
  }),
  resposta({
    desafioId: "d-17", salaId: "sala-bio", alunoId: "aluno-gabriel", formato: "texto", enviadaEm: diasAtras(1, 19, 0), base: 30,
    texto: "A planta no escuro fica sem energia porque não tem sol pra fazer fotossíntese e vai ficando fraca e amarela.",
  }),

  /* ── 2º A · História ── d-6: meme Luís XVI (60 XP) */
  resposta({
    desafioId: "d-6", salaId: "sala-hist", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(4, 18, 0), base: 60,
    texto:
      "O rei achou que podia só cobrar mais imposto pra pagar as dívidas (guerras + luxo de Versalhes). Só que quem pagava era o Terceiro Estado, o povo, enquanto nobreza e clero quase não pagavam. Com pão caro e fome, o povo se revoltou e tomou a Bastilha.",
    nota: 2, avaliador: "prof-carlos",
    justificativa: "Muito bom! Faltou citar as ideias iluministas, que deram o 'porquê' da revolta além da fome.",
  }),
  resposta({
    desafioId: "d-6", salaId: "sala-hist", alunoId: "aluno-julia", formato: "texto", enviadaEm: diasAtras(4, 11, 10), base: 60,
    texto:
      "A França tava falida e o rei queria resolver cobrando mais imposto justamente de quem já pagava tudo: o povo. A nobreza e o clero tinham privilégio e não pagavam quase nada. Ao mesmo tempo, os iluministas tavam espalhando a ideia de que todo mundo é igual. Resultado: pão caro + injustiça + ideias novas = revolução 🥖🔥",
    nota: 3, avaliador: "prof-carlos", justificativa: "Equação perfeita da Revolução 👏👏",
  }),
  resposta({
    desafioId: "d-6", salaId: "sala-hist", alunoId: "aluno-valentina", formato: "texto", enviadaEm: diasAtras(3, 20, 45), base: 60,
    texto:
      "Imagina que numa escola só a turma do fundão paga a conta da festa, enquanto a direção e os professores comem de graça. Aí o diretor pede mais dinheiro. É isso: a França tinha três 'estados' e só o Terceiro pagava. Com crise, fome e ideias iluministas, o povo cansou.",
    nota: 3, avaliador: "prof-carlos", justificativa: "Analogia da festa da escola: sensacional 🎉",
  }),

  /* d-7: áudio podcast (60 XP) */
  resposta({
    desafioId: "d-7", salaId: "sala-hist", alunoId: "aluno-valentina", formato: "audio", enviadaEm: diasAtras(1, 16, 0), base: 60, duracaoSeg: 95,
    transcricao:
      "Liberdade, igualdade e fraternidade. Liberdade era poder falar, pensar e ter religião sem o rei mandar em tudo. Igualdade era a lei valer igual pra nobre e pra padeiro. E fraternidade era a ideia de que o povo francês era tipo uma grande família que devia se ajudar. Hoje eu vejo isso na nossa Constituição, quando diz que todos são iguais perante a lei.",
  }),
  resposta({
    desafioId: "d-7", salaId: "sala-hist", alunoId: "aluno-julia", formato: "audio", enviadaEm: diasAtras(2, 14, 20), base: 60, duracaoSeg: 70,
    transcricao:
      "O lema significa que as pessoas querem ser livres do poder absoluto do rei, querem que a lei seja igual pra todo mundo, sem privilégio de nascimento, e querem que o povo seja unido. Um exemplo hoje é o direito de votar, que é igual pra todo mundo.",
    nota: 3, avaliador: "prof-carlos", justificativa: "Clara, objetiva e com exemplo atual. Mandou bem!",
  }),

  /* d-8: Bastilha pra avó */
  resposta({
    desafioId: "d-8", salaId: "sala-hist", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(0, 8, 50),
    texto:
      "Vó, sabe quando o preço do arroz sobe e todo mundo reclama? Na França de 1789 o pão tava caríssimo e o rei não tava nem aí. A Bastilha era uma prisão-fortaleza que simbolizava o poder do rei. Quando o povo invadiu, foi tipo dizer 'chega, agora quem manda somos nós'. Por isso o dia 14 de julho virou feriado lá até hoje!",
  }),

  /* d-9: Montesquieu na escola (50 XP) */
  resposta({
    desafioId: "d-9", salaId: "sala-hist", alunoId: "aluno-lucas", formato: "texto", enviadaEm: diasAtras(7, 19, 30),
    texto:
      "Na escola: o grêmio cria as regras do intervalo (Legislativo), a coordenação faz as regras funcionarem (Executivo) e o conselho de classe resolve as tretas (Judiciário). Se o diretor fizesse os três sozinho, podia inventar qualquer regra e punir quem ele quisesse. Separar é pra ninguém virar dono de tudo.",
    nota: 3, avaliador: "prof-carlos", justificativa: "Exemplo muito bem escolhido!",
  }),
  resposta({
    desafioId: "d-9", salaId: "sala-hist", alunoId: "aluno-julia", formato: "texto", enviadaEm: diasAtras(6, 22, 40), usouIA: true,
    texto:
      "Segundo Montesquieu, a separação dos poderes em Legislativo, Executivo e Judiciário garante o equilíbrio institucional, evitando a concentração de poder. No contexto escolar, o grêmio estudantil, a direção e o conselho escolar poderiam representar essa divisão.",
    nota: 2, avaliador: "prof-carlos",
    justificativa: "Valeu pela honestidade sobre a IA 🙏 O exemplo está certo, mas faltou explicar POR QUE dividir é importante, com as suas palavras.",
  }),
  resposta({
    desafioId: "d-9", salaId: "sala-hist", alunoId: "aluno-valentina", formato: "texto", enviadaEm: diasAtras(5, 17, 0),
    texto: "Os três poderes são legislativo executivo e judiciario e servem pra dividir o poder.",
    nota: 1, avaliador: "prof-carlos", justificativa: "Certo, mas cadê o exemplo da escola? Tenta de novo, sei que você manda bem 😉",
  }),

  /* ── Eletiva · Ciência no Dia a Dia ── d-10: meme do ônibus (40 XP) */
  resposta({
    desafioId: "d-10", salaId: "sala-ciencia", alunoId: "aluno-pedro", formato: "texto", enviadaEm: diasAtras(2, 12, 0), base: 40,
    texto: "É a inércia! Seu corpo tava indo junto com o ônibus. Quando o ônibus freia, a força do freio para o ônibus, mas ninguém avisou seu corpo, que continua indo pra frente até alguma coisa (a barra, o banco, a pessoa da frente 😬) parar você.",
    nota: 3, justificativa: "'Ninguém avisou seu corpo' é exatamente a Primeira Lei de Newton 😂",
  }),
  resposta({
    desafioId: "d-10", salaId: "sala-ciencia", alunoId: "aluno-duda", formato: "texto", enviadaEm: diasAtras(2, 17, 30), base: 40,
    texto: "Isso acontece porque os corpos tendem a continuar do jeito que estão. Se você tá em movimento, continua em movimento. O ônibus parou mas você não.",
    nota: 2, justificativa: "Correto! Dá pra deixar ainda melhor explicando o que faz o seu corpo finalmente parar.",
  }),
  resposta({
    desafioId: "d-10", salaId: "sala-ciencia", alunoId: "aluno-enzo", formato: "texto", enviadaEm: diasAtras(0, 10, 0), base: 40,
    texto: "Porque o corpo tem inércia. Tudo que tá se mexendo quer continuar se mexendo e tudo que tá parado quer continuar parado, a menos que uma força mude isso. O freio age no ônibus, não em você.",
  }),
  resposta({
    desafioId: "d-10", salaId: "sala-ciencia", alunoId: "aluno-valentina", formato: "texto", enviadaEm: diasAtras(1, 18, 0), base: 40,
    texto: "Seu corpo é teimoso: ele quer continuar na velocidade que estava. O ônibus freou, mas o seu corpo não tem freio próprio, então segue pra frente até o pé no chão e a mão na barra fazerem força pra te parar. Newton chamou essa teimosia de inércia.",
    nota: 3, justificativa: "Corpo teimoso sem freio próprio! Explicação nota máxima 🍎",
  }),

  /* d-11: áudio da colher (40 XP) */
  resposta({
    desafioId: "d-11", salaId: "sala-ciencia", alunoId: "aluno-duda", formato: "audio", enviadaEm: diasAtras(0, 11, 0), base: 40, duracaoSeg: 58,
    transcricao:
      "A colher de metal esquenta porque o metal é bom condutor de calor. As partículas do metal passam a agitação de uma pra outra bem rápido, tipo uma ola no estádio. Já a madeira é ruim nisso, a ola não anda, então o cabo fica frio.",
  }),
  resposta({
    desafioId: "d-11", salaId: "sala-ciencia", alunoId: "aluno-pedro", formato: "audio", enviadaEm: diasAtras(1, 19, 20), base: 40, duracaoSeg: 40,
    transcricao:
      "O metal conduz calor melhor que a madeira. Então o calor do café sobe pela colher de metal até a sua mão, e na colher de pau ele fica preso lá embaixo.",
    nota: 2, justificativa: "Certinho! Tenta explicar o que acontece com as partículas pra ficar nota máxima.",
  }),
]

/* ───────────────────────── Notificações ───────────────────────── */

function notificacao(
  id: string,
  usuarioId: string,
  tipo: Dados["notificacoes"][number]["tipo"],
  titulo: string,
  texto: string,
  criadaEm: string,
  lida = false,
  link?: string,
) {
  return {
    id, usuarioId, tipo, titulo, texto, criadaEm, lida, link,
    entregarEm: horarioDeEntrega(new Date(criadaEm)).toISOString(),
  }
}

/* ───────────────────────── Dados completos ───────────────────────── */

export function criarDadosDeExemplo(): Dados {
  return {
    usuarios,
    salas: [
      {
        id: "sala-bio",
        nome: "1º B · Biologia",
        emoji: "🧬",
        descricao: "Da fotossíntese às células: explique a vida com as suas palavras.",
        cor: "limao",
        codigo: "BIO-1B7",
        professorId: "prof-marina",
        alunoIds: ["aluno-lucas", "aluno-julia", "aluno-pedro", "aluno-duda", "aluno-gabriel", "aluno-sofia"],
        monitorIds: ["aluno-lucas"],
        topicoIds: ["top-fotossintese", "top-celula"],
        configs: {
          "d-1": { adicionadoEm: diasAtras(6, 8), maxTentativas: 2 },
          "d-2": { adicionadoEm: diasAtras(4, 8) },
          "d-3": { adicionadoEm: diasAtras(10, 8) },
          "d-4": { adicionadoEm: diasAtras(2, 8), xp: 60 },
          "d-5": { adicionadoEm: diasAtras(1, 8) },
        },
        emblemas: [
          { id: "emb-1", emoji: "🌿", nome: "Clorofila de Ouro", descricao: "Chegou a 100 XP na sala", xpMinimo: 100, concedidoA: [] },
          { id: "emb-2", emoji: "🎤", nome: "Explicador(a) Nato(a)", descricao: "Chegou a 200 XP na sala", xpMinimo: 200, concedidoA: [] },
          { id: "emb-3", emoji: "🧤", nome: "Mão na Massa", descricao: "Montou o modelo de célula com massinha na feira", concedidoA: ["aluno-duda", "aluno-gabriel"] },
          { id: "emb-4", emoji: "🦠", nome: "Célula Master", descricao: "Chegou a 250 XP na sala", xpMinimo: 250, concedidoA: [] },
        ],
        criadaEm: diasAtras(40),
      },
      {
        id: "sala-hist",
        nome: "2º A · História",
        emoji: "🏛️",
        descricao: "Revoluções, ideias e tretas que mudaram o mundo.",
        cor: "laranja",
        codigo: "HIS-2A4",
        professorId: "prof-carlos",
        alunoIds: ["aluno-lucas", "aluno-julia", "aluno-valentina"],
        monitorIds: ["aluno-valentina"],
        topicoIds: ["top-revolucao", "top-iluminismo"],
        configs: {
          "d-6": { adicionadoEm: diasAtras(5, 8) },
          "d-7": { adicionadoEm: diasAtras(3, 8) },
          "d-8": { adicionadoEm: diasAtras(1, 8), maxTentativas: 3 },
          "d-9": { adicionadoEm: diasAtras(8, 8) },
        },
        emblemas: [
          { id: "emb-5", emoji: "💡", nome: "Mente Iluminada", descricao: "Chegou a 80 XP na sala", xpMinimo: 80, concedidoA: [] },
          { id: "emb-6", emoji: "📜", nome: "Historiador(a) Raiz", descricao: "Chegou a 150 XP na sala", xpMinimo: 150, concedidoA: [] },
        ],
        criadaEm: diasAtras(35),
      },
      {
        id: "sala-ciencia",
        nome: "Eletiva · Ciência no Dia a Dia",
        emoji: "🔬",
        descricao: "Por que o ônibus te joga pra frente? Física e química do cotidiano.",
        cor: "ceu",
        codigo: "CIE-EL9",
        professorId: "prof-marina",
        alunoIds: ["aluno-pedro", "aluno-duda", "aluno-enzo", "aluno-valentina"],
        monitorIds: [],
        topicoIds: ["top-fisica"],
        configs: {
          "d-10": { adicionadoEm: diasAtras(3, 8) },
          "d-11": { adicionadoEm: diasAtras(2, 8) },
        },
        emblemas: [
          { id: "emb-7", emoji: "🍎", nome: "Newton Aprova", descricao: "Chegou a 40 XP na eletiva", xpMinimo: 40, concedidoA: [] },
        ],
        criadaEm: diasAtras(20),
      },
    ],
    topicos: [
      { id: "top-fotossintese", titulo: "Fotossíntese", emoji: "🌱", descricao: "Como as plantas transformam luz em comida (e em você).", materia: "Biologia", autorId: "prof-marina", publico: true, xpPadrao: 50 },
      { id: "top-celula", titulo: "A Célula", emoji: "🦠", descricao: "Organelas, membranas e a famosa usina de força.", materia: "Biologia", autorId: "prof-marina", publico: false, xpPadrao: 40 },
      { id: "top-fisica", titulo: "Física no Cotidiano", emoji: "⚡", descricao: "Inércia, calor e outras coisas que acontecem com você todo dia.", materia: "Física", autorId: "prof-marina", publico: false, xpPadrao: 40 },
      { id: "top-revolucao", titulo: "Revolução Francesa", emoji: "🥖", descricao: "Impostos, pão caro e ideias novas: a receita de 1789.", materia: "História", autorId: "prof-carlos", publico: true, xpPadrao: 60 },
      { id: "top-iluminismo", titulo: "Iluminismo", emoji: "💡", descricao: "Os pensadores que questionaram reis e inventaram os três poderes.", materia: "História", autorId: "prof-carlos", publico: false, xpPadrao: 50 },
      { id: "top-fracoes", titulo: "Frações sem Medo", emoji: "🍕", descricao: "Pizza, descontos e receitas: frações na vida real.", materia: "Matemática", autorId: "prof-ana", publico: true, xpPadrao: 45 },
      { id: "top-pitagoras", titulo: "Teorema de Pitágoras", emoji: "📐", descricao: "Triângulos retângulos na rampa de skate e na tela do celular.", materia: "Matemática", autorId: "prof-ana", publico: true, xpPadrao: 55 },
    ],
    desafios: [
      {
        id: "d-1", topicoId: "top-fotossintese", titulo: "Explica o meme: a energia é minha? 😎", tipo: "meme",
        enunciado: "Explique o meme como se fosse para o seu primo de 10 anos: de onde vem a energia da planta e como ela chega até você?",
        conteudo: { meme: { template: "classico", cena: "🌿☀️😎", topo: "Planta fazendo fotossíntese o dia inteiro", base: "Eu comendo salada e achando que a energia é minha" } },
        formatoResposta: "texto", limiteCaracteres: 400, limiteAudioSeg: 60, prazoDias: 10, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(30),
      },
      {
        id: "d-2", topicoId: "top-fotossintese", titulo: "Por que as folhas são verdes? 🎧", tipo: "audio",
        enunciado: "Ouça o áudio da professora e responda em áudio, como se estivesse mandando mensagem para um amigo.",
        conteudo: { audio: { locutor: "Profa. Marina", duracaoSeg: 24, transcricao: "Oi, turma! Pergunta rápida pra vocês pensarem no caminho de casa: se a luz do sol é branca, cheia de cores misturadas, por que quase todas as folhas são verdes? Grave um áudio de até um minuto e meio explicando. Dica: pensem no que a clorofila faz com cada cor da luz." } },
        formatoResposta: "audio", limiteCaracteres: 400, limiteAudioSeg: 90, prazoDias: 7, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(30),
      },
      {
        id: "d-3", topicoId: "top-fotossintese", titulo: "A árvore come terra? 🌳", tipo: "texto",
        enunciado: "Explique para o Caio, em até 280 caracteres (tipo um post), de onde vem a massa de uma árvore.",
        conteudo: { texto: "Seu amigo Caio jura que as plantas crescem porque 'comem' a terra: \"Olha o tamanho daquela árvore! Ela tirou tudo isso do chão, é óbvio.\" Você sabe que não é bem assim..." },
        formatoResposta: "texto", limiteCaracteres: 280, limiteAudioSeg: 60, prazoDias: 7, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(30),
      },
      {
        id: "d-4", topicoId: "top-celula", titulo: "Usina de força... de quê? ⚡", tipo: "meme",
        enunciado: "Todo mundo sabe a frase. Agora explique de verdade: o que a mitocôndria produz e por que a célula precisa disso? Responda em texto ou áudio.",
        conteudo: { meme: { template: "drake", cena: "🙅", topo: "Decorar “a mitocôndria é a usina de força da célula”", cenaB: "😏", base: "Explicar o que essa usina produz e pra que serve" } },
        formatoResposta: "ambos", limiteCaracteres: 500, limiteAudioSeg: 60, prazoDias: 7, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(25),
      },
      {
        id: "d-5", topicoId: "top-celula", titulo: "Célula animal × vegetal 🔍", tipo: "imagem",
        enunciado: "Olhe a ilustração e explique três diferenças entre a célula animal e a vegetal. Para cada diferença, diga por que ela faz sentido para a planta.",
        conteudo: { imagem: { ilustracao: "celula", legenda: "Célula vegetal (esquerda) e célula animal (direita)" } },
        formatoResposta: "texto", limiteCaracteres: 500, limiteAudioSeg: 60, prazoDias: 10, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(25),
      },
      {
        id: "d-6", topicoId: "top-revolucao", titulo: "Expectativa × realidade em 1789 👑", tipo: "meme",
        enunciado: "Explique o meme: por que 'só mais um imposto' virou uma revolução? Cite pelo menos duas causas.",
        conteudo: { meme: { template: "expectativa", cena: "👑💸", topo: "Luís XVI: “só mais um impostinho, ninguém vai ligar”", cenaB: "🥖🔥🏰", base: "O povo francês em 14 de julho de 1789" } },
        formatoResposta: "texto", limiteCaracteres: 450, limiteAudioSeg: 60, prazoDias: 7, maxTentativas: 2, autorId: "prof-carlos", criadoEm: diasAtras(28),
      },
      {
        id: "d-7", topicoId: "top-revolucao", titulo: "Podcast: liberdade, igualdade, fraternidade 🎙️", tipo: "audio",
        enunciado: "Ouça o episódio e grave um áudio explicando o que cada palavra do lema significava em 1789 e dê um exemplo de onde você vê isso hoje.",
        conteudo: { audio: { locutor: "Prof. Carlos", duracaoSeg: 32, transcricao: "Fala, galera, bem-vindos ao Explica Aí Podcast! Hoje o assunto é um lema de três palavras que mudou o mundo: liberdade, igualdade, fraternidade. Em 1789, cada uma dessas palavras era uma provocação contra o rei e contra os privilégios. Sua missão: me explicar, com as suas palavras, o que cada uma queria dizer naquela época, e onde você enxerga essas ideias hoje, no Brasil." } },
        formatoResposta: "audio", limiteCaracteres: 400, limiteAudioSeg: 120, prazoDias: 7, maxTentativas: 2, autorId: "prof-carlos", criadoEm: diasAtras(28),
      },
      {
        id: "d-8", topicoId: "top-revolucao", titulo: "Conta pra vó: a Queda da Bastilha 👵", tipo: "texto",
        enunciado: "Conte o que foi a Queda da Bastilha como se estivesse no almoço de domingo explicando para sua avó. Nada de decoreba: por que isso importou?",
        conteudo: { texto: "Em 14 de julho de 1789, uma multidão em Paris invadiu a Bastilha, uma velha fortaleza usada como prisão. Havia só sete presos lá dentro. Mesmo assim, o episódio virou o símbolo do início da Revolução Francesa e é feriado nacional na França até hoje." },
        formatoResposta: "texto", limiteCaracteres: 500, limiteAudioSeg: 60, prazoDias: 5, maxTentativas: 3, autorId: "prof-carlos", criadoEm: diasAtras(20),
      },
      {
        id: "d-9", topicoId: "top-iluminismo", titulo: "Montesquieu na sua escola 🏫", tipo: "texto",
        enunciado: "Explique a ideia dos três poderes usando um exemplo da sua escola. Por que é perigoso uma pessoa só ter os três?",
        conteudo: { texto: "“Para que não se possa abusar do poder, é preciso que, pela disposição das coisas, o poder freie o poder.” — Montesquieu, O Espírito das Leis (1748)" },
        formatoResposta: "texto", limiteCaracteres: 450, limiteAudioSeg: 60, prazoDias: 14, maxTentativas: 2, autorId: "prof-carlos", criadoEm: diasAtras(30),
      },
      {
        id: "d-10", topicoId: "top-fisica", titulo: "O ônibus freou e eu não 🚌", tipo: "meme",
        enunciado: "Explique o meme usando a ideia de inércia, como se fosse um vídeo curto para quem nunca ouviu falar de Newton.",
        conteudo: { meme: { template: "classico", cena: "🚌💨🧍", topo: "O ônibus freia do nada", base: "Meu corpo continuando a viagem sozinho" } },
        formatoResposta: "texto", limiteCaracteres: 350, limiteAudioSeg: 60, prazoDias: 7, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(15),
      },
      {
        id: "d-11", topicoId: "top-fisica", titulo: "A colher que queima ☕", tipo: "audio",
        enunciado: "Responda em áudio: por que a colher de metal esquenta e a de pau não?",
        conteudo: { audio: { locutor: "Profa. Marina", duracaoSeg: 18, transcricao: "Situação real: você deixa uma colher de metal e uma colher de pau dentro de uma xícara de chocolate quente. Um minuto depois, pega nas duas. Uma queima seu dedo, a outra não. Me explica o que aconteceu ali, como se fosse um áudio no grupo da turma." } },
        formatoResposta: "audio", limiteCaracteres: 400, limiteAudioSeg: 75, prazoDias: 7, maxTentativas: 2, autorId: "prof-marina", criadoEm: diasAtras(15),
      },
      {
        id: "d-12", topicoId: "top-fracoes", titulo: "Metade ou dois quartos? 🍕", tipo: "meme",
        enunciado: "Explique por que o personagem mudou de ideia. Use um desenho mental de pizza na sua explicação.",
        conteudo: { meme: { template: "drake", cena: "😤", topo: "“Quero 2/4 da pizza, metade é pouco”", cenaB: "🤯", base: "Descobrir que 2/4 e 1/2 são a mesma quantidade" } },
        formatoResposta: "ambos", limiteCaracteres: 350, limiteAudioSeg: 60, prazoDias: 7, maxTentativas: 2, autorId: "prof-ana", criadoEm: diasAtras(50),
      },
      {
        id: "d-13", topicoId: "top-fracoes", titulo: "Black Friday das frações 🛍️", tipo: "texto",
        enunciado: "Qual loja dá o melhor desconto? Explique sem usar a palavra “fração”.",
        conteudo: { texto: "O mesmo tênis custa R$ 300 nas duas lojas. A loja A anuncia “1/3 de desconto!”. A loja B anuncia “30% OFF!”." },
        formatoResposta: "texto", limiteCaracteres: 300, limiteAudioSeg: 60, prazoDias: 5, maxTentativas: 2, autorId: "prof-ana", criadoEm: diasAtras(50),
      },
      {
        id: "d-14", topicoId: "top-pitagoras", titulo: "A rampa de skate 🛹", tipo: "audio",
        enunciado: "Ouça o problema e explique em áudio como descobrir o comprimento da rampa.",
        conteudo: { audio: { locutor: "Profa. Ana", duracaoSeg: 20, transcricao: "Você quer construir uma rampa de skate. Ela precisa subir três metros de altura e começar a quatro metros de distância da parede. Quanto de madeira você vai precisar para a parte inclinada? Explica o raciocínio, não só o número!" } },
        formatoResposta: "audio", limiteCaracteres: 300, limiteAudioSeg: 90, prazoDias: 7, maxTentativas: 2, autorId: "prof-ana", criadoEm: diasAtras(45),
      },
      {
        id: "d-15", topicoId: "top-pitagoras", titulo: "Polegadas da TV 📺", tipo: "video",
        enunciado: "Assista ao vídeo e explique por que uma TV de 50 polegadas não tem 50 polegadas de largura.",
        conteudo: { video: { titulo: "Por que a TV mede na diagonal?", duracaoSeg: 94, resumo: "Um vídeo curtinho mostrando a medida da diagonal de telas e o triângulo retângulo escondido nelas." } },
        formatoResposta: "texto", limiteCaracteres: 350, limiteAudioSeg: 60, prazoDias: 7, maxTentativas: 2, autorId: "prof-ana", criadoEm: diasAtras(45),
      },
      {
        id: "d-16", topicoId: "top-celula", titulo: "Por que a gente não explode bebendo água? 💧", tipo: "texto",
        enunciado: "Explique o que a osmose tem a ver com isso e o que acontece com uma célula colocada em água muito salgada.",
        conteudo: { texto: "Desafio criado pelo Lucas! Todo dia a gente bebe litros de água e as nossas células não estouram. Mas se você colocar uma hemácia em água pura, ela incha até explodir. 🤔" },
        formatoResposta: "ambos", limiteCaracteres: 400, limiteAudioSeg: 60, prazoDias: 7, xp: 30, maxTentativas: 1, autorId: "aluno-lucas",
        criadoPorAluno: { salaId: "sala-bio", status: "pendente" }, criadoEm: diasAtras(0, 9),
      },
      {
        id: "d-17", topicoId: "top-fotossintese", titulo: "Planta trancada no armário 🌚", tipo: "texto",
        enunciado: "O que acontece com uma planta que fica uma semana inteira dentro de um armário escuro? Explique o porquê.",
        conteudo: { texto: "Desafio criado pela Júlia! Minha mãe esqueceu um vasinho de manjericão no armário durante a viagem. Quando voltamos... 😬" },
        formatoResposta: "texto", limiteCaracteres: 350, limiteAudioSeg: 60, prazoDias: 7, xp: 30, maxTentativas: 1, autorId: "aluno-julia",
        criadoPorAluno: { salaId: "sala-bio", status: "aprovado" }, criadoEm: diasAtras(3, 9),
      },
    ],
    respostas,
    convites: [
      { id: "conv-1", salaId: "sala-ciencia", alunoId: "aluno-julia", status: "pendente", criadoEm: diasAtras(1, 10) },
      { id: "conv-2", salaId: "sala-hist", alunoId: "aluno-duda", status: "pendente", criadoEm: diasAtras(2, 11) },
    ],
    notificacoes: [
      notificacao("n-1", "aluno-lucas", "correcao", "Seu desafio foi avaliado 🤩", "Júlia avaliou sua resposta em “Planta trancada no armário”: Excelente resposta!", diasAtras(1, 16), false, "/desafios/sala-bio/d-17"),
      notificacao("n-2", "aluno-lucas", "desafio", "Novo desafio no 2º A · História 🥖", "Prof. Carlos publicou “Conta pra vó: a Queda da Bastilha”.", diasAtras(1, 8, 5), false, "/desafios/sala-hist/d-8"),
      notificacao("n-3", "aluno-lucas", "resumo", "Resumo do dia para monitores 📬", "3 respostas novas esperando avaliação no 1º B · Biologia.", diasAtras(0, 18), false, "/avaliar"),
      notificacao("n-4", "aluno-lucas", "desafio", "Novo desafio no 1º B · Biologia 🔍", "Profa. Marina publicou “Célula animal × vegetal”.", diasAtras(1, 8), true, "/desafios/sala-bio/d-5"),
      notificacao("n-5", "aluno-lucas", "emblema", "Emblema desbloqueado: Clorofila de Ouro 🌿", "Você chegou a 100 XP no 1º B · Biologia. Bora compartilhar?", diasAtras(2, 21), true, "/perfil"),
      notificacao("n-6", "aluno-julia", "convite", "Convite para Ciência no Dia a Dia 🔬", "Profa. Marina te convidou para a eletiva.", diasAtras(1, 10), false, "/salas"),
      notificacao("n-7", "aluno-julia", "correcao", "Seu áudio foi avaliado 🎧", "Prof. Carlos avaliou “Podcast: liberdade, igualdade, fraternidade”: Excelente resposta!", diasAtras(1, 9), false, "/desafios/sala-hist/d-7"),
      notificacao("n-8", "aluno-julia", "aprovacao", "Seu desafio foi aprovado ✅", "“Planta trancada no armário” já está disponível para a turma.", diasAtras(3, 15), true, "/salas/sala-bio"),
      notificacao("n-9", "prof-marina", "resumo", "Resumo diário 📬", "7 respostas novas nas suas salas. 1 desafio de aluno aguardando aprovação.", diasAtras(0, 18), false, "/avaliar"),
      notificacao("n-10", "prof-marina", "aprovacao", "Lucas criou um desafio 💧", "“Por que a gente não explode bebendo água?” aguarda sua aprovação.", diasAtras(0, 9, 10), false, "/salas/sala-bio"),
      notificacao("n-11", "prof-marina", "resumo", "Resumo diário 📬", "4 respostas novas no 1º B · Biologia.", diasAtras(1, 18), true, "/avaliar"),
      notificacao("n-12", "prof-carlos", "resumo", "Resumo diário 📬", "2 respostas novas no 2º A · História.", diasAtras(0, 18), false, "/avaliar"),
      notificacao("n-13", "aluno-duda", "convite", "Convite para 2º A · História 🏛️", "Prof. Carlos te convidou para a sala.", diasAtras(2, 11), false, "/salas"),
      notificacao("n-14", "aluno-gabriel", "correcao", "Bora tentar de novo? 💪", "Profa. Marina deixou um comentário na sua resposta. Você pode refazer!", diasAtras(4, 16), true, "/desafios/sala-bio/d-1"),
    ],
  }
}
