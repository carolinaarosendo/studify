import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';

import type { Materia } from '../types';
import { db } from './firebase';

export type DadosMateria = Omit<Materia, 'id'>;

function validarId(valor: string, campo: string): void {
  if (typeof valor !== 'string' || !valor.trim() || valor.includes('/')) {
    throw new Error(`${campo} inválido.`);
  }
}

function materiasDoUsuario(uid: string) {
  validarId(uid, 'ID do usuário');
  return collection(db, 'users', uid, 'materias');
}

function referenciaMateria(uid: string, materiaId: string) {
  validarId(materiaId, 'ID da matéria');
  return doc(materiasDoUsuario(uid), materiaId);
}

// Seleciona apenas os campos do modelo, sem persistir id ou campos extras.
function prepararDados(dados: DadosMateria): DadosMateria {
  const campos = ['nome', 'professor', 'cor', 'diaSemana', 'horario'] as const;
  for (const campo of campos) {
    if (typeof dados?.[campo] !== 'string') {
      throw new Error(`O campo ${campo} deve ser um texto.`);
    }
  }
  if (!dados.nome.trim()) {
    throw new Error('O nome da matéria é obrigatório.');
  }
  return {
    nome: dados.nome.trim(),
    professor: dados.professor.trim(),
    cor: dados.cor.trim(),
    diaSemana: dados.diaSemana.trim(),
    horario: dados.horario.trim(),
  };
}

/** Recebe o uid do usuário logado; a autorização é aplicada pelas regras do Firestore. */
export async function criarMateria(uid: string, dados: DadosMateria): Promise<Materia> {
  const referencia = materiasDoUsuario(uid);
  const materia = prepararDados(dados);
  const documento = await addDoc(referencia, materia);
  return { ...materia, id: documento.id };
}

export async function listarMaterias(uid: string): Promise<Materia[]> {
  const resultado = await getDocs(materiasDoUsuario(uid));
  return resultado.docs.map((documento) => ({
    ...(documento.data() as DadosMateria),
    id: documento.id,
  }));
}

/** Atualiza os cinco campos da matéria; não cria um documento inexistente. */
export async function editarMateria(
  uid: string,
  materiaId: string,
  dados: DadosMateria,
): Promise<void> {
  const referencia = referenciaMateria(uid, materiaId);
  await updateDoc(referencia, prepararDados(dados));
}

/** Exclui apenas a matéria. O tratamento de tarefas vinculadas pertence à integração. */
export async function excluirMateria(uid: string, materiaId: string): Promise<void> {
  await deleteDoc(referenciaMateria(uid, materiaId));
}
