import { useContext } from 'react';
import { EstudosContext } from '@/contexts/EstudosContext';

// Use nas telas: const { materias, tarefas, carregando } = useEstudos();
export function useEstudos() {
  const context = useContext(EstudosContext);
  if (!context) {
    throw new Error('useEstudos deve ser usado dentro do EstudosProvider');
  }
  return context;
}