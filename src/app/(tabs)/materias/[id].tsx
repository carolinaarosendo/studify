//Esta tela é responsável por Ana Clara

import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Loading, Screen } from '@/components';
import { colors, DEFAULT_SUBJECT_COLOR, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useEstudos } from '@/hooks/useEstudos';
import { concluirTarefa, excluirTarefa } from '@/services/tarefasService';
import type { Tarefa } from '@/types';
import { formatarDataHora } from '@/utils/datas';

type Filtro = 'pendentes' | 'concluidas';

export default function DetalheMateria() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { buscarMateria, tarefasDaMateria, carregando, erro } = useEstudos();
  const [filtro, setFiltro] = useState<Filtro>('pendentes');

  const materia = id ? buscarMateria(id) : undefined;
  const todas = id ? tarefasDaMateria(id) : [];
  const pendentes = todas.filter((t) => !t.concluida);
  const concluidas = todas.filter((t) => t.concluida);
  const lista = filtro === 'pendentes' ? pendentes : concluidas;
  const cor = materia?.cor || DEFAULT_SUBJECT_COLOR;

  function abrirFormulario(tarefaId?: string) {
    router.push({
      pathname: '/materias/tarefa-form',
      params: tarefaId ? { materiaId: id, tarefaId } : { materiaId: id },
    });
  }

  async function alternarConclusao(tarefa: Tarefa) {
    if (!user) return;
    try {
      await concluirTarefa(user.uid, tarefa.id, !tarefa.concluida);
    } catch {
      Alert.alert('Não foi possível atualizar', 'Tente novamente em instantes.');
    }
  }

  function confirmarExclusao(tarefa: Tarefa) {
    Alert.alert('Excluir', `Excluir "${tarefa.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          try {
            await excluirTarefa(user.uid, tarefa.id);
          } catch {
            Alert.alert('Não foi possível excluir', 'Tente novamente em instantes.');
          }
        },
      },
    ]);
  }

  if (carregando) {
    return (
      <Screen>
        <Loading message="Carregando tarefas..." />
      </Screen>
    );
  }

  if (erro) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title="Algo deu errado" message={erro} />
      </Screen>
    );
  }

  if (!materia) {
    return (
      <Screen>
        <EmptyState icon="search-outline" title="Matéria não encontrada" message="Ela pode ter sido removida." />
      </Screen>
    );
  }

  const agora = Date.now();

  return (
    <Screen>
      <Stack.Screen options={{ title: materia.nome }} />

      <View style={styles.resumo}>
        <Text style={styles.resumoTexto}>
          {[materia.professor, materia.diaSemana, materia.horario].filter(Boolean).join(' · ') || 'Sem detalhes da aula'}
        </Text>
      </View>

      <View style={styles.filtros}>
        {([
          ['pendentes', `Pendentes (${pendentes.length})`],
          ['concluidas', `Concluídas (${concluidas.length})`],
        ] as const).map(([valor, rotulo]) => {
          const ativo = filtro === valor;
          return (
            <Pressable
              key={valor}
              onPress={() => setFiltro(valor)}
              style={[styles.filtro, ativo && styles.filtroAtivo]}>
              <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>{rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={lista}
        keyExtractor={(tarefa) => tarefa.id}
        contentContainerStyle={lista.length === 0 ? styles.listaVazia : styles.lista}
        ListEmptyComponent={
          <EmptyState
            icon={filtro === 'pendentes' ? 'checkmark-done-outline' : 'file-tray-outline'}
            title={filtro === 'pendentes' ? 'Nada pendente' : 'Nenhuma concluída ainda'}
            message={
              filtro === 'pendentes'
                ? 'Toque no botão + para cadastrar uma tarefa ou prova.'
                : 'As tarefas que você concluir aparecem aqui.'
            }
          />
        }
        renderItem={({ item }) => {
          const atrasada = !item.concluida && item.prazo.getTime() < agora;
          return (
            <Card accentColor={cor}>
              <View style={styles.linha}>
                <Pressable
                  onPress={() => alternarConclusao(item)}
                  hitSlop={10}
                  accessibilityLabel={item.concluida ? 'Marcar como pendente' : 'Concluir'}>
                  <Ionicons
                    name={item.concluida ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={item.concluida ? colors.success : colors.textSecondary}
                  />
                </Pressable>

                <View style={styles.conteudo}>
                  <View style={styles.tituloLinha}>
                    <Text style={[styles.titulo, item.concluida && styles.tituloConcluido]} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                    <View style={[styles.selo, item.tipo === 'prova' && styles.seloProva]}>
                      <Text style={[styles.seloTexto, item.tipo === 'prova' && styles.seloTextoProva]}>
                        {item.tipo === 'prova' ? 'Prova' : 'Tarefa'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.data, atrasada && styles.dataAtrasada]}>
                    {formatarDataHora(item.prazo)}
                    {atrasada ? ' · atrasada' : ''}
                  </Text>
                  {!!item.observacao && <Text style={styles.observacao}>{item.observacao}</Text>}
                </View>

                <View style={styles.acoes}>
                  <Pressable onPress={() => abrirFormulario(item.id)} hitSlop={8} accessibilityLabel="Editar">
                    <Ionicons name="create-outline" size={22} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => confirmarExclusao(item)} hitSlop={8} accessibilityLabel="Excluir">
                    <Ionicons name="trash-outline" size={22} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <Pressable
        onPress={() => abrirFormulario()}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        accessibilityLabel="Adicionar tarefa ou prova">
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resumo: { marginBottom: spacing.md },
  resumoTexto: { fontSize: fontSize.sm, color: colors.textSecondary },
  filtros: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  filtro: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  filtroAtivo: { backgroundColor: colors.primary },
  filtroTexto: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  filtroTextoAtivo: { color: '#fff' },
  lista: { paddingBottom: 96 },
  listaVazia: { flexGrow: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  conteudo: { flex: 1, gap: spacing.xs },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  titulo: { flexShrink: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  tituloConcluido: { textDecorationLine: 'line-through', color: colors.textSecondary },
  selo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  seloProva: { backgroundColor: '#FDECEC' },
  seloTexto: { fontSize: fontSize.sm - 2, fontWeight: '700', color: colors.primary },
  seloTextoProva: { color: colors.danger },
  data: { fontSize: fontSize.sm, color: colors.textSecondary },
  dataAtrasada: { color: colors.danger, fontWeight: '600' },
  observacao: { fontSize: fontSize.sm, color: colors.textSecondary },
  acoes: { gap: spacing.md, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
