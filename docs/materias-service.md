# Serviço de matérias (#15)

Arquivo: `src/services/materiasService.ts` (TypeScript, como o restante do projeto).

Todas as funções recebem o `uid` do usuário autenticado e usam
`users/{uid}/materias`. As regras do Firestore devem restringir o acesso ao dono;
receber um uid no cliente não substitui essa autorização.

```ts
import {
  criarMateria, listarMaterias, editarMateria, excluirMateria,
} from '@/services/materiasService';

const dados = {
  nome: 'Desenvolvimento Mobile',
  professor: 'Professor',
  cor: '#6366F1',
  diaSemana: 'Segunda-feira',
  horario: '19:00',
};

// uid vem do usuário logado no AuthContext.
const materia = await criarMateria(uid, dados); // retorna dados + id gerado
const materias = await listarMaterias(uid); // [] quando não há matérias
await editarMateria(uid, materia.id, { ...dados, horario: '20:00' });
await excluirMateria(uid, materia.id);
```

`editarMateria` recebe todos os cinco campos e retorna `Promise<void>`;
não cria uma matéria inexistente. `excluirMateria` retorna `Promise<void>`
e exclui somente o documento da matéria, sem excluir tarefas vinculadas.
A decisão sobre essas tarefas fica para a integração com o serviço de tarefas.

O nome é obrigatório; os cinco campos devem ser strings. Espaços nas extremidades
são removidos. IDs vazios ou contendo `/` são recusados. Somente os cinco campos
do modelo são gravados. Erros do Firebase são propagados para a tela/contexto
tratar com o feedback do app. A listagem não promete uma ordem específica.

O serviço não depende do EstudosContext e não implementa sincronização em tempo
real, telas ou autenticação. Essas integrações continuam com seus responsáveis.

## Validação de integração pendente

Com usuário de teste autenticado, executar criar, listar, editar e excluir e
conferir os documentos no Firestore. Confirmar também que as regras negam
acesso aos dados de outro usuário. Não marcar a tarefa como integrada antes
da validação e do PR revisado para `develop`.
