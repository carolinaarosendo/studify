# Busca por matéria — tópico 17

A tela Matérias filtra pelo nome durante a digitação, usando os dados já
carregados pelo EstudosContext. Não faz novas consultas ao Firebase.

- Aceita parte do nome, ignora maiúsculas, acentos e espaços nas pontas.
- Campo vazio ou só com espaços mantém todas as matérias.
- Limpar busca restaura a lista completa.
- Mostra a quantidade encontrada e distingue busca sem resultados de conta sem matérias.
- Preserva contagens de tarefas e navegação dos cards e do botão +.
- Mantém o campo fora da lista para evitar perda de foco durante a digitação.

## Verificação local em 12/11/2026

TypeScript e ESLint da tela passaram. O lint completo continua apontando as
duas pendências anteriores em `materias/[id].tsx` (react-hooks/purity) e
`materias/tarefa-form.tsx` (react-hooks/set-state-in-effect).

Teste local da tela renderizada por React Native Web com estado controlado:
busca parcial, maiúsculas, acentos compostos/decompostos, espaços, limpar,
nenhum resultado, nenhuma matéria, atualização dos dados durante a busca,
contagens de tarefas, destino dos cards, botão +, carregamento e erro.

Também foi validada uma prévia interativa no navegador com a tela, componentes
e estado React reais, usando três matérias fictícias. Digitar `  MATEMATICA  `
mostrou apenas Matemática com suas duas pendências; `inexistente` mostrou
nenhum resultado; limpar restaurou as três matérias; `dados` mostrou Banco de
Dados, e tocar no card enviou o ID correto ao destino de navegação registrado.
Na prévia, contexto, ícone e roteador foram substituídos; não é um teste completo
do aplicativo conectado ao Firebase. Não foram usados dados de produção.

## Validação Android concluída em 12/11/2026

O aplicativo completo rodou no AVD `Studify_Teste_API36` (Android 16/API 36),
com Expo Go, AuthContext e EstudosContext reais e Firebase local demo-studify.
Foi usada uma configuração fictícia separada para não reaproveitar a sessão
expirada do teste anterior nem apagar os dados do Expo Go.

- Login fictício e carregamento das três matérias pelo Firestore local passaram.
- ` MATEMATICA ` encontrou somente Matemática: espaços, maiúsculas e ausência
  de acento não impediram a correspondência; a contagem zero foi preservada.
- Limpar busca restaurou as três matérias e suas contagens 1, 2 e 0.
- `inexistente` mostrou a mensagem de nenhum resultado e manteve o botão +.
- `dados` encontrou Banco de Dados com uma tarefa pendente.
- Tocar no card filtrado abriu o detalhe real de Banco de Dados, com a tarefa
  correspondente; voltar preservou o texto da busca e o resultado.
- O botão + abriu o formulário de matéria, ainda provisório no tópico 18.

No computador, Firestore usou a porta 18080 porque a porta 8080 estava
indisponível. Encaminhamentos ADB ligaram as portas Android 8080 → host 18080,
9099 → 9099 e 8088 → 8088. O host configurado no app foi 127.0.0.1.
Nenhum dado ou configuração do Firebase compartilhado foi alterado.
Captura local: `outputs/studify-topico-17-android.png` no workspace.
O teste iOS continua não executado.
