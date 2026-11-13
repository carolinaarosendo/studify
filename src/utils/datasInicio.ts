// Funções de data da tela Início e das notificações (Luiza Eduarda).
// A formatação de hora reaproveita o utils da Ana Clara (datas.ts).
import { formatarHora } from './datas';

const UM_DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const pad = (n: number) => String(n).padStart(2, '0');

// O prazo pode vir como Timestamp do Firestore, Date, string ou número
export function paraData(valor: unknown): Date | null {
  if (!valor) return null;

  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : valor;
  }

  // Timestamp do Firestore tem o método toDate()
  if (typeof valor === 'object' && typeof (valor as { toDate?: unknown }).toDate === 'function') {
    return (valor as { toDate: () => Date }).toDate();
  }

  if (typeof valor === 'string' || typeof valor === 'number') {
    const data = new Date(valor);
    return isNaN(data.getTime()) ? null : data;
  }

  return null;
}

export function inicioDoDia(data: Date): Date {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * UM_DIA_MS);
}

// Diferença em dias de calendário (ignora as horas): hoje = 0, amanhã = 1...
export function diasAte(data: Date, referencia: Date = new Date()): number {
  const diferenca = inicioDoDia(data).getTime() - inicioDoDia(referencia).getTime();
  return Math.round(diferenca / UM_DIA_MS);
}

export function textoContagem(dias: number): string {
  if (dias < 0) return 'Já passou';
  if (dias === 0) return 'É hoje!';
  if (dias === 1) return 'É amanhã';
  return `Faltam ${dias} dias`;
}

export function saudacaoPorHorario(agora: Date = new Date()): string {
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia!';
  if (hora >= 12 && hora < 18) return 'Boa tarde!';
  return 'Boa noite!';
}

// Ex.: "qui, 13/11 às 14:00"
export function formatarPrazo(data: Date): string {
  const dia = DIAS_SEMANA[data.getDay()];
  return `${dia}, ${pad(data.getDate())}/${pad(data.getMonth() + 1)} às ${formatarHora(data)}`;
}