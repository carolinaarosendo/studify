# Exclusão de matéria — tópico 19

A lixeira de cada card abre uma confirmação com o nome da matéria e avisa
que todas as tarefas e provas vinculadas, inclusive concluídas, serão apagadas.
Cancelar ou Voltar no Android fecha o diálogo sem chamar o serviço. O teclado
é fechado ao abrir a confirmação. A lista e os totais seguem os snapshots.

A tela chama `removerMateria(materiaId)` do EstudosContext. Ele obtém o uid
autenticado, aguarda `excluirTarefasDaMateria(uid, materiaId)` do serviço da Ana
Clara e só depois chama `excluirMateria(uid, materiaId)`.

Se a primeira etapa falhar, a matéria não é excluída. A operação em duas etapas
não é atômica: se a segunda falhar, as tarefas podem já ter sido removidas e a
matéria permanece para nova tentativa. O diálogo informa essa possibilidade,
mantém o alvo e permite tentar novamente. Durante o envio, bloqueia confirmações
duplicadas, Cancelar e o fechamento por Voltar.

## Verificação em 12/11/2026

- TypeScript e lint dos arquivos alterados passaram.
- Lint completo mantém as duas pendências anteriores de materias/[id].tsx
  (react-hooks/purity) e materias/tarefa-form.tsx (react-hooks/set-state-in-effect).
- Testes locais do contexto verificaram ordem/uid, falha da limpeza impedindo
  excluir a matéria, falha na etapa final, nova tentativa e ausência de login.
- Testes locais da tela verificaram abrir/cancelar sem exclusão, confirmar,
  erro visível, nova tentativa, bloqueio de envio duplicado e bloqueio de
  fechamento durante uma operação pendente. Falhas foram simuladas nesses testes.
- Regressões locais da busca, destinos de detalhe/edição e formulário passaram.

No app completo no Android 16/API 36, Expo Go 58.0.5 e Firebase local demo-studify:

1. Abriu confirmação de Desenvolvimento Mobile; Cancelar manteve quatro
   matérias e cinco tarefas no Firestore.
2. Confirmar removeu a matéria e os três itens vinculados (tarefa pendente,
   prova pendente e tarefa concluída). O banco passou para três matérias e duas
   tarefas, preservando os registros das outras matérias e sem tarefas do alvo.
3. Na busca Android, abriu a confirmação de uma matéria sem tarefas. Voltar
   fechou o diálogo, preservando o resultado filtrado.
4. Confirmar a exclusão dessa matéria sem tarefas funcionou: a busca mostrou
   nenhum resultado, e o banco manteve as outras duas matérias e duas tarefas.

Capturas locais no workspace: outputs/studify-topico-19-android-confirmacao.png,
outputs/studify-topico-19-android-resultado.png e
outputs/studify-topico-19-android-busca.png.
Os dados, contas e regras do Firebase compartilhado não foram alterados.
iOS não foi executado. O teste Android usou contexts e serviços reais;
erros e concorrência foram verificados nos testes controlados locais.
