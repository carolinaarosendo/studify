//Esta tela é responsável por Ana Clara

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { Card, EmptyState, Loading, Screen } from '@/components';
import { colors, DEFAULT_SUBJECT_COLOR, fontSize, spacing } from '@/constants/theme';
import { useEstudos } from '@/hooks/useEstudos';
import type { Tarefa } from '@/types';
import { chaveDoDia, formatarChave, formatarHora } from '@/utils/datas';

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

export default function Calendario() {
  const router = useRouter();
  const { tarefas, buscarMateria, carregando, erro } = useEstudos();
  const [diaSelecionado, setDiaSelecionado] = useState(() => chaveDoDia(new Date()));

  // provas agrupadas por dia ('YYYY-MM-DD')
  const provasPorDia = useMemo(() => {
    const mapa: Record<string, Tarefa[]> = {};
    for (const tarefa of tarefas) {
      if (tarefa.tipo !== 'prova') continue;
      const chave = chaveDoDia(tarefa.prazo);
      (mapa[chave] ??= []).push(tarefa);
    }
    return mapa;
  }, [tarefas]);

  const diasMarcados = useMemo(() => {
    const marcados: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};
    for (const chave of Object.keys(provasPorDia)) {
      marcados[chave] = { marked: true, dotColor: colors.danger };
    }
    marcados[diaSelecionado] = {
      ...marcados[diaSelecionado],
      selected: true,
      selectedColor: colors.primary,
    };
    return marcados;
  }, [provasPorDia, diaSelecionado]);

  const provasDoDia = provasPorDia[diaSelecionado] ?? [];

  if (carregando) {
    return (
      <Screen>
        <Loading message="Carregando provas..." />
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

  return (
    <Screen>
      <View style={styles.calendario}>
        <Calendar
          markedDates={diasMarcados}
          onDayPress={(dia) => setDiaSelecionado(dia.dateString)}
          enableSwipeMonths
          theme={{
            todayTextColor: colors.primary,
            arrowColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#fff',
            textMonthFontWeight: '700',
            textDayFontSize: fontSize.md,
          }}
        />
      </View>

      <Text style={styles.subtitulo}>Provas em {formatarChave(diaSelecionado)}</Text>

      <FlatList
        data={provasDoDia}
        keyExtractor={(prova) => prova.id}
        contentContainerStyle={provasDoDia.length === 0 ? styles.listaVazia : undefined}
        ListEmptyComponent={
          <EmptyState icon="calendar-clear-outline" title="Nenhuma prova neste dia" message="Os dias com prova aparecem com um ponto no calendário." />
        }
        renderItem={({ item }) => {
          const materia = buscarMateria(item.materiaId);
          return (
            <Card
              accentColor={materia?.cor || DEFAULT_SUBJECT_COLOR}
              onPress={() => router.push({ pathname: '/materias/[id]', params: { id: item.materiaId } })}>
              <View style={styles.linha}>
                <Ionicons name="school-outline" size={22} color={colors.danger} />
                <View style={styles.conteudo}>
                  <Text style={[styles.titulo, item.concluida && styles.concluida]}>{item.titulo}</Text>
                  <Text style={styles.detalhe}>
                    {materia?.nome ?? 'Matéria removida'} · {formatarHora(item.prazo)}
                  </Text>
                  {!!item.observacao && <Text style={styles.detalhe}>{item.observacao}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendario: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  subtitulo: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  listaVazia: { flexGrow: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  conteudo: { flex: 1, gap: spacing.xs },
  titulo: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  concluida: { textDecorationLine: 'line-through', color: colors.textSecondary },
  detalhe: { fontSize: fontSize.sm, color: colors.textSecondary },
});
