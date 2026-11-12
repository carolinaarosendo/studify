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

A execução nativa Android/iOS deste tópico ainda não foi repetida.
