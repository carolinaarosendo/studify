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

ESLint da tela passou. Antes das correções descritas abaixo, o lint completo
apontava seis ocorrências preexistentes de acesso a refs em `boas-vindas.tsx`,
e o TypeScript apontava quatro erros de tipo de cor em `(tabs)/_layout.tsx`.

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
do Firestore durante o fluxo integrado. Nessa primeira etapa, Android/iOS ainda
não tinham sido testados; a validação Android posterior está registrada abaixo.
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

## Correções das verificações e tentativa Android em 11/11/2026

As cores dos ícones das abas agora usam a cor do tema como alternativa quando o
valor recebido não é uma string. As duas instâncias de Animated.Value da tela
de boas-vindas usam inicialização preguiçosa com useState, preservando os objetos
entre renderizações sem acessar ref.current durante a renderização.

Após os ajustes, `tsc --noEmit` e ESLint de `src` passaram sem erros.

O Android Studio foi aberto e houve tentativas de iniciar o AVD existente
`StudyFlow_API36` e um novo AVD de teste `Studify_Teste_API36`, com Android 16/API36
já instalado. O aparelho antigo não foi apagado. O Studio informou que o perfil
de hardware antigo não estava mais disponível. Ambos os aparelhos encerraram
antes de disponibilizar um dispositivo Android no ADB.

O lançamento pela linha de comando apontou indisponibilidade de aceleração
Hyper-V/WHPX. Pelo Studio, o registro mostrou falha ao carregar opengl32sw,
tentativa de fallback para OpenGL do sistema e encerramento inesperado do
Android Emulator 37.2.13. A tentativa com o novo aparelho e GPU host também
falhou. Não foram alterados recursos de virtualização ou segurança do Windows.

Portanto, o Studify não chegou a executar no Android: a validação nativa segue
pendente de reparo do ambiente de emulação ou uso de um aparelho físico.

### Diagnóstico adicional em 12/11/2026

O Metro compilou o aplicativo para Android: `Android Bundled` com 1512 módulos.
Também foi preparado o Expo Go 58.0.5 compatível com o SDK 58.

A consulta direta à API Windows Hypervisor Platform (`WHvGetCapability`)
retornou `0x80070005` (acesso negado) no processo de diagnóstico. Isso impede
concluir, com base nessa execução, que os recursos de virtualização estejam
desativados no computador do usuário.

Foram tentadas inicializações isoladas sem janela gráfica, com SwiftShader e
sem aceleração de hardware. O emulador expôs um dispositivo offline, mas não
chegou a disponibilizar o Android para o ADB. Uma cópia separada da versão
oficial 36.6.11 foi baixada, conferida com o SHA-256 publicado e testada, com o
mesmo resultado. A instalação original do SDK não foi substituída.

A tentativa de iniciar o emulador instalado pelo desktop ficou dependente da
aprovação de abertura do Explorador, que expirou. Não foi possível concluir
o teste de execução Android. Compilação Android bem-sucedida não equivale a
execução e navegação validadas em Android.

## Validação Android concluída em 12/11/2026

Na sessão posterior, o aparelho `Studify_Teste_API36` ficou disponível no ADB,
com Android 16 e `sys.boot_completed=1`. Foi instalado o Expo Go oficial 58.0.5,
compatível com o SDK 58 do projeto. Não é necessário trocar o SDK do usuário
para reproduzir esta validação.

O projeto rodou no Android nativo usando AuthContext, EstudosContext e os
emuladores Firebase locais (`demo-studify`). No Android, o endereço do host
do Firebase foi `10.0.2.2`, com portas 9099 e 8080. O Metro foi acessado por
encaminhamento ADB da porta 8088.

Resultados verificados no Android:

- Os três slides de boas-vindas e suas transições funcionaram após a correção.
- Login com conta fictícia abriu as abas, sem usar autenticação de produção.
- Matérias mostrou estado vazio antes de receber dados.
- Três matérias criadas pelo SDK local apareceram automaticamente com contagens
  de duas, uma e nenhuma pendência, sem contar tarefas já concluídas.
- Concluir uma tarefa e editar uma matéria pelo banco/serviço local atualizou
  o nome e a contagem na tela sem recarregar.
- Tocar no card abriu Detalhe da matéria; o botão Voltar retornou à lista.
- Tocar no + abriu a rota provisória Formulário de matéria, sem implementar #18.
- Depois de encerrar o Expo Go e reabrir o endereço raiz do projeto, o usuário
  continuou logado. Ao abrir Matérias, os dados foram recuperados normalmente.
- A lista com 12 matérias rolou até o último card. O nome longo quebrou em linhas
  e não houve sobreposição pelo botão +: o card terminava em y=1935 e o botão
  começava em y=2019 na captura de 1080 × 2400.

As verificações de atualização, navegação e rolagem também foram conferidas
na árvore de acessibilidade Android via UI Automator. Foram salvas capturas
da lista e do fim da rolagem na pasta de resultados da conversa.

O teste nativo do #16 passou neste emulador Android. iOS não foi testado. O
teste não resolve a pendência separada das regras de segurança do Firestore,
nem substitui revisão do PR e integração na develop.
