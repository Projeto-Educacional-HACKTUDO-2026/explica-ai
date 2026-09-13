# Explica Aí!

> Aprender explicando: o celular deixa de ser distração e vira ferramenta de aprendizagem ativa.

## O desafio

> Desenvolver soluções inovadoras que permitam a utilização consciente dos smartphones nas escolas, integrando tecnologia, metodologias educacionais e estratégias de promoção da saúde mental.

## A solução

O **Explica Aí!** transforma o celular de fonte de distração em ferramenta de aprendizagem ativa. O app se baseia na **técnica de Feynman**: só entendemos de verdade aquilo que conseguimos explicar com palavras simples. O aluno explica o conteúdo com as próprias palavras, recebe feedback e refaz até dominar o assunto.

- **Uso consciente do celular:** sessões curtas, notificações controladas e nenhuma notificação à noite.
- **Bem-estar:** progresso sem ranking tóxico. O aluno compete apenas com a sua versão de ontem.
- **Apoio ao professor:** o app revela quais conceitos a turma ainda não entendeu.

### Como funciona

1. O professor cria um desafio dentro de um tópico e vincula o tópico a uma sala.
2. O aluno responde explicando o conceito com as próprias palavras, em áudio ou texto.
3. O professor ou um monitor avalia a resposta e pode justificar a avaliação.
4. O aluno ganha XP, emblemas e novas peças do seu mosaico.
5. Se a avaliação for *Pode ser melhor*, o aluno pode refazer o desafio.

## Perfis de usuário

| Perfil | Responsabilidades |
|---|---|
| **Professor** | Cria salas, tópicos, desafios e emblemas; convida alunos; avalia respostas; acompanha a turma. |
| **Monitor** | Aluno eleito pelo professor em uma sala. Avalia respostas e gerencia os desafios dessa sala, como um professor. |
| **Aluno** | Responde desafios, acompanha a própria evolução e pode criar desafios para os colegas. |

## Conceitos

| Termo | Definição |
|---|---|
| **Sala** | Turma formada por um professor e seus alunos. |
| **Tópico** | Assunto que agrupa desafios. Um tópico pode ser vinculado a várias salas. |
| **Desafio** | Tarefa em que o aluno explica um conceito. O enunciado pode ter texto, imagens, áudio e vídeo. |
| **Resposta** | Explicação do aluno para um desafio, em áudio ou texto. |
| **XP** | Pontos de experiência ganhos com as respostas avaliadas. |
| **Mosaico** | Imagem que o aluno revela aos poucos conforme ganha XP. Cada mosaico é uma peça do mosaico da turma. |

## Requisitos funcionais

### Contas e perfis

- **RF01** Ao criar a conta, o usuário escolhe o perfil: professor ou aluno.
- **RF02** O aluno pode editar seu perfil e sua bio.

### Salas

- **RF03** O professor cria salas.
- **RF04** O professor convida alunos para participar de uma sala.
- **RF05** O aluno aceita o convite para entrar em uma sala.
- **RF06** O professor pode eleger alunos monitores em cada sala. Monitores avaliam respostas e gerenciam os desafios da sala, como um professor.

### Tópicos e desafios

- **RF07** O professor cria tópicos.
- **RF08** O professor vincula tópicos a uma sala.
- **RF09** O professor cria desafios dentro de um tópico. O enunciado pode conter texto, imagens, áudio e vídeo.
- **RF10** O professor define o prazo de cada desafio em dias. A contagem recomeça sempre que o desafio é adicionado a uma nova sala.
- **RF11** O professor define o tempo máximo de áudio e/ou o limite de caracteres da resposta.
- **RF12** O professor e os monitores definem quantas vezes o aluno pode responder um desafio.
- **RF13** O professor pode aumentar ou diminuir o XP padrão de um desafio.
- **RF14** O professor pode publicar tópicos com seus desafios em uma biblioteca pública e usar tópicos publicados por outros professores.

### Respostas

