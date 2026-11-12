# Formulário de matéria — tópico 18

`materia-form.tsx` cria matérias pelo botão + e edita pelo botão de lápis dos
cards. A edição recebe `materiaId` nos parâmetros de navegação.

- Nome obrigatório; professor, dia e horário opcionais.
- Cor padrão `DEFAULT_SUBJECT_COLOR`, com seis opções. A edição preserva cores
  existentes mesmo quando não pertencem à paleta.
- Dia escolhido por opções, incluindo Não informar. Valores antigos também
  são preservados até a pessoa escolher outro dia.
- Horário opcional em HH:MM, de 00:00 a 23:59. Espaços nas pontas são removidos.
- Usa adicionarMateria/atualizarMateria do EstudosContext e o serviço existente.
- A edição aguarda os dados; matéria inexistente mostra uma mensagem e não
  vira um cadastro novo. Atualizações do contexto não sobrescrevem a digitação.
- Durante o envio, bloqueia campos, botões e submissões duplicadas. Erros mantêm
  os dados para tentar novamente. Ao salvar volta à tela anterior; Cancelar não grava.
- Área de detalhes do card e botão de edição são alvos separados, sem botões
  aninhados. Não altera a tela de tarefas da Ana Clara.
- Exclusão e limpeza das tarefas vinculadas continuam no tópico 19.

## Verificações em 12/11/2026

TypeScript e ESLint dos dois arquivos alterados passaram. O lint completo
mantém as duas pendências anteriores em `materias/[id].tsx` (react-hooks/purity)
e `materias/tarefa-form.tsx` (react-hooks/set-state-in-effect).

Testes locais com estado e serviços controlados verificaram: nome vazio e só
espaços, horário inválido/válido, remoção de espaços, cor padrão, criação,
edição com ID e cor preservados, snapshot sem perder digitação, falha ao salvar
sem navegar ou perder os campos, bloqueio de envio duplicado e estado de
carregamento/matéria inexistente. A regressão da busca do tópico 17 passou,
incluindo os destinos distintos de abrir detalhes e editar.

No Android 16/API 36, AVD Studify_Teste_API36, Expo Go 58.0.5 e Firebase local:

1. O + abriu Nova matéria; salvar sem nome mostrou a validação.
2. Cadastrar apenas Materia Android 18 criou uma matéria com cor padrão e
   campos opcionais vazios, atualizando a lista de três para quatro registros.
3. O lápis abriu Editar matéria com os dados preenchidos.
4. Alterados nome, professor, cor verde e terça-feira; 25:99 foi rejeitado.
5. Corrigir para 19:30 e salvar atualizou a lista sem duplicar a matéria.
6. Reabrir confirmou os campos persistidos. Uma alteração de nome seguida de
   Cancelar não foi gravada.
7. Consulta ao Firestore local confirmou exatamente quatro matérias e o
   documento com nome Materia Android 18 editada, Prof Teste, #2E9E5B,
   Terça-feira e 19:30.
8. Após o ajuste do espaço final, rolar deixou Salvar e Cancelar inteiros
   acima da barra de abas; os nomes acessíveis das cores e seleção foram revistos.

As capturas ficam em outputs/studify-topico-18-android-formulario.png,
outputs/studify-topico-18-android-lista.png e
outputs/studify-topico-18-android-rolagem.png no workspace local.
Os testes de falha e envio concorrente foram controlados, não induzidos no Android.
AuthContext, EstudosContext e serviços reais foram usados no teste Android.
Firebase demo-studify: Auth 9099, Firestore host 18080 encaminhado para porta
8080 do Android por ADB; Metro 8088. Nenhum dado do Firebase compartilhado foi
alterado. iOS não foi executado.
