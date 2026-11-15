
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';

import type { Tarefa } from '../types';
import { db } from './firebase';

export type DadosTarefa = Omit<Tarefa, 'id' | 'concluida' | 'notificacaoId'>;

function validarId(valor: string, campo: string): void {
  if (
    typeof valor !== 'string' ||
    !valor.trim() ||
    valor.includes('/')
  ) {
    throw new Error(`${campo} inválido.`);
  }
}

function tarefasDoUsuario(uid: string) {
  validarId(uid, 'ID do usuário');
  return collection(db, 'users', uid, 'tarefas');
}

function referenciaTarefa(uid: string, tarefaId: string) {
  validarId(tarefaId, 'ID da tarefa');
  return doc(tarefasDoUsuario(uid), tarefaId);
}

function prepararDados(dados: DadosTarefa) {
  validarId(dados?.materiaId, 'ID da matéria');

  if (typeof dados.titulo !== 'string' || !dados.titulo.trim()) {
    throw new Error('O título é obrigatório.');
  }

  if (dados.tipo !== 'tarefa' && dados.tipo !== 'prova') {
    throw new Error('Tipo inválido.');
  }

  if (
    !(dados.prazo instanceof Date) ||
    Number.isNaN(dados.prazo.getTime())
  ) {
    throw new Error('Data inválida.');
  }

  return {
    materiaId: dados.materiaId,
    titulo: dados.titulo.trim(),
    tipo: dados.tipo,
    prazo: Timestamp.fromDate(dados.prazo),
    observacao: (dados.observacao ?? '').trim(),
  };
}

function normalizarTitulo(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function verificarDuplicidade(
  uid: string,
  dados: DadosTarefa,
  tarefaIdAtual?: string,
): Promise<void> {
  const consulta = query(
    tarefasDoUsuario(uid),
    where('materiaId', '==', dados.materiaId),
  );

  const resultado = await getDocs(consulta);

  const tituloNovo = normalizarTitulo(dados.titulo);
  const prazoNovo = dados.prazo.getTime();

  const duplicada = resultado.docs.some((documento) => {
    if (documento.id === tarefaIdAtual) {
      return false;
    }

    const existente = documento.data();

    return (
      normalizarTitulo(existente.titulo) === tituloNovo &&
      existente.tipo === dados.tipo &&
      existente.materiaId === dados.materiaId &&
      existente.prazo instanceof Timestamp &&
      existente.prazo.toMillis() === prazoNovo
    );
  });

  if (duplicada) {
    throw new Error(
      'Já existe uma tarefa ou prova com esse título, matéria, data e horário.',
    );
  }
}

function paraTarefa(id: string, d: DocumentData): Tarefa {
  return {
    id,
    materiaId: d.materiaId,
    titulo: d.titulo,
    tipo: d.tipo,
    prazo: (d.prazo as Timestamp).toDate(),
    observacao: d.observacao ?? '',
    concluida: Boolean(d.concluida),
    notificacaoId: d.notificacaoId ?? undefined,
  };
}

export async function criarTarefa(
  uid: string,
  dados: DadosTarefa,
): Promise<Tarefa> {
  const referencia = tarefasDoUsuario(uid);
  const preparados = prepararDados(dados);

  await verificarDuplicidade(uid, dados);

  const documento = await addDoc(referencia, {
    ...preparados,
    concluida: false,
  });

  return {
    id: documento.id,
    materiaId: preparados.materiaId,
    titulo: preparados.titulo,
    tipo: preparados.tipo,
    prazo: dados.prazo,
    observacao: preparados.observacao,
    concluida: false,
  };
}

export async function listarPorMateria(
  uid: string,
  materiaId: string,
): Promise<Tarefa[]> {
  validarId(materiaId, 'ID da matéria');

  const consulta = query(
    tarefasDoUsuario(uid),
    where('materiaId', '==', materiaId),
  );

  const resultado = await getDocs(consulta);

  return resultado.docs
    .map((d) => paraTarefa(d.id, d.data()))
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());
}

export async function listarTarefas(uid: string): Promise<Tarefa[]> {
  const resultado = await getDocs(tarefasDoUsuario(uid));

  return resultado.docs
    .map((d) => paraTarefa(d.id, d.data()))
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());
}

export async function editarTarefa(
  uid: string,
  tarefaId: string,
  dados: DadosTarefa,
): Promise<void> {
  const referencia = referenciaTarefa(uid, tarefaId);
  const preparados = prepararDados(dados);

  await verificarDuplicidade(uid, dados, tarefaId);

  await updateDoc(referencia, preparados);
}

export async function concluirTarefa(
  uid: string,
  tarefaId: string,
  concluida = true,
): Promise<void> {
  await updateDoc(referenciaTarefa(uid, tarefaId), { concluida });
}

export async function excluirTarefa(
  uid: string,
  tarefaId: string,
): Promise<void> {
  await deleteDoc(referenciaTarefa(uid, tarefaId));
}

export async function excluirTarefasDaMateria(
  uid: string,
  materiaId: string,
): Promise<void> {
  validarId(materiaId, 'ID da matéria');

  const consulta = query(
    tarefasDoUsuario(uid),
    where('materiaId', '==', materiaId),
  );

  const resultado = await getDocs(consulta);
  const lote = writeBatch(db);

  resultado.docs.forEach((d) => lote.delete(d.ref));

  await lote.commit();
}
