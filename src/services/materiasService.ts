
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import type { Materia } from '../types';
import { db } from './firebase';

export type DadosMateria = Omit<Materia, 'id'>;

function validarId(valor: string, campo: string): void {
  if (
    typeof valor !== 'string' ||
    !valor.trim() ||
    valor.includes('/')
  ) {
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

function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function verificarMateriaDuplicada(
  uid: string,
  dados: DadosMateria,
  materiaIdAtual?: string,
): Promise<void> {
  const resultado = await getDocs(materiasDoUsuario(uid));

  const nomeNovo = normalizarTexto(dados.nome);
  const professorNovo = normalizarTexto(dados.professor);

  const duplicada = resultado.docs.some((documento) => {
    if (documento.id === materiaIdAtual) {
      return false;
    }

    const materiaExistente = documento.data() as DadosMateria;

    return (
      normalizarTexto(materiaExistente.nome) === nomeNovo &&
      normalizarTexto(materiaExistente.professor) === professorNovo
    );
  });

  if (duplicada) {
    throw new Error(
      'Já existe uma matéria com esse nome e professor.',
    );
  }
}

export async function criarMateria(
  uid: string,
  dados: DadosMateria,
): Promise<Materia> {
  const referencia = materiasDoUsuario(uid);
  const materia = prepararDados(dados);

  await verificarMateriaDuplicada(uid, materia);

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

export async function editarMateria(
  uid: string,
  materiaId: string,
  dados: DadosMateria,
): Promise<void> {
  const referencia = referenciaMateria(uid, materiaId);
  const materia = prepararDados(dados);

  await verificarMateriaDuplicada(uid, materia, materiaId);

  await updateDoc(referencia, materia);
}

export async function excluirMateria(
  uid: string,
  materiaId: string,
): Promise<void> {
  await deleteDoc(referenciaMateria(uid, materiaId));
}
