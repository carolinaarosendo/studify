export type Materia = {
  id: string;
  nome: string;
  professor: string;
  cor: string;
  diaSemana: string;
  horario: string;
};

export type TipoTarefa = 'tarefa' | 'prova';

export type Tarefa = {
  id: string;
  titulo: string;
  tipo: TipoTarefa;
  prazo: Date;
  observacao?: string;
  concluida: boolean;
  materiaId: string;
  notificacaoId?: string;
};

export type Configuracoes = {
  antecedenciaLembrete: number; // em dias
  notificacoesAtivas: boolean;
};