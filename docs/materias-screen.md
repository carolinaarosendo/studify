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
na tela Matérias.

## Integração local validada em 11/11/2026

O aplicativo completo foi iniciado pelo Expo na versão web, conectado aos
emuladores Auth e Firestore do projeto fictício `demo-studify`. Foram usados o
AuthContext e o EstudosContext reais, sem substituir seus dados por mocks.

Resultados confirmados pela interface:

- Boas-vindas → login com conta fictícia → abas → Matérias.
- Estado vazio antes de cadastrar matérias no emulador.
- Matérias criadas pelo SDK/serviço local apareceram na tela sem recarregar.
- Cards exibiram corretamente zero, uma e duas pendências; tarefas concluídas
  não entraram na contagem.
- Concluir uma tarefa no emulador mudou a contagem de duas para uma sem recarregar.
- Editar o nome pelo serviço atualizou o card e sua posição na lista ordenada.
- Tocar no card abriu `/materias/{id}` com o ID do documento correto.
- O botão + abriu `/materias/materia-form`; as telas de destino continuam
  provisórias e não são entregas do #16.
- Recarregar preservou a sessão de login e voltou a carregar os dados locais.
- Em viewport de 390 × 844, a lista com 12 matérias rolou até o último card,
  um nome longo quebrou em linhas e o botão + não cobriu seu conteúdo.

Nenhum usuário ou documento foi criado no projeto Firebase real. O estado de
erro foi verificado na prévia isolada descrita acima; não houve falha de acesso
do Firestore durante o fluxo integrado. Android/iOS ainda não foram testados.
As regras permissivas reproduzidas no emulador continuam sendo uma pendência
separada de segurança; estes testes de tela não comprovam isolamento entre contas.

### Conexão opcional com emuladores

`src/services/firebase.ts` aceita `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true`
somente em desenvolvimento e exige um projectId começando por `demo-`.
As portas são 9099 para Auth e 8080 para Firestore. O host padrão é `127.0.0.1`,
configurável por `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST`.

Para reproduzir, iniciar os dois emuladores com o mesmo projeto `demo-studify`
e iniciar o Expo com configurações fictícias do Firebase (apiKey `fake-api-key`,
projectId `demo-studify`, authDomain `demo-studify.firebaseapp.com`, appId
`demo-studify-web`) e a opção acima habilitada. Criar a conta e os dados somente
nos emuladores. Sem essa opção, a configuração normal do aplicativo é preservada.
