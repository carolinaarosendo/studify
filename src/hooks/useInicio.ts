import { useMemo } from 'react';
import { diasAte, inicioDoDia, paraData, saudacaoPorHorario, somarDias } from '@/utils/datasInicio';

// Formato mínimo que o hook precisa. Os tipos reais do projeto (src/types)
// têm esses campos e mais alguns, então funcionam aqui sem conversão.
type TarefaBase = {
  id: string;
  titulo: string;
  tipo: string; // 'tarefa' | 'prova'
  prazo: unknown;
  concluida: boolean;
  materiaId: string;
};

type MateriaBase = {
  id: string;
  nome: string;
  cor?: string;
};

export type ItemDaAgenda<T, M> = {
  tarefa: T;
  data: Date;
  materia?: M;
  atrasada: boolean;
};

export function useInicio<T extends TarefaBase, M extends MateriaBase>(tarefas: T[], materias: M[]) {
  return useMemo(() => {
    const agora = new Date();
    const fimDaSemana = somarDias(inicioDoDia(agora), 7);
    const materiaPorId = new Map(materias.map((m) => [m.id, m]));

    // Só tarefas e provas pendentes que têm data válida, da mais próxima para a mais distante
    const pendentes: ItemDaAgenda<T, M>[] = [];
    for (const tarefa of tarefas) {
      if (tarefa.concluida) continue;
      const data = paraData(tarefa.prazo);
      if (!data) continue;
      pendentes.push({
        tarefa,
        data,
        materia: materiaPorId.get(tarefa.materiaId),
        atrasada: data.getTime() < agora.getTime(),
      });
    }
    pendentes.sort((a, b) => a.data.getTime() - b.data.getTime());

    const proximaProva =
      pendentes.find((item) => item.tarefa.tipo === 'prova' && !item.atrasada) ?? null;

    // Atrasadas aparecem primeiro (já estão no topo pela ordenação) + tudo dos próximos 7 dias
    const tarefasDaSemana = pendentes.filter((item) => item.data.getTime() < fimDaSemana.getTime());

    return {
      saudacao: saudacaoPorHorario(agora),
      proximaProva,
      diasParaProva: proximaProva ? diasAte(proximaProva.data, agora) : null,
      tarefasDaSemana,
      temMaterias: materias.length > 0,
    };
  }, [tarefas, materias]);
}