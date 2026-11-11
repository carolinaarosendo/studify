import {
  addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp,
  updateDoc, where, writeBatch, type DocumentData,
} from 'firebase/firestore';

import type { Tarefa } from '../types';
import { db } from './firebase';

// Campos que o formulário (#23) preenche; id, concluida e notificacaoId não vêm do formulário.
export type DadosTarefa = Omit<Tarefa, 'id' | 'concluida' | 'notificacaoId'>;

function validarId(valor: string, campo: string): void {
  if (typeof valor !== 'string' || !valor.trim() || valor.includes('/')) {
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

// Valida e monta apenas os campos do formulário (prazo vira Timestamp).
// A regra "prazo no passado" fica no formulário, para permitir editar tarefas antigas.
function prepararDados(dados: DadosTarefa) {
  validarId(dados?.materiaId, 'ID da matéria');
  if (typeof dados.titulo !== 'string' || !dados.titulo.trim()) {
    throw new Error('O título é obrigatório.');
  }
  if (dados.tipo !== 'tarefa' && dados.tipo !== 'prova') {
    throw new Error('Tipo inválido.');
  }
  if (!(dados.prazo instanceof Date) || Number.isNaN(dados.prazo.getTime())) {
    throw new Error('Data inválida.');
  }
  return {
    materiaId: dados.materiaId,
    titulo: dados.titulo.trim(),
    tipo: dados.tipo,
    prazo: Timestamp.fromDate(dados.prazo),
    observacao: (dados.observacao ?? '').trim(), // Firestore não aceita undefined
  };
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

export async function criarTarefa(uid: string, dados: DadosTarefa): Promise<Tarefa> {
  const referencia = tarefasDoUsuario(uid);
  const preparados = prepararDados(dados);
  const documento = await addDoc(referencia, { ...preparados, concluida: false });
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

export async function listarPorMateria(uid: string, materiaId: string): Promise<Tarefa[]> {
  validarId(materiaId, 'ID da matéria');
  const consulta = query(tarefasDoUsuario(uid), where('materiaId', '==', materiaId));
  const resultado = await getDocs(consulta);
  return resultado.docs
    .map((d) => paraTarefa(d.id, d.data()))
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime()); // ordena aqui: evita criar índice no Firestore
}

/** Lista todas as tarefas do usuário (útil para Início, Calendário e Resumo). */
export async function listarTarefas(uid: string): Promise<Tarefa[]> {
  const resultado = await getDocs(tarefasDoUsuario(uid));
  return resultado.docs
    .map((d) => paraTarefa(d.id, d.data()))
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime());
}

/** Edita os campos do formulário; não altera concluida nem notificacaoId. */
export async function editarTarefa(uid: string, tarefaId: string, dados: DadosTarefa): Promise<void> {
  const referencia = referenciaTarefa(uid, tarefaId);
  await updateDoc(referencia, prepararDados(dados));
}

export async function concluirTarefa(uid: string, tarefaId: string, concluida = true): Promise<void> {
  await updateDoc(referenciaTarefa(uid, tarefaId), { concluida });
}

export async function excluirTarefa(uid: string, tarefaId: string): Promise<void> {
  await deleteDoc(referenciaTarefa(uid, tarefaId));
}

/** Para a integração: apaga as tarefas de uma matéria quando ela for excluída. */
export async function excluirTarefasDaMateria(uid: string, materiaId: string): Promise<void> {
  validarId(materiaId, 'ID da matéria');
  const consulta = query(tarefasDoUsuario(uid), where('materiaId', '==', materiaId));
  const resultado = await getDocs(consulta);
  const lote = writeBatch(db);
  resultado.docs.forEach((d) => lote.delete(d.ref));
  await lote.commit();
}