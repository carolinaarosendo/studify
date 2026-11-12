import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Input, Loading, Screen } from '@/components';
import { colors, DEFAULT_SUBJECT_COLOR, fontSize, spacing } from '@/constants/theme';
import { useEstudos } from '@/hooks/useEstudos';

function normalizarBusca(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

export default function Materias() {
  const { materias, carregando, erro, pendentesDaMateria } = useEstudos();
  const [busca, setBusca] = useState('');
  const termo = normalizarBusca(busca);
  const materiasFiltradas = materias.filter((materia) => normalizarBusca(materia.nome).includes(termo));

  if (carregando) {
    return (
      <Screen>
        <Loading message="Carregando suas matérias..." />
      </Screen>
    );
  }

  if (erro) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Não foi possível carregar as matérias"
          message={erro}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Input
        label="Buscar matéria"
        accessibilityLabel="Buscar matéria pelo nome"
        placeholder="Digite o nome da matéria"
        value={busca}
        onChangeText={setBusca}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {busca.length > 0 && (
        <Pressable accessibilityRole="button" onPress={() => setBusca('')} style={styles.limpar}>
          <Text style={styles.textoPendencias}>Limpar busca</Text>
        </Pressable>
      )}
      <FlatList
        data={materiasFiltradas}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        keyExtractor={(materia) => materia.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={materiasFiltradas.length > 0 ? (
          <Text style={styles.resumo}>
            {materiasFiltradas.length} {termo
              ? (materiasFiltradas.length === 1 ? 'matéria encontrada' : 'matérias encontradas')
              : (materiasFiltradas.length === 1 ? 'matéria cadastrada' : 'matérias cadastradas')}
          </Text>
        ) : undefined}
        ListEmptyComponent={
          <EmptyState
            icon={materias.length > 0 ? 'search-outline' : 'book-outline'}
            title={materias.length > 0 ? 'Nenhuma matéria encontrada' : 'Você ainda não tem matérias'}
            message={materias.length > 0
              ? 'Tente outro nome ou limpe a busca para ver todas as matérias.'
              : 'Toque no botão + para cadastrar sua primeira matéria.'}
          />
        }
        renderItem={({ item: materia }) => {
          const pendentes = pendentesDaMateria(materia.id);
          const textoPendentes = pendentes === 0
            ? 'Nenhuma tarefa pendente'
            : `${pendentes} ${pendentes === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${materia.nome}. ${textoPendentes}. Abrir matéria.`}
              onPress={() => router.push({
                pathname: '/(tabs)/materias/[id]',
                params: { id: materia.id },
              })}
              style={({ pressed }) => pressed && styles.pressionado}
            >
              <Card accentColor={materia.cor || DEFAULT_SUBJECT_COLOR}>
                <Text style={styles.nome}>{materia.nome}</Text>
                {!!materia.professor && <Text style={styles.detalhe}>{materia.professor}</Text>}
                {!!(materia.diaSemana || materia.horario) && (
                  <Text style={styles.detalhe}>
                    {[materia.diaSemana, materia.horario].filter(Boolean).join(' • ')}
                  </Text>
                )}
                <View style={styles.pendencias}>
                  <Text style={styles.textoPendencias}>{textoPendentes}</Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar matéria"
        accessibilityHint="Abre o formulário de cadastro de matéria"
        onPress={() => router.push('/(tabs)/materias/materia-form')}
        style={({ pressed }) => [styles.adicionar, pressed && styles.pressionado]}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  limpar: { alignSelf: 'flex-start', minHeight: 48, justifyContent: 'center', marginBottom: spacing.xs },
  lista: { flexGrow: 1, paddingBottom: 88 },
  resumo: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.md },
  nome: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600' },
  detalhe: { color: colors.textSecondary, fontSize: fontSize.md },
  pendencias: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  textoPendencias: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  adicionar: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pressionado: { opacity: 0.7 },
});
