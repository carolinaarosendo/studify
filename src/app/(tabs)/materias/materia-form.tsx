import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, Input, Loading, Screen } from '@/components';
import { colors, DEFAULT_SUBJECT_COLOR, fontSize, radius, spacing } from '@/constants/theme';
import { useEstudos } from '@/hooks/useEstudos';
import type { DadosMateria } from '@/services/materiasService';

const dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const cores = [DEFAULT_SUBJECT_COLOR, colors.success, '#277BB5', '#BA4589', '#C16B20', '#65713B'];
const nomesCores: Record<string, string> = { [DEFAULT_SUBJECT_COLOR]: 'Roxo', [colors.success]: 'Verde', '#277BB5': 'Azul', '#BA4589': 'Rosa', '#C16B20': 'Laranja', '#65713B': 'Oliva' };

export default function MateriaForm() {
  const { materiaId } = useLocalSearchParams<{ materiaId?: string | string[] }>();
  const { buscarMateria, carregando, erro } = useEstudos();
  const id = Array.isArray(materiaId) ? materiaId[0] : materiaId;
  const materia = id ? buscarMateria(id) : undefined;
  if (id && carregando) return <Screen><Loading message="Carregando matéria..." /></Screen>;
  if (id && erro) return <Screen><EmptyState icon="alert-circle-outline" title="Não foi possível carregar a matéria" message={erro} /></Screen>;
  if (id && !materia) return <Screen><EmptyState icon="search-outline" title="Matéria não encontrada" message="Volte à lista e selecione uma matéria existente." /></Screen>;
  // Monta após carregar: snapshots não apagam os campos que estão sendo editados.
  return <CamposMateria key={id ?? 'nova'} materiaId={id} inicial={materia} />;
}

function CamposMateria({ materiaId, inicial }: { materiaId?: string; inicial?: DadosMateria }) {
  const { adicionarMateria, atualizarMateria } = useEstudos();
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [professor, setProfessor] = useState(inicial?.professor ?? '');
  const [cor, setCor] = useState(inicial?.cor || DEFAULT_SUBJECT_COLOR);
  const [diaSemana, setDiaSemana] = useState(inicial?.diaSemana ?? '');
  const [horario, setHorario] = useState(inicial?.horario ?? '');
  const [erros, setErros] = useState<{ nome?: string; horario?: string }>({});
  const [erroSalvar, setErroSalvar] = useState('');
  const [salvando, setSalvando] = useState(false);
  const envioEmCurso = useRef(false);

  async function salvar() {
    if (envioEmCurso.current) return;
    const validacao = {
      nome: nome.trim() ? undefined : 'Informe o nome da matéria.',
      horario: horario.trim() && !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario.trim())
        ? 'Use HH:MM, entre 00:00 e 23:59.' : undefined,
    };
    setErros(validacao);
    setErroSalvar('');
    if (validacao.nome || validacao.horario) return;
    envioEmCurso.current = true;
    setSalvando(true);
    try {
      const dados = { nome: nome.trim(), professor: professor.trim(), cor, diaSemana, horario: horario.trim() };
      if (materiaId) await atualizarMateria(materiaId, dados);
      else await adicionarMateria(dados);
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/materias');
    } catch {
      setErroSalvar('Não foi possível salvar a matéria. Seus campos foram mantidos; tente novamente.');
    } finally {
      envioEmCurso.current = false;
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: materiaId ? 'Editar matéria' : 'Nova matéria', gestureEnabled: !salvando }} />
      <Text style={styles.introducao}>O nome é obrigatório. Os demais detalhes são opcionais.</Text>
      <Input label="Nome da matéria *" accessibilityLabel="Nome da matéria" value={nome} onChangeText={setNome} error={erros.nome} editable={!salvando} placeholder="Ex.: Desenvolvimento Mobile" />
      <Input label="Professor" accessibilityLabel="Professor" value={professor} onChangeText={setProfessor} editable={!salvando} placeholder="Nome do professor" />
      <Text style={styles.label}>Cor da matéria</Text>
      <View style={styles.opcoes}>
        {[...new Set([...cores, cor])].map((opcao) => (
          <Pressable key={opcao} accessibilityRole="radio" accessibilityLabel={`Cor ${nomesCores[opcao] ?? 'atual'}`} accessibilityState={{ checked: cor === opcao, disabled: salvando }} disabled={salvando} onPress={() => setCor(opcao)} style={[styles.cor, { backgroundColor: opcao }, cor === opcao && styles.selecionada]}>
            {cor === opcao && <Text style={styles.marca}>✓</Text>}
          </Pressable>
        ))}
      </View>
      <Text style={styles.ajuda}>A cor padrão é o roxo do Studify.</Text>
      <Text style={styles.label}>Dia da semana</Text>
      <View style={styles.opcoes}>
        {[...new Set(['', ...dias, ...(diaSemana ? [diaSemana] : [])])].map((dia) => (
          <Pressable key={dia} accessibilityRole="radio" accessibilityState={{ checked: diaSemana === dia, disabled: salvando }} disabled={salvando} onPress={() => setDiaSemana(dia)} style={[styles.dia, diaSemana === dia && styles.diaSelecionado]}>
            <Text style={[styles.textoDia, diaSemana === dia && styles.textoSelecionado]}>{dia || 'Não informar'}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Horário (HH:MM)" accessibilityLabel="Horário da matéria" value={horario} onChangeText={setHorario} error={erros.horario} editable={!salvando} placeholder="Ex.: 19:00" keyboardType="numbers-and-punctuation" autoCorrect={false} maxLength={5} />
      {!!erroSalvar && <Text accessibilityRole="alert" style={styles.erro}>{erroSalvar}</Text>}
      <View style={styles.botoes}>
        <Button title={materiaId ? 'Salvar alterações' : 'Cadastrar matéria'} onPress={salvar} loading={salvando} />
        <Button title="Cancelar" variant="secondary" disabled={salvando} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/materias')} />
      </View>
      <View style={styles.espacoFinal} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  introducao: { color: colors.textSecondary, fontSize: fontSize.md, marginBottom: spacing.lg },
  label: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  cor: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  selecionada: { borderWidth: 3, borderColor: colors.text },
  marca: { color: colors.surface, fontSize: fontSize.xl, fontWeight: '700' },
  ajuda: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg },
  dia: { minHeight: 48, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primaryLight },
  diaSelecionado: { backgroundColor: colors.primary },
  textoDia: { color: colors.primary, fontSize: fontSize.sm },
  textoSelecionado: { color: colors.surface },
  erro: { color: colors.danger, fontSize: fontSize.md, marginBottom: spacing.md },
  botoes: { gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg },
  espacoFinal: { height: 88 },
});
