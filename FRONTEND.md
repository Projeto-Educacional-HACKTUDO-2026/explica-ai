# 💬 Explica Aí! — Documentação do Front-end

> **Quem explica, aprende duas vezes.**
> Protótipo navegável do app descrito no [README.md](README.md): React + shadcn/ui, mobile-first, com dados e usuários de exemplo prontos para explorar.

---

## Sumário

1. [Como rodar](#-como-rodar)
2. [Stack](#-stack)
3. [Estrutura de pastas](#-estrutura-de-pastas)
4. [Rotas e telas](#-rotas-e-telas)
5. [Usuários de exemplo](#-usuários-de-exemplo)
6. [Salas, tópicos e desafios de exemplo](#-salas-tópicos-e-desafios-de-exemplo)
7. [Regras de negócio](#-regras-de-negócio)
8. [Requisitos → onde estão no código](#-requisitos--onde-estão-no-código)
9. [Design system](#-design-system)
10. [Componentes principais](#-componentes-principais)
11. [Estado e persistência](#-estado-e-persistência)
12. [Decisões e interpretações](#-decisões-e-interpretações)
13. [Limitações e próximos passos](#-limitações-e-próximos-passos)

---

## 🚀 Como rodar

Pré-requisito: **Node.js 20+** (testado com Node 24).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

| Script            | O que faz                                        |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento com hot reload       |
| `npm run build`   | Checagem de tipos (`tsc -b`) + build de produção |
| `npm run preview` | Serve o build de produção localmente             |
| `npm run lint`    | Lint com oxlint                                  |

Ao abrir o app, a aba **✨ Exemplos** da tela inicial permite entrar com qualquer usuário de exemplo **sem senha**. Na aba **Entrar**, qualquer e-mail de exemplo funciona com qualquer senha de 4+ caracteres.

> 💡 Dica: pelo menu do avatar (canto superior) dá para **trocar de usuário**, alternar **tema claro/escuro** e **restaurar os dados de exemplo**.

---

## 🧰 Stack

| Camada          | Tecnologia                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| Build           | [Vite 8](https://vite.dev) + TypeScript 6                                  |
| UI              | [React 19](https://react.dev)                                              |
| Componentes     | [shadcn/ui](https://ui.shadcn.com) (preset *Nova*, base Radix)             |
| Estilo          | [Tailwind CSS 4](https://tailwindcss.com) + `tw-animate-css`               |
| Rotas           | [React Router 8](https://reactrouter.com)                                  |
| Ícones          | [lucide-react](https://lucide.dev) + muito emoji 😄                        |
| Toasts          | [sonner](https://sonner.emilkowal.ski)                                     |
| Fontes          | Bricolage Grotesque (títulos), Geist (texto), Anton (memes) via Fontsource |
| Lint            | oxlint                                                                     |

Não há backend: todo o estado vive no navegador (veja [Estado e persistência](#-estado-e-persistência)).

---

## 📁 Estrutura de pastas

```
frontend/
├── index.html                  # HTML base (pt-BR, tema aplicado antes do 1º paint)
├── public/favicon.svg
└── src/
    ├── main.tsx                # Monta <ProvedorDeDados> + <App>
    ├── App.tsx                 # Tema, tooltips, toasts e rotas (públicas × logadas)
    ├── index.css               # Tokens de cor, fontes, animações e utilitários
    ├── lib/
    │   ├── types.ts            # Modelo de dados (Usuario, Sala, Topico, Desafio, Resposta…)
    │   ├── seed.ts             # 🌱 Dados e usuários de exemplo
    │   ├── store.tsx           # Contexto global + todas as ações (criar sala, avaliar…)
    │   ├── regras.ts           # Regras de negócio puras (XP, status, prazos, mosaico…)
    │   ├── formatar.ts         # Datas relativas, durações, saudações (pt-BR)
    │   ├── icones.ts           # Emoji/rótulo de cada tipo de conteúdo
    │   ├── tema.tsx            # Tema claro/escuro/sistema
    │   └── utils.ts            # cn() do shadcn
    ├── components/
    │   ├── ui/                 # Componentes shadcn gerados (button, card, dialog…)
    │   ├── layout/AppShell.tsx # Sidebar (desktop), topo + barra inferior (celular)
    │   ├── comum.tsx           # Logo, AvatarEmoji, badges, XpPill, Vazio, BarraProgresso
    │   ├── Meme.tsx            # Memes em 3 formatos, feitos só com CSS + emoji
    │   ├── PlayerAudio.tsx     # Player com onda animada e velocidade até 2x
    │   ├── GravadorAudio.tsx   # Gravação com limite de tempo (MediaRecorder)
    │   ├── TextoSemApagar.tsx  # Campo de resposta que não deixa apagar
    │   ├── ConteudoDoDesafio.tsx # Renderiza meme/texto/áudio/imagem/vídeo
    │   ├── Mosaico.tsx         # Mosaico da turma e do aluno
    │   ├── CartaoDesafio.tsx   # Card de desafio com status, prazo e XP
    │   ├── TentativaCard.tsx   # Uma resposta enviada + avaliação
    │   ├── ListaRespostas.tsx  # Fila de respostas com filtros
    │   ├── GraficoTempoDeTela.tsx
    │   ├── Convites.tsx        # Convites pendentes + entrar com código
    │   ├── DialogNovaSala.tsx
    │   └── DialogNovoDesafio.tsx # Criação de desafio (professor e "desafiar colegas")
    └── pages/
        ├── Entrar.tsx          # Landing + login + cadastro
        ├── aluno/InicioAluno.tsx
        ├── professor/InicioProfessor.tsx
        ├── professor/Topicos.tsx
        ├── professor/TopicoDetalhe.tsx
        ├── Salas.tsx
        ├── SalaDetalhe.tsx     # Abas: desafios, mosaico, turma, emblemas, respostas, aprovações
        ├── DesafioPagina.tsx   # Responder (aluno) / acompanhar e ajustar (professor, monitor)
        ├── Avaliar.tsx         # Fila de avaliação
        ├── Corrigir.tsx        # Avaliar uma resposta (nota 1–3 + justificativa)
        ├── Notificacoes.tsx
        └── Perfil.tsx
```

---

## 🗺️ Rotas e telas

| Rota                           | Quem acessa         | O que tem                                                                                               |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `/entrar`                      | Deslogado           | Landing, login com usuários de exemplo, login por e-mail e cadastro (professor ou aluno)               |
| `/inicio`                      | Todos               | **Aluno:** dashboard pessoal · **Professor:** dashboard da turma                                        |
| `/salas`                       | Todos               | Lista de salas; aluno vê convites e entra por código, professor cria salas                             |
| `/salas/:salaId`               | Membros da sala     | Abas `?aba=desafios · mosaico · turma · emblemas · respostas · aprovacoes`                              |
| `/desafios/:salaId/:desafioId` | Membros da sala     | Conteúdo do desafio; aluno responde; professor/monitor acompanha respostas e ajusta XP/tentativas/prazo |
| `/avaliar`                     | Professor, monitor  | Fila de respostas (aguardando / avaliadas / todas)                                                      |
| `/avaliar/:respostaId`         | Quem pode avaliar   | Resposta completa, tentativas anteriores, nota 1–3 com prévia de XP e justificativa                     |
| `/topicos`                     | Professor           | Meus tópicos + biblioteca pública de outros professores                                                 |
| `/topicos/:topicoId`           | Professor           | Desafios do tópico, publicar/privar, vincular a sala, importar                                          |
| `/notificacoes`                | Todos               | Avisos novos, anteriores e agendados (horário de descanso)                                              |
| `/perfil`                      | Todos               | Editar nome, bio, escola, avatar e cor; títulos, emblemas e compartilhamento                            |

### 🎒 Dashboard do aluno
- Saudação, **título atual** e barra de XP até o próximo título.
- **🪞 Você vs. você da semana passada** — a única comparação do app é consigo mesmo.
- Contadores: 🤩 excelentes, 👍 boas, 🌱 para melhorar, ⏳ aguardando.
- **🎯 Pra explicar agora:** desafios pendentes ordenados por prazo.
- **💌 Últimos feedbacks** com nota, XP, justificativa e **quem avaliou** (professor, monitor ou autor do desafio).
- **🌿 Tempo no app:** gráfico dos últimos 7 dias com linha de meta saudável.
- **🧩 Mosaicos** e **🏅 emblemas** conquistados.

### 👩‍🏫 Dashboard do professor
- Atalhos: avaliar, nova sala, tópicos.
- Salas, alunos, respostas para avaliar e participação média.
- **🔥 Desafios criados por alunos** aguardando aprovação.
- **🔍 O que a turma ainda não entendeu:** desafios com menor média, com a distribuição das notas 1/2/3.
- **📥 Fila de avaliação** e cartões das salas com mosaico e participação.

### 📱 Mobile-first
- Celular: topo com logo + sino + avatar e **barra de navegação inferior** (máx. 5 itens).
- Desktop (≥ 1024px): **sidebar fixa** com contadores e o card “🌿 Uso consciente”.
- Layouts em grid que colapsam para uma coluna; abas roláveis horizontalmente.

---

## 👥 Usuários de exemplo

| Avatar | Nome              | Papel     | E-mail                    | Destaques                                                         |
| :----: | ----------------- | --------- | ------------------------- | ----------------------------------------------------------------- |
| 👩‍🔬   | Marina Oliveira   | Professor | `marina@explicaai.app`    | 2 salas (Biologia e Eletiva), tem desafio de aluno para aprovar   |
| 👨‍🏫   | Carlos Mendes     | Professor | `carlos@explicaai.app`    | Sala de História, tópico público “Revolução Francesa”             |
| 👩‍💻   | Ana Beatriz Souza | Professor | `ana@explicaai.app`       | Sem salas; autora de tópicos públicos de Matemática               |
| 🦊     | Lucas Ferreira    | Aluno     | `lucas@explicaai.app`     | 🛡️ Monitor no 1º B, 225 XP, criou um desafio pendente             |
| 🐼     | Júlia Santos      | Aluno     | `julia@explicaai.app`     | Autora de desafio aprovado, usou IA uma vez, tem convite pendente |
| 🐸     | Pedro Henrique    | Aluno     | `pedro@explicaai.app`     | Declarou IA em uma resposta                                       |
| 🦄     | Maria Eduarda     | Aluno     | `duda@explicaai.app`      | Emblema manual “Mão na Massa”, convite para História              |
| 🐙     | Gabriel Lima      | Aluno     | `gabriel@explicaai.app`   | Tirou nota 1 e **refez** o desafio (tentativa 2 aguardando)       |
| 🐝     | Sofia Rocha       | Aluno     | `sofia@explicaai.app`     | Poucos XP, vários desafios pendentes — bom para testar respostas  |
| 🐯     | Enzo Carvalho     | Aluno     | `enzo@explicaai.app`      | Só na Eletiva                                                     |
| 🐧     | Valentina Costa   | Aluno     | `valentina@explicaai.app` | 🛡️ Monitora em História                                           |

> Senha: qualquer uma com 4+ caracteres (é um protótipo). Contas novas exigem 8+ caracteres com um número.

### Roteiros sugeridos 🧭
1. **Responder um desafio:** entre como **Sofia** → “Explica o meme: a energia é minha?” → tente apagar (não dá!) → marque “usei IA” e veja o XP cair pela metade → envie.
2. **Avaliar:** entre como **Marina** → *Avaliar* → escolha a resposta da Sofia → nota 3 → veja a fila avançar.
3. **Ver o feedback:** volte como **Sofia** → o desafio mostra quem avaliou, o XP e o botão **Refazer**.
4. **Monitoria:** entre como **Lucas** → *Avaliar* aparece no menu com as respostas do 1º B.
5. **Desafio entre colegas:** como **Maria Eduarda**, abra o 1º B → *🔥 Desafiar colegas*; como **Marina**, aprove em *Aprovações*.
6. **Biblioteca pública:** como **Carlos** → *Tópicos* → *Biblioteca pública* → “Frações sem Medo” → *Usar* → vincule à sala.

---

## 📚 Salas, tópicos e desafios de exemplo

### Salas
| Sala                                | Professor | Código    | Tópicos                           | Emblemas                                                                 |
| ----------------------------------- | --------- | --------- | --------------------------------- | ------------------------------------------------------------------------ |
| 🧬 1º B · Biologia                  | Marina    | `BIO-1B7` | Fotossíntese, A Célula            | 🌿 Clorofila de Ouro (100) · 🎤 Explicador Nato (200) · 🧤 Mão na Massa (manual) · 🦠 Célula Master (250) |
| 🏛️ 2º A · História                  | Carlos    | `HIS-2A4` | Revolução Francesa, Iluminismo    | 💡 Mente Iluminada (80) · 📜 Historiador Raiz (150)                      |
| 🔬 Eletiva · Ciência no Dia a Dia   | Marina    | `CIE-EL9` | Física no Cotidiano               | 🍎 Newton Aprova (40)                                                    |

### Desafios (memes, textos e áudios 😂📝🎧)
| Tipo | Desafio                                          | Tópico              | Resposta     |
| :--: | ------------------------------------------------ | ------------------- | ------------ |
| 😂   | **Explica o meme: a energia é minha?** — “Planta fazendo fotossíntese o dia inteiro / Eu comendo salada e achando que a energia é minha” | Fotossíntese | Texto (400) |
| 🎧   | **Por que as folhas são verdes?** — áudio da Profa. Marina | Fotossíntese | Áudio (1:30) |
| 📝   | **A árvore come terra?** — explique pro Caio em 280 caracteres | Fotossíntese | Texto (280) |
| 😂   | **Usina de força… de quê?** — meme “Não × Sim” da mitocôndria | A Célula | Texto ou áudio |
| 🖼️   | **Célula animal × vegetal** — ilustração SVG | A Célula | Texto |
| 😂   | **Expectativa × realidade em 1789** — “Luís XVI: só mais um impostinho” | Revolução Francesa | Texto |
| 🎧   | **Podcast: liberdade, igualdade, fraternidade** | Revolução Francesa | Áudio (2:00) |
| 📝   | **Conta pra vó: a Queda da Bastilha** | Revolução Francesa | Texto |
| 📝   | **Montesquieu na sua escola** | Iluminismo | Texto |
| 😂   | **O ônibus freou e eu não** — inércia | Física no Cotidiano | Texto |
| 🎧   | **A colher que queima** — condução de calor | Física no Cotidiano | Áudio |
| 😂   | **Metade ou dois quartos?** 🍕 | Frações sem Medo (público) | Texto ou áudio |
| 📝   | **Black Friday das frações** | Frações sem Medo (público) | Texto |
| 🎧   | **A rampa de skate** 🛹 | Pitágoras (público) | Áudio |
| 🎬   | **Polegadas da TV** | Pitágoras (público) | Texto |
| 🔥   | **Planta trancada no armário** — criado pela Júlia, aprovado | Fotossíntese | Texto |
| 🔥   | **Por que a gente não explode bebendo água?** — criado pelo Lucas, pendente | A Célula | Texto ou áudio |

São **~35 respostas** de exemplo escritas com linguagem de estudante (analogias com festa, impressora 3D, “ar organizado”…), com avaliações de professores, monitores e autores de desafios, incluindo casos com IA declarada, notas 1/2/3 e tentativas refeitas.

> As datas dos dados de exemplo são **relativas ao momento em que o app é aberto**, então os prazos sempre fazem sentido.

---

## ⚖️ Regras de negócio

Todas em [`src/lib/regras.ts`](frontend/src/lib/regras.ts), como funções puras.

### ⚡ XP
| Nota | Rótulo                | % do XP |
| :--: | --------------------- | :-----: |
| 3    | 🤩 Excelente resposta | 100%    |
| 2    | 👍 Boa resposta       | 75%     |
| 1    | 🌱 Pode ser melhor    | 20%     |

- **IA declarada:** −50 pontos percentuais, com mínimo de 0%. Ex.: nota 3 + IA = 50%; nota 1 + IA = 0%.
- **XP base do desafio:** override da sala → XP do desafio → XP padrão do tópico.
- **XP na sala = soma da melhor tentativa de cada desafio.** Refazer nunca reduz XP (não punitivo).

### 🎖️ Títulos (automáticos por XP total)
🐣 Curioso(a) (0) → 🧭 Explorador(a) (100) → 💬 Explicador(a) (250) → 🧪 Cientista de Bolso (500) → 🧠 Mestre Feynman (900)

### 🏅 Emblemas (por sala)
Criados/personalizados pelo professor: **automáticos** (XP mínimo na sala) ou **manuais** (concedidos a alunos específicos). Toda sala nova já nasce com “🚀 Primeira Decolagem”.

### 📌 Status de um desafio para o aluno
`✏️ Pendente` → `📨 Respondido` → `✅ Avaliado`, ou `💤 Prazo encerrado` se o prazo passou sem resposta.

### ⏳ Prazos
Cada desafio tem prazo em dias, contado a partir de quando ele **entra na sala**. Vincular um tópico a uma nova sala reinicia a contagem; o professor também pode reiniciar manualmente.

### 🔁 Tentativas
Cada desafio define `maxTentativas` (padrão 2), ajustável por sala por **professores e monitores**. Após uma avaliação, o aluno pode refazer enquanto houver tentativas.

### ✍️ Resposta em texto “sem apagar”
Backspace/Delete, recortar, colar, arrastar, desfazer e mover o cursor são bloqueados; o texto só cresce no final. Para corrigir, o aluno **reinicia** a resposta (o número de reinícios fica registrado e aparece para quem avalia).

### 🎙️ Resposta em áudio
Gravação com `MediaRecorder` e **parada automática no limite** definido pelo professor. Sem microfone, o app oferece um **modo demonstração**. Todo áudio pode ser ouvido em **1x, 1,25x, 1,5x ou 2x**.

### 🛡️ Quem pode avaliar
Professor da sala, monitores da sala e — para desafios criados por alunos — o próprio autor. Ninguém avalia a própria resposta. A avaliação sempre mostra **quem avaliou** e em qual papel.

### 🔔 Notificações
- Alunos: novos desafios, correções, emblemas, convites, aprovação de desafios.
- Professores/monitores: **resumo diário** das respostas.
- 🌙 **Nada é entregue entre 22h e 7h**: a notificação é criada com `entregarEm` nas 7h seguintes e aparece como “agendada”.

### 🧩 Mosaico
Cada aluno tem um bloco 4×4 (16 peças) dentro da imagem da turma — um pôr do sol sobre o mar gerado por código. Peças são reveladas proporcionalmente a `XP na sala ÷ XP máximo da sala`, numa ordem fixa por aluno. As peças ainda não conquistadas aparecem apagadas, como prévia. A imagem só se completa quando **todos** chegam ao XP máximo.

---

## ✅ Requisitos → onde estão no código

### Funcionais
| Requisito                                                       | Onde                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Conta de professor ou aluno                                     | `pages/Entrar.tsx` (aba Criar conta)                                 |
| Professores criam salas                                         | `components/DialogNovaSala.tsx`                                      |
| Professores criam tópicos                                       | `pages/professor/Topicos.tsx` → `DialogNovoTopico`                   |
| Vincular tópicos a salas                                        | `SalaDetalhe.tsx` (`DialogVincularTopico`) e `TopicoDetalhe.tsx`     |
| Convidar alunos                                                 | `SalaDetalhe.tsx` → aba Turma → `DialogConvidar` (+ código da sala)  |
| Desafios em texto, imagem, áudio e vídeo                        | `components/DialogNovoDesafio.tsx`, `ConteudoDoDesafio.tsx`, `Meme.tsx` |
| Tópicos públicos para outros professores                        | `Topicos.tsx` (Biblioteca pública) + `importarTopico` no store       |
| Limite de tempo de áudio / caracteres                           | Sliders em `DialogNovoDesafio.tsx`; aplicados em `TextoSemApagar` e `GravadorAudio` |
| Monitores por sala                                              | Aba Turma (switch) · `regras.podeAvaliar`                            |
| Prazo em dias, reiniciado ao entrar em nova sala                | `store.vincularTopico` · `regras.prazoDoDesafio`                     |
| Sobrescrever XP do desafio                                      | `DialogNovoDesafio` (padrão) e `ConfigDoDesafio` (por sala)          |
| Criar/personalizar emblemas                                     | `SalaDetalhe.tsx` → aba Emblemas                                     |
| Aceitar convites                                                | `components/Convites.tsx`                                            |
| Editar perfil e bio                                             | `pages/Perfil.tsx`                                                   |
| Ver desafios e status por tópico                                | `SalaDetalhe.tsx` → aba Desafios · `CartaoDesafio`                   |
| Responder em áudio ou texto sem apagar                          | `TextoSemApagar.tsx`, `GravadorAudio.tsx`, `DesafioPagina.tsx`       |
| XP concedido pelo sistema                                       | `regras.calcularXp` · `store.avaliarResposta`                        |
| Emblemas/títulos por metas de XP                                | `regras.TITULOS`, `regras.emblemasConquistados`                      |
| Mosaico individual e da turma                                   | `components/Mosaico.tsx` · `regras.blocosDaSala`                     |
| Dashboard do aluno (acertos, tempo de tela…)                    | `pages/aluno/InicioAluno.tsx`                                        |
| Dashboard do professor                                          | `pages/professor/InicioProfessor.tsx`                                |
| Mostrar quem avaliou                                            | `TentativaCard.tsx`, feedbacks do dashboard                          |
| Notificar desafios, correções e resumo diário                   | `store.notificar` · `pages/Notificacoes.tsx`                         |
| Ouvir áudio em até 2x                                           | `components/PlayerAudio.tsx`                                         |
| Declarar uso de IA (−50% XP, mínimo 0)                          | Switch em `DesafioPagina.tsx` · `regras.percentualXp`                |
| Professores veem e corrigem respostas (1–3 + justificativa)     | `pages/Avaliar.tsx`, `pages/Corrigir.tsx`                            |
| Refazer desafios                                                | `regras.podeRefazer` · `DesafioPagina.tsx`                           |
| Controlar número de tentativas (professor e monitor)            | `ConfigDoDesafio` em `DesafioPagina.tsx`                             |
| Compartilhar conquistas                                         | `Perfil.tsx` (Web Share API, com fallback para copiar)               |
| Alunos desafiam colegas                                         | `DialogNovoDesafio` com `salaDoAluno`                                |
| Professor aprova desafios criados por alunos                    | Aba Aprovações + card no dashboard · `store.decidirDesafioDeAluno`   |

### Não funcionais
| Requisito                           | Como foi atendido                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Autenticação segura                 | Validação de senha forte no cadastro; a autenticação real depende do backend (ver próximos passos)         |
| Intuitivo para todos os perfis      | Navegação por papel, estados vazios explicativos, toasts com próximos passos, rótulos com emoji            |
| Evitar competição / sem ranking     | Nenhum ranking; alunos não veem XP dos colegas (lista da turma em ordem alfabética); comparação só consigo mesmo; mosaico coletivo |
| Não punitivo                        | Nota 1 é “🌱 Pode ser melhor”; XP nunca diminui; “prazo encerrado” sem cor de erro; IA declarada sem outras consequências |
| Sem notificações 22h–7h             | `regras.horarioDeEntrega` agenda para as 7h                                                                |
| Mobile-first com interface web      | Barra inferior no celular, sidebar no desktop, grids responsivos, `viewport-fit=cover` e safe areas        |
| Uso consciente / saúde mental       | Gráfico de tempo no app com meta, lembrete de pausa aos 20 min de sessão, mensagens de pausa após enviar   |

---

## 🎨 Design system

**Vibe:** jovem, colorido e acolhedor — gradientes vibrantes, cantos bem arredondados, emoji como linguagem visual e microanimações.

### Cores (tokens em `index.css`, formato OKLCH)
| Token          | Uso                                        | Claro                      |
| -------------- | ------------------------------------------ | -------------------------- |
| `--primary`    | Ações, destaques                           | violeta elétrico           |
| `--accent`     | Realces suaves                             | rosa chiclete              |
| `--xp`         | Tudo que é XP ⚡                            | verde-limão                |
| `bg-brand`     | Botões principais, heróis                  | gradiente violeta → rosa   |
| `text-gradient`| Títulos de impacto                         | violeta → rosa → laranja   |
| `bg-mesh`      | Fundo das páginas                          | brilhos violeta/rosa/limão |

Cada usuário e sala tem uma **cor tema** (`violeta`, `rosa`, `limao`, `ceu`, `laranja`, `menta`) usada em avatares e banners.
O **tema escuro** redefine os mesmos tokens (menu do avatar → Tema escuro), respeitando o sistema por padrão.

Status usam cores fixas **sempre acompanhadas de emoji + texto** (nunca só cor): ✏️ pendente (âmbar), 📨 respondido (céu), ✅ avaliado (esmeralda).

### Tipografia
- **Bricolage Grotesque** — títulos (`font-heading`), personalidade e peso.
- **Geist** — texto corrido e interface.
- **Anton** — texto de meme (`meme-text`, branco com contorno preto).

### Animações
`animate-float` (flutuar), `animate-wave` (onda do áudio), `animate-pop` (peças do mosaico), hover com leve elevação nos cards.

---

## 🧩 Componentes principais

| Componente           | Descrição                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `Meme`               | Três templates: **clássico** (texto em cima/embaixo), **Não × Sim** e **Expectativa × Realidade**. Só CSS + emoji; o texto escala com o tamanho do card (container queries). |
| `PlayerAudio`        | Tocar/pausar, onda animada, velocidades 1–2x, “do início” e transcrição. Toca gravações reais ou lê a transcrição com síntese de voz pt-BR. |
| `GravadorAudio`      | Botão de gravar com pulso, cronômetro, barra de tempo restante, parada automática e regravação.     |
| `TextoSemApagar`     | Textarea “só para frente”, contador de caracteres e barra de progresso do limite.                   |
| `MosaicoTurma` / `MosaicoAluno` | Imagem coletiva com tooltip por aluno e o pedaço individual ampliado.                    |
| `CartaoDesafio`      | Tipo, título, sala, autor (se aluno), prazo, formato de resposta, XP e status.                     |
| `TentativaCard`      | Resposta enviada (texto ou áudio), reinícios, IA, nota, XP, justificativa e avaliador.             |
| `DialogNovoDesafio`  | Criação completa com prévia do meme ao vivo, gravação de áudio, upload de imagem e sliders de limites. Reutilizado no modo “Desafiar colegas”. |
| `GraficoTempoDeTela` | Barras de 7 dias com destaque para hoje, tooltip e linha de meta.                                   |

---

## 💾 Estado e persistência

- **`ProvedorDeDados`** (`lib/store.tsx`) guarda um objeto `Dados` com usuários, salas, tópicos, desafios, respostas, convites e notificações, e expõe ações como `criarSala`, `vincularTopico`, `enviarResposta`, `avaliarResposta`, `decidirDesafioDeAluno`.
- Tudo é salvo no **localStorage** (`explica-ai:dados:v1`); a sessão fica em `explica-ai:sessao:v1` e o tema em `explica-ai:tema`.
- Gravações e imagens enviadas são guardadas como `data:` URL. Se o armazenamento encher, o app continua funcionando em memória.
- **Restaurar dados de exemplo** (menu do avatar) recria o `seed.ts`.

A camada `store` foi pensada para ser trocada por chamadas a uma API sem mexer nas telas: as páginas só usam `useLoja()` e as funções de `regras.ts`.

---

## 🤔 Decisões e interpretações

Alguns pontos do README permitem mais de uma leitura. As escolhas feitas:

1. **“Alunos podem refazer desafios que tiraram 3 uma vez.”** — Implementado como *refazer qualquer desafio avaliado enquanto houver tentativas* (padrão: 2, ou seja, uma nova chance), com o limite controlado por professores e monitores. Isso segue a proposta de “refaz até dominar” e o requisito de controle de tentativas. Para restringir a notas específicas, basta ajustar `podeRefazer` em `regras.ts`.
2. **Penalidade de IA** — interpretada como **−50 pontos percentuais** sobre o percentual da nota (e não metade do XP), já que a regra fala em “XP final não pode ser negativo, sendo 0% o mínimo”.
3. **“Professores aprovam respostas criadas pelos alunos”** — interpretado como aprovar os **desafios** criados por alunos antes de chegarem à turma.
4. **“Mesmas liberdades de um professor”** ao desafiar colegas — o aluno autor pode **avaliar as respostas** do seu desafio. XP (30) e tentativas (1) são fixos para evitar abuso.
5. **Resposta em texto** — além de não apagar, também não é possível colar texto, reforçando “com as próprias palavras”.
6. **Resposta após o prazo** — a primeira resposta fica bloqueada após o prazo (com mensagem gentil); refazer um desafio já avaliado continua possível.
7. **Tempo de tela** — os 7 dias vêm dos dados de exemplo; a sessão atual é contada ao vivo na sidebar e dispara o lembrete de pausa.
8. **Áudios dos professores nos exemplos** — reproduzidos por síntese de voz a partir de roteiros, para o protótipo não depender de arquivos. Gravações feitas no app tocam o áudio real.
9. **Vídeo** — o player é simulado no protótipo (sem arquivo), mas o tipo está completo no modelo de dados e no formulário.

---

## 🛣️ Limitações e próximos passos

- 🔐 **Backend e autenticação real** (hash de senha, sessões com expiração, recuperação de conta). Hoje o login é demonstrativo.
- ☁️ Upload de áudio, imagem e vídeo para um storage, com transcrição automática das respostas em áudio.
- 🔔 Push notifications de verdade, com o agendamento 22h–7h no servidor e o resumo diário via job.
- ⏱️ Tempo de tela medido de verdade (eventos de foco/visibilidade) em vez de dados de exemplo.
- 🧪 Testes automatizados (unitários para `regras.ts`, E2E para os fluxos de responder e avaliar).
- 📦 Code splitting por rota (`React.lazy`) para reduzir o bundle inicial.
- ♿ Auditoria de acessibilidade com leitor de tela e navegação por teclado no campo “sem apagar”.
- 🌐 PWA/instalação no celular e modo offline para responder desafios.

---

Feito com 💜, ☕ e muitos emojis para o **Explica Aí!**
