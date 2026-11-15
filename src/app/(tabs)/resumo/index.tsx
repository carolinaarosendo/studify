
import { Card } from '@/components';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useEstudos } from '@/hooks/useEstudos';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const DIA_MS = 24 * 60 * 60 * 1000;

function diasRestantes(prazo: Date, agora: Date) {
  const p = new Date(prazo);

  if (p.getTime() < agora.getTime()) return 'Atrasada';

  const inicioHoje = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
  ).getTime();

  const inicioPrazo = new Date(
    p.getFullYear(),
    p.getMonth(),
    p.getDate(),
  ).getTime();

  const dias = Math.round((inicioPrazo - inicioHoje) / DIA_MS);

  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';

  return `Em ${dias} dias`;
}

export default function ResumoScreen() {
  const { materias, tarefas, carregando } = useEstudos();
  const { user } = useAuth();

  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  const primeiroNome =
    user?.displayName?.trim().split(/\s+/)[0] || 'estudante';

  const dados = useMemo(() => {
    const concluidas = tarefas.filter((t) => t.concluida).length;
    const pendentes = tarefas.length - concluidas;
    const percentualGeral = tarefas.length
      ? concluidas / tarefas.length
      : 0;

    const compromissos = tarefas
      .filter((t) => !t.concluida)
      .sort(
        (a, b) =>
          new Date(a.prazo).getTime() -
          new Date(b.prazo).getTime(),
      );

    const progresso = materias.map((m) => {
      const daMateria = tarefas.filter((t) => t.materiaId === m.id);
      const feitas = daMateria.filter((t) => t.concluida).length;

      return {
        ...m,
        total: daMateria.length,
        feitas,
        pct: daMateria.length ? feitas / daMateria.length : 0,
      };
    });

    const nomePorId = new Map(materias.map((m) => [m.id, m.nome]));

    return {
      concluidas,
      pendentes,
      total: tarefas.length,
      percentualGeral,
      compromissos,
      progresso,
      nomePorId,
    };
  }, [materias, tarefas]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {primeiroNome}! 👋</Text>
        <Text style={styles.subtitle}>
          Confira como está sua rotina de estudos.
        </Text>
      </View>

      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Carregando seus dados...</Text>
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Card>
              <View style={styles.stat}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={colors.success}
                />
                <Text style={styles.number}>{dados.concluidas}</Text>
                <Text style={styles.muted}>Concluídas</Text>
              </View>
            </Card>

            <Card>
              <View style={styles.stat}>
                <Ionicons
                  name="time"
                  size={28}
                  color={colors.warning}
                />
                <Text style={styles.number}>{dados.pendentes}</Text>
                <Text style={styles.muted}>Pendentes</Text>
              </View>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>Progresso geral</Text>

          <Card>
            <View style={styles.progressHeader}>
              <Text style={styles.bold}>Tarefas concluídas</Text>

              <Text style={styles.muted}>
                {dados.concluidas}/{dados.total} (
                {Math.round(dados.percentualGeral * 100)}%)
              </Text>
            </View>

            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${dados.percentualGeral * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressDescription}>
              {dados.total === 0
                ? 'Cadastre tarefas para acompanhar seu progresso.'
                : `${dados.concluidas} de ${dados.total} tarefas concluídas.`}
            </Text>
          </Card>

          <Text style={styles.sectionTitle}>Próximos compromissos</Text>

          {dados.compromissos.length === 0 ? (
            <Card>
              <View style={styles.emptyRow}>
                <Ionicons
                  name="happy-outline"
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.muted}>
                  Você não tem compromissos pendentes.
                </Text>
              </View>
            </Card>
          ) : (
            dados.compromissos.map((item) => {
              const prazo = new Date(item.prazo);
              const ehProva = item.tipo === 'prova';
              const atrasada = diasRestantes(prazo, agora) === 'Atrasada';

              return (
                <Card key={item.id}>
                  <View style={styles.provaRow}>
                    <Ionicons
                      name={ehProva ? 'school' : 'document-text'}
                      size={22}
                      color={ehProva ? colors.danger : colors.primary}
                    />

                    <View style={styles.flex}>
                      <Text style={styles.bold}>{item.titulo}</Text>

                      <Text style={styles.muted}>
                        {ehProva ? 'Prova' : 'Tarefa'} ·{' '}
                        {dados.nomePorId.get(item.materiaId) ?? 'Matéria'}
                      </Text>

                      <Text style={styles.muted}>
                        {prazo.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}{' '}
                        às{' '}
                        {prazo.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.badge,
                        atrasada && styles.badgeAtrasada,
                      ]}
                    >
                      {diasRestantes(prazo, agora)}
                    </Text>
                  </View>
                </Card>
              );
            })
          )}

          <Text style={styles.sectionTitle}>Progresso por matéria</Text>

          {dados.progresso.length === 0 ? (
            <Card>
              <View style={styles.emptyRow}>
                <Ionicons
                  name="book-outline"
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.muted}>
                  Cadastre matérias para acompanhar o progresso.
                </Text>
              </View>
            </Card>
          ) : (
            dados.progresso.map((m) => (
              <Card key={m.id}>
                <View style={styles.progressHeader}>
                  <Text style={styles.bold}>{m.nome}</Text>

                  <Text style={styles.muted}>
                    {m.feitas}/{m.total} ({Math.round(m.pct * 100)}%)
                  </Text>
                </View>

                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${m.pct * 100}%`,
                        backgroundColor: m.cor || colors.primary,
                      },
                    ]}
                  />
                </View>
              </Card>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: 12,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
    minWidth: 120,
  },
  number: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  muted: {
    color: colors.textSecondary,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
  flex: {
    flex: 1,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  provaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    color: colors.primary,
    fontWeight: '700',
  },
  badgeAtrasada: {
    color: colors.danger,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barBg: {
    height: 8,
    borderRadius: radius.md,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: radius.md,
  },
  progressDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 8,
  },
});