- **RF15** O aluno visualiza os desafios de cada tópico da sala e o status de cada um (ver [Status de um desafio](#status-de-um-desafio)).
- **RF16** O aluno responde em áudio ou em texto corrido. No texto, não é possível apagar caracteres: o aluno só pode recomeçar a resposta do zero.
- **RF17** Ao enviar a resposta, o aluno informa se usou IA generativa para produzi-la.
- **RF18** Por padrão, o aluno pode refazer uma vez um desafio avaliado com grau 1 (*Pode ser melhor*). Esse limite pode ser alterado conforme o RF12.
- **RF19** Os áudios podem ser reproduzidos em até 2x de velocidade.

### Avaliação

- **RF20** O professor e os monitores visualizam as respostas dos alunos da sala.
- **RF21** O professor e os monitores avaliam as respostas em uma escala de 3 graus (ver [Regras de XP](#regras-de-xp)).
- **RF22** Quem avalia pode adicionar um texto justificando a avaliação.
- **RF23** O aluno vê quem avaliou sua resposta.

### XP, emblemas e mosaico

- **RF24** O sistema concede XP ao aluno quando a resposta é avaliada, conforme as [Regras de XP](#regras-de-xp).
- **RF25** O sistema concede emblemas ou títulos aos alunos que atingem metas de XP.
- **RF26** O professor pode criar ou personalizar emblemas dentro de uma sala.
- **RF27** O sistema monta aos poucos o mosaico do aluno com base no XP atual. Cada mosaico é uma peça do mosaico da turma, que fica completo quando todos os alunos atingem o XP máximo da sala.

### Interação entre alunos

- **RF28** O aluno pode compartilhar suas conquistas.
- **RF29** O aluno pode criar desafios para os colegas da sala, com as mesmas opções de um professor.
- **RF30** Desafios criados por alunos só ficam disponíveis após a aprovação do professor.

### Dashboards

- **RF31** A página inicial do aluno mostra um dashboard com as avaliações recebidas por grau, o tempo de uso do aplicativo e outras informações de progresso.
- **RF32** A página inicial do professor mostra um dashboard com informações sobre alunos, salas e avaliações das respostas.

### Notificações

- **RF33** O aluno é notificado quando um novo desafio é publicado.
- **RF34** O aluno é notificado quando sua resposta é avaliada.
- **RF35** O professor e os monitores recebem, uma vez por dia, um resumo das novas respostas dos alunos.

## Status de um desafio

| Status | Significado |
|---|---|
| **Pendente** | O aluno ainda não respondeu. |
| **Respondido** | A resposta foi enviada e aguarda avaliação. |
| **Avaliado** | A resposta foi avaliada por um professor ou monitor. |
| **Refazer disponível** | A resposta recebeu grau 1 e o aluno ainda tem tentativas. |

## Regras de XP

### Escala de avaliação

| Grau | Avaliação | XP recebido |
|---|---|---|
| 3 | Excelente resposta | 100% |
| 2 | Boa resposta | 75% |
| 1 | Pode ser melhor | 20% |

### Cálculo

```
XP final = XP do desafio × percentual da avaliação × fator de IA
```

- **XP do desafio:** valor padrão ou valor definido pelo professor (RF13). Nunca é negativo.
- **Fator de IA:** 0,5 se o aluno declarou uso de IA generativa (−50%); 1 caso contrário.
- O resultado é arredondado para baixo e nunca fica abaixo de 0.
- Se o aluno refizer o desafio, vale o maior XP entre as tentativas.

**Exemplo** com um desafio de 100 XP:

| Avaliação | Sem IA | Com IA |
|---|---|---|
| Excelente resposta | 100 XP | 50 XP |
| Boa resposta | 75 XP | 37 XP |
| Pode ser melhor | 20 XP | 10 XP |

## Requisitos não funcionais

- **RNF01 — Segurança:** autenticação segura, com senhas armazenadas com hash forte (como Argon2 ou bcrypt), sessões com expiração e permissões por perfil (professor, monitor e aluno).
- **RNF02 — Usabilidade:** navegação intuitiva e fácil para todos os perfis de usuário.
- **RNF03 — Crescimento individual:** o app evita a competição entre alunos e valoriza o crescimento de cada um, no seu próprio ritmo.
- **RNF04 — Não punitivo:** o sistema nunca retira XP, emblemas ou peças do mosaico já conquistados.
- **RNF05 — Horário de silêncio:** nenhuma notificação é enviada entre 22h e 7h (horário local do usuário). As notificações geradas nesse período são entregues a partir das 7h.
- **RNF06 — Mobile-first:** interface web responsiva, projetada primeiro para o celular.
- **RNF07 — Privacidade:** tratamento de dados conforme a LGPD, com cuidado especial por envolver menores de idade.

## Stack

| Camada | Tecnologias |
|---|---|
| Front-end | [React](https://react.dev) e [shadcn/ui](https://ui.shadcn.com) (Tailwind CSS) |
