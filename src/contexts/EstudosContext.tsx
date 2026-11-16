import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import {
  criarMateria,
  editarMateria,
  excluirMateria,
  type DadosMateria,
} from '@/services/materiasService';
import type { Materia, Tarefa } from '@/types';
import { excluirTarefasDaMateria } from '@/services/tarefasService';

// ---------- estado ----------

type EstudosState = {
  materias: Materia[];
  tarefas: Tarefa[];
  carregandoMaterias: boolean;
  carregandoTarefas: boolean;
  erro: string | null;
};

type EstudosAction =
  | { type: 'MATERIAS_CARREGADAS'; payload: Materia[] }
  | { type: 'TAREFAS_CARREGADAS'; payload: Tarefa[] }
  | { type: 'ERRO'; payload: string }
  | { type: 'LIMPAR' };

const estadoInicial: EstudosState = {
  materias: [],
  tarefas: [],
  carregandoMaterias: true,
  carregandoTarefas: true,
  erro: null,
};

function estudosReducer(state: EstudosState, action: EstudosAction): EstudosState {
  switch (action.type) {
    case 'MATERIAS_CARREGADAS':
      return { ...state, materias: action.payload, carregandoMaterias: false, erro: null };
    case 'TAREFAS_CARREGADAS':
      return { ...state, tarefas: action.payload, carregandoTarefas: false, erro: null };
    case 'ERRO':
      return { ...state, erro: action.payload, carregandoMaterias: false, carregandoTarefas: false };
    case 'LIMPAR':
      return { ...estadoInicial, carregandoMaterias: false, carregandoTarefas: false };
    default:
      return state;
  }
}

// ---------- conversão dos documentos do Firestore ----------

function paraMateria(documento: QueryDocumentSnapshot<DocumentData>): Materia {
  const dados = documento.data();
  return {
    id: documento.id,
    nome: dados.nome ?? '',
    professor: dados.professor ?? '',
    cor: dados.cor ?? '',
    diaSemana: dados.diaSemana ?? '',
    horario: dados.horario ?? '',
  };
}

// O Firestore devolve datas como Timestamp; aqui viram Date de novo.
function paraData(valor: unknown): Date {
  if (valor && typeof (valor as { toDate?: unknown }).toDate === 'function') {
    return (valor as { toDate: () => Date }).toDate();
  }
  return new Date(valor as string | number);
}

function paraTarefa(documento: QueryDocumentSnapshot<DocumentData>): Tarefa {
  const dados = documento.data();
  return {
    id: documento.id,
    titulo: dados.titulo ?? '',
    tipo: dados.tipo === 'prova' ? 'prova' : 'tarefa',
    prazo: paraData(dados.prazo),
    observacao: dados.observacao ?? undefined,
    concluida: Boolean(dados.concluida),
    materiaId: dados.materiaId ?? '',
    notificacaoId: dados.notificacaoId ?? undefined,
  };
}

function mensagemDeErro(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code;
  if (codigo === 'permission-denied') return 'Você não tem permissão para acessar esses dados.';
  if (codigo === 'unavailable') return 'Sem conexão com o servidor. Tente novamente.';
  return 'Não foi possível carregar seus dados.';
}

// ---------- contexto ----------

export type EstudosContextData = {
  // dados
  materias: Materia[];
  tarefas: Tarefa[];
  carregando: boolean;
  erro: string | null;

  // consultas prontas para as telas
  buscarMateria: (materiaId: string) => Materia | undefined;
  tarefasDaMateria: (materiaId: string) => Tarefa[];
  pendentesDaMateria: (materiaId: string) => number;
  tarefasPendentes: Tarefa[];
  tarefasConcluidas: Tarefa[];
  proximasProvas: Tarefa[];

  // ações de matéria (usam o materiasService do Alexandre)
  adicionarMateria: (dados: DadosMateria) => Promise<Materia>;
  atualizarMateria: (materiaId: string, dados: DadosMateria) => Promise<void>;
  removerMateria: (materiaId: string) => Promise<void>;
};

export const EstudosContext = createContext<EstudosContextData | undefined>(undefined);

export function EstudosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(estudosReducer, estadoInicial);
  const uid = user?.uid;

  // escuta matérias e tarefas do usuário logado em tempo real
  useEffect(() => {
    if (!uid) {
      dispatch({ type: 'LIMPAR' });
      return;
    }

    const pararMaterias = onSnapshot(
      query(collection(db, 'users', uid, 'materias'), orderBy('nome')),
      (resultado) => dispatch({ type: 'MATERIAS_CARREGADAS', payload: resultado.docs.map(paraMateria) }),
      (erro) => dispatch({ type: 'ERRO', payload: mensagemDeErro(erro) }),
    );

    const pararTarefas = onSnapshot(
      query(collection(db, 'users', uid, 'tarefas'), orderBy('prazo')),
      (resultado) => dispatch({ type: 'TAREFAS_CARREGADAS', payload: resultado.docs.map(paraTarefa) }),
      (erro) => dispatch({ type: 'ERRO', payload: mensagemDeErro(erro) }),
    );

    // ao sair da conta (ou trocar de usuário), para de escutar
    return () => {
      pararMaterias();
      pararTarefas();
    };
  }, [uid]);

  const exigirUid = useCallback(() => {
    if (!uid) throw new Error('Faça login para continuar.');
    return uid;
  }, [uid]);

  const adicionarMateria = useCallback(
    (dados: DadosMateria) => criarMateria(exigirUid(), dados),
    [exigirUid],
  );
  const atualizarMateria = useCallback(
    (materiaId: string, dados: DadosMateria) => editarMateria(exigirUid(), materiaId, dados),
    [exigirUid],
  );
  const removerMateria = useCallback(
    async (materiaId: string) => {
      const usuarioId = exigirUid();
      // Se a limpeza falhar, a matéria permanece para permitir nova tentativa.
      await excluirTarefasDaMateria(usuarioId, materiaId);
      await excluirMateria(usuarioId, materiaId);
    },
    [exigirUid],
  );

  const value = useMemo<EstudosContextData>(() => {
    const agora = new Date();
    const tarefasPendentes = state.tarefas.filter((t) => !t.concluida);
    return {
      materias: state.materias,
      tarefas: state.tarefas,
      carregando: state.carregandoMaterias || state.carregandoTarefas,
      erro: state.erro,

      buscarMateria: (materiaId) => state.materias.find((m) => m.id === materiaId),
      tarefasDaMateria: (materiaId) => state.tarefas.filter((t) => t.materiaId === materiaId),
      pendentesDaMateria: (materiaId) =>
        tarefasPendentes.filter((t) => t.materiaId === materiaId).length,
      tarefasPendentes,
      tarefasConcluidas: state.tarefas.filter((t) => t.concluida),
      proximasProvas: tarefasPendentes.filter((t) => t.tipo === 'prova' && t.prazo >= agora),

      adicionarMateria,
      atualizarMateria,
      removerMateria,
    };
  }, [state, adicionarMateria, atualizarMateria, removerMateria]);

  return <EstudosContext.Provider value={value}>{children}</EstudosContext.Provider>;
}
