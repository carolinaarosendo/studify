# Tela Matérias (#16)

Implementação em `src/app/(tabs)/materias/index.tsx`, usando `useEstudos` e os
componentes e cores já existentes no projeto.

- Lista matérias em cards com nome, professor, dia/horário e cor da disciplina.
- Usa `pendentesDaMateria(id)` do contexto para mostrar a quantidade de tarefas
  pendentes, com textos diferentes para zero, uma ou várias pendências.
- Tocar no card abre o detalhe, passando o ID da matéria.
- O botão flutuante + abre a rota `materia-form`.
- Apresenta carregamento, erro ou estado vazio conforme o estado do contexto.
- Reserva espaço no final da lista para o botão não cobrir o último card.

Não inclui busca (#17), formulário (#18) ou confirmação de exclusão (#19).
As rotas de formulário e detalhe já existem, mas suas implementações continuam
com as respectivas tarefas/responsáveis.

## Verificação em 11/11/2026

Em uma prévia web isolada, renderizando a tela e os componentes React Native Web
com dados de teste, foram verificados: lista com contagens zero/uma/duas,
estado vazio, carregamento, erro, mudança dos dados, destino do botão + e ID
enviado ao abrir um card. A lista e o estado vazio também foram inspecionados
visualmente. Os ícones foram substituídos somente no ambiente dessa prévia.

ESLint da tela passou. O lint completo aponta seis ocorrências preexistentes
de acesso a refs na tela `boas-vindas.tsx`. A checagem TypeScript aponta quatro erros
preexistentes de tipo de cor em `src/app/(tabs)/_layout.tsx`; não aponta erros
na tela Matérias. A validação final no aplicativo em aparelho/emulador, com o
login e dados reais do contexto, permanece necessária antes de concluir a tarefa.
