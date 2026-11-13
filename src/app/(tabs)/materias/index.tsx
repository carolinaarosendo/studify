import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Input, Loading, Screen } from '@/components';
import { colors, DEFAULT_SUBJECT_COLOR, fontSize, radius, spacing } from '@/constants/theme';
import { useEstudos } from '@/hooks/useEstudos';
import type { Materia } from '@/types';

function normalizarBusca(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

export default function Materias() {
  const { materias, carregando, erro, pendentesDaMateria, removerMateria } = useEstudos();
  const [busca, setBusca] = useState('');
  const [paraExcluir, setParaExcluir] = useState<Materia | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
  const envioExclusao = useRef(false);
  const termo = normalizarBusca(busca);
  const materiasFiltradas = materias.filter((materia) => normalizarBusca(materia.nome).includes(termo));

  function cancelarExclusao() {
    if (envioExclusao.current) return;
    setParaExcluir(null);
    setErroExclusao('');
  }

  async function confirmarExclusao() {
    if (!paraExcluir || envioExclusao.current) return;
    envioExclusao.current = true;
    setExcluindo(true);
    setErroExclusao('');
    try {
      await removerMateria(paraExcluir.id);
      setParaExcluir(null);
    } catch {
      setErroExclusao('Não foi possível concluir a exclusão. Algumas tarefas podem já ter sido removidas. Tente novamente.');
    } finally {
      envioExclusao.current = false;
      setExcluindo(false);
    }
  }

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
            <Card accentColor={materia.cor || DEFAULT_SUBJECT_COLOR}>
              <View style={styles.linhaMateria}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${materia.nome}. ${textoPendentes}. Abrir matéria.`}
                  onPress={() => router.push({
                    pathname: '/(tabs)/materias/[id]',
                    params: { id: materia.id },
                  })}
                  style={({ pressed }) => [styles.conteudoMateria, pressed && styles.pressionado]}
                >
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
                </Pressable>
                <View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Editar matéria ${materia.nome}`}
                    onPress={() => router.push({ pathname: '/(tabs)/materias/materia-form', params: { materiaId: materia.id } })}
                    style={({ pressed }) => [styles.editar, pressed && styles.pressionado]}
                  >
                    <Ionicons name="create-outline" size={24} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir matéria ${materia.nome}`}
                    onPress={() => { Keyboard.dismiss(); setErroExclusao(''); setParaExcluir(materia); }}
                    style={({ pressed }) => [styles.editar, pressed && styles.pressionado]}
                  >
                    <Ionicons name="trash-outline" size={24} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            </Card>
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
      <Modal visible={paraExcluir !== null} transparent animationType="fade" onRequestClose={cancelarExclusao}>
        <View style={styles.fundoModal}>
          <View accessibilityViewIsModal style={styles.dialogo}>
            <Text accessibilityRole="header" style={styles.tituloDialogo}>Excluir matéria?</Text>
            <Text style={styles.mensagemDialogo}>
              {`Excluir "${paraExcluir?.nome ?? ''}" e todas as tarefas e provas vinculadas, incluindo as concluídas? Essa ação não pode ser desfeita.`}
            </Text>
            {!!erroExclusao && <Text accessibilityRole="alert" style={styles.erroExclusao}>{erroExclusao}</Text>}
            <Button title="Cancelar" variant="secondary" disabled={excluindo} onPress={cancelarExclusao} />
            <Button title="Excluir matéria" variant="danger" loading={excluindo} onPress={confirmarExclusao} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fundoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  dialogo: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 480, alignSelf: 'center' },
  tituloDialogo: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  mensagemDialogo: { color: colors.textSecondary, fontSize: fontSize.md },
  erroExclusao: { color: colors.danger, fontSize: fontSize.md },
  linhaMateria: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  conteudoMateria: { flex: 1 },
  editar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
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
