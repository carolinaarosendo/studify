//Esta tela é responsável por Ana Clara
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, EmptyState, Input, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useEstudos } from '@/hooks/useEstudos';
import {
  obterConfigLembrete,
  salvarIdLembrete,
  sincronizarLembreteProva,
} from '@/services/notificacoesService';
import { criarTarefa, editarTarefa } from '@/services/tarefasService';
import type { TipoTarefa } from '@/types';
import { formatarData, formatarHora } from '@/utils/datas';

type Erros = { titulo?: string; prazo?: string };

// sugestão inicial: daqui a 1 hora, com os minutos zerados
function prazoInicial(): Date {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return d;
}

// Notificação (Luiza Eduarda): pega o id da tarefa recém-criada,
// seja qual for o formato que o criarTarefa devolve
function extrairId(resultado: unknown): string | undefined {
  if (typeof resultado === 'string') return resultado;
  if (resultado && typeof resultado === 'object') {
    const id = (resultado as { id?: unknown }).id;
    if (typeof id === 'string') return id;
  }
  return undefined;
}

export default function TarefaForm() {
  const { materiaId, tarefaId } = useLocalSearchParams<{ materiaId?: string; tarefaId?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { tarefas, buscarMateria } = useEstudos();

  const editando = !!tarefaId;
  const existente = tarefaId ? tarefas.find((t) => t.id === tarefaId) : undefined;
  const materia = materiaId ? buscarMateria(materiaId) : undefined;

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoTarefa>('tarefa');
  const [prazo, setPrazo] = useState<Date>(prazoInicial);
  const [observacao, setObservacao] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const [pickerIosAberto, setPickerIosAberto] = useState(false);
  const [preenchido, setPreenchido] = useState(false);

  // modo edição: preenche os campos quando a tarefa chega do contexto
  useEffect(() => {
    if (existente && !preenchido) {
      setTitulo(existente.titulo);
      setTipo(existente.tipo);
      setPrazo(existente.prazo);
      setObservacao(existente.observacao ?? '');
      setPreenchido(true);
    }
  }, [existente, preenchido]);

  function escolherPrazo() {
    setErros((e) => ({ ...e, prazo: undefined }));

    if (Platform.OS === 'android') {
      // Android: primeiro a data, depois a hora
      DateTimePickerAndroid.open({
        value: prazo,
        mode: 'date',
        onChange: (evento: DateTimePickerEvent, data?: Date) => {
          if (evento.type !== 'set' || !data) return;
          DateTimePickerAndroid.open({
            value: data,
            mode: 'time',
            is24Hour: true,
            onChange: (evento2: DateTimePickerEvent, hora?: Date) => {
              if (evento2.type !== 'set' || !hora) return;
              setPrazo(
                new Date(data.getFullYear(), data.getMonth(), data.getDate(), hora.getHours(), hora.getMinutes()),
              );
            },
          });
        },
      });
      return;
    }

    setPickerIosAberto((aberto) => !aberto);
  }

  function validar(): boolean {
    const novos: Erros = {};
    if (!titulo.trim()) novos.titulo = 'Informe um título.';

    // ao editar sem mexer na data, permite salvar mesmo que ela já tenha passado
    const dataInalterada = editando && !!existente && prazo.getTime() === existente.prazo.getTime();
    if (!dataInalterada && prazo.getTime() < Date.now()) {
      novos.prazo = 'A data e a hora não podem estar no passado.';
    }

    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  // Notificação (Luiza Eduarda): agenda, reagenda ou cancela o lembrete da prova
  // e guarda o id da notificação na tarefa. Se falhar, a tarefa continua salva.
  async function atualizarLembrete(uid: string, idDaTarefa: string) {
    try {
      const idAntigo = existente?.notificacaoId ?? null;
      const config = await obterConfigLembrete(uid);
      const idNovo = await sincronizarLembreteProva(
        { titulo, tipo, prazo, concluida: existente?.concluida, notificacaoId: idAntigo },
        config,
        materia?.nome,
      );
      if (idNovo !== idAntigo) {
        await salvarIdLembrete(uid, idDaTarefa, idNovo);
      }
    } catch {
      // O lembrete é um extra: um erro aqui não deve impedir o cadastro
    }
  }

  async function salvar() {
    if (!validar()) return;
    if (!user || !materiaId) {
      Alert.alert('Não foi possível salvar', 'Sessão ou matéria inválida. Volte e tente novamente.');
      return;
    }

    setSalvando(true);
    try {
      const dados = { materiaId, titulo, tipo, prazo, observacao };
      let idDaTarefa: string | undefined = tarefaId;
      if (editando && tarefaId) {
        await editarTarefa(user.uid, tarefaId, dados);
      } else {
        const resultado: unknown = await criarTarefa(user.uid, dados);
        idDaTarefa = extrairId(resultado);
      }

      if (idDaTarefa) {
        await atualizarLembrete(user.uid, idDaTarefa);
      }

      Alert.alert(
        'Tudo certo!',
        editando ? 'As alterações foram salvas.' : tipo === 'prova' ? 'Prova cadastrada.' : 'Tarefa cadastrada.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (erro) {
      const codigo = (erro as { code?: string })?.code;
      const mensagem =
        codigo === 'permission-denied'
          ? 'Você não tem permissão para salvar. Verifique as regras do Firestore.'
          : codigo === 'unavailable'
            ? 'Sem conexão com o servidor. Tente novamente.'
            : (erro as Error)?.message || 'Tente novamente em instantes.';
      Alert.alert('Não foi possível salvar', mensagem);
    } finally {
      setSalvando(false);
    }
  }

  if (!materiaId) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Matéria não informada" message="Abra o formulário a partir de uma matéria." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {!!materia && <Text style={styles.materia}>{materia.nome}</Text>}

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.tipos}>
        {(['tarefa', 'prova'] as const).map((opcao) => {
          const ativo = tipo === opcao;
          return (
            <Pressable
              key={opcao}
              onPress={() => setTipo(opcao)}
              style={[styles.tipo, ativo && styles.tipoAtivo]}>
              <Ionicons
                name={opcao === 'prova' ? 'school-outline' : 'checkbox-outline'}
                size={18}
                color={ativo ? '#fff' : colors.primary}
              />
              <Text style={[styles.tipoTexto, ativo && styles.tipoTextoAtivo]}>
                {opcao === 'prova' ? 'Prova' : 'Tarefa'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Título"
        value={titulo}
        onChangeText={(texto) => {
          setTitulo(texto);
          if (erros.titulo) setErros((e) => ({ ...e, titulo: undefined }));
        }}
        placeholder="Ex.: Lista de exercícios 3"
        error={erros.titulo}
        maxLength={80}
      />

      <Text style={styles.label}>Data e hora</Text>
      <Pressable onPress={escolherPrazo} style={[styles.data, !!erros.prazo && styles.dataErro]}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={styles.dataTexto}>
          {formatarData(prazo)} às {formatarHora(prazo)}
        </Text>
      </Pressable>
      {!!erros.prazo && <Text style={styles.erro}>{erros.prazo}</Text>}

      {Platform.OS === 'ios' && pickerIosAberto && (
        <DateTimePicker
          value={prazo}
          mode="datetime"
          display="spinner"
          locale="pt-BR"
          onChange={(_evento: DateTimePickerEvent, data?: Date) => {
            if (data) setPrazo(data);
          }}
        />
      )}

      <View style={styles.espaco} />

      <Input
        label="Observação (opcional)"
        value={observacao}
        onChangeText={setObservacao}
        placeholder="Detalhes, capítulos, local da prova..."
        multiline
        numberOfLines={3}
        style={styles.observacao}
        textAlignVertical="top"
      />

      <Button
        title={editando ? 'Salvar alterações' : tipo === 'prova' ? 'Cadastrar prova' : 'Cadastrar tarefa'}
        onPress={salvar}
        loading={salvando}
      />
      <View style={styles.espaco} />
      <Button title="Cancelar" variant="secondary" onPress={() => router.back()} disabled={salvando} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  materia: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  tipos: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tipo: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tipoAtivo: { backgroundColor: colors.primary },
  tipoTexto: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
  tipoTextoAtivo: { color: '#fff' },
  data: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dataErro: { borderColor: colors.danger },
  dataTexto: { fontSize: fontSize.md, color: colors.text },
  erro: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.xs },
  espaco: { height: spacing.md },
  observacao: { minHeight: 90, paddingTop: spacing.sm },
});