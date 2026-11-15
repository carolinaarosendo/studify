import { Card } from '@/components';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useEstudos } from '@/hooks/useEstudos';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DIA_MS = 24 * 60 * 60 * 1000;

function diasRestantes(prazo: Date) {
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
  const p = new Date(prazo);
  const inicioPrazo = new Date(p.getFullYear(), p.getMonth(), p.getDate()).getTime();
  const dias = Math.round((inicioPrazo - inicioHoje) / DIA_MS);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  return `Em ${dias} dias`;
}

export default function ResumoScreen() {
  const { materias, tarefas } = useEstudos();

  const dados = useMemo(() => {
    const agora = new Date();
    const limite = new Date(agora.getTime() + 7 * DIA_MS);

    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = tarefas.length - concluidas;

    const provasProximas = tarefas
      .filter(t => {
        const prazo = new Date(t.prazo);
        return t.tipo === 'prova' && !t.concluida && prazo >= agora && prazo <= limite;
      })
      .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime());

    const progresso = materias.map(m => {
      const daMateria = tarefas.filter(t => t.materiaId === m.id);
      const feitas = daMateria.filter(t => t.concluida).length;
      return {
        ...m,
        total: daMateria.length,
        feitas,
        pct: daMateria.length ? feitas / daMateria.length : 0,
      };
    });

    const nomePorId = new Map(materias.map(m => [m.id, m.nome]));

    return { concluidas, pendentes, provasProximas, progresso, nomePorId };
  }, [materias, tarefas]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <Card>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={28} color="#2E7D32" />
            <Text style={styles.number}>{dados.concluidas}</Text>
            <Text style={styles.muted}>Concluídas</Text>
          </View>
        </Card>
        <Card>
          <View style={styles.stat}>
            <Ionicons name="time" size={28} color="#EF6C00" />
            <Text style={styles.number}>{dados.pendentes}</Text>
            <Text style={styles.muted}>Pendentes</Text>
          </View>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Provas nos próximos 7 dias</Text>
      {dados.provasProximas.length === 0 ? (
        <Card>
          <View style={styles.emptyRow}>
            <Ionicons name="happy-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.muted}>Nenhuma prova nesta semana.</Text>
          </View>
        </Card>
      ) : (
        dados.provasProximas.map(p => (
          <Card key={p.id}>
            <View style={styles.provaRow}>
              <Ionicons name="school" size={22} color={colors.danger} />
              <View style={styles.flex}>
                <Text style={styles.bold}>{p.titulo}</Text>
                <Text style={styles.muted}>
                  {dados.nomePorId.get(p.materiaId) ?? 'Matéria'} ·{' '}
                  {new Date(p.prazo).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}{' '}
                  às{' '}
                  {new Date(p.prazo).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.badge}>{diasRestantes(p.prazo)}</Text>
            </View>
          </Card>
        ))
      )}

      <Text style={styles.sectionTitle}>Progresso por matéria</Text>
      {dados.progresso.length === 0 ? (
        <Card>
          <View style={styles.emptyRow}>
            <Ionicons name="book-outline" size={22} color={colors.textSecondary} />
            <Text style={styles.muted}>Cadastre matérias para acompanhar o progresso.</Text>
          </View>
        </Card>
      ) : (
        dados.progresso.map(m => (
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
                  { width: `${m.pct * 100}%`, backgroundColor: m.cor || colors.primary },
                ]}
              />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: 12 },
  stat: { alignItems: 'center', gap: 4, minWidth: 120 },
  number: { fontSize: 28, fontWeight: '700' },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', marginTop: 8 },
  muted: { color: colors.textSecondary },
  bold: { fontWeight: '600' },
  flex: { flex: 1 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  provaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { color: colors.primary, fontWeight: '700' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barBg: {
    height: 8,
    borderRadius: radius.md,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: radius.md },
});