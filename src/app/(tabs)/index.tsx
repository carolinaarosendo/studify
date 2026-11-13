// Tela Início — Luiza Eduarda

import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useEstudos } from '@/hooks/useEstudos';
import { useAuth } from '@/contexts/AuthContext';
import { concluirTarefa } from '@/services/tarefasService';
import { Card, EmptyState, Loading, Screen } from '@/components';

import { useInicio, type ItemDaAgenda } from '@/hooks/useInicio';
import { cancelarLembrete } from '@/services/notificacoesService';
import { formatarPrazo, textoContagem } from '@/utils/datasInicio';

const cores = {
  texto: '#1F2430',
  textoSuave: '#6B7280',
  borda: '#E5E7EB',
  atraso: '#C2410C',
  sucesso: '#15803D',
  corPadraoMateria: '#4F46E5',
};

export default function TelaInicio() {
  const { materias, tarefas, carregando } = useEstudos();
  const { user } = useAuth();
  const { saudacao, proximaProva, diasParaProva, tarefasDaSemana, temMaterias } = useInicio(
    tarefas,
    materias,
  );
  const [concluindoId, setConcluindoId] = useState<string | null>(null);

  async function handleConcluir(item: ItemDaAgenda<(typeof tarefas)[number], (typeof materias)[number]>) {
    if (!user) return;
    setConcluindoId(item.tarefa.id);
    try {
      await concluirTarefa(user.uid, item.tarefa.id);
      // Prova concluída não precisa mais de lembrete
      if (item.tarefa.tipo === 'prova') {
        await cancelarLembrete(item.tarefa.notificacaoId);
      }
      // Quando o Toast do Davi estiver pronto: mostrar "Tarefa concluída"
    } catch {
      Alert.alert('Não foi possível concluir', 'Verifique sua conexão e tente de novo.');
    } finally {
      setConcluindoId(null);
    }
  }

  function abrirMateria(materiaId: string) {
    router.push({ pathname: '/materias/[id]', params: { id: materiaId } });
  }

  if (carregando) {
    return <Loading />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={styles.saudacao}>{saudacao}</Text>
        <Text style={styles.subtitulo}>Veja o que vem por aí nos seus estudos.</Text>

        {!temMaterias ? (
          <EmptyState
            icon="book-outline"
            title="Comece pelas suas matérias"
            message="Cadastre uma matéria na aba Matérias e depois adicione tarefas e provas a ela."
          />
        ) : (
          <>
            {/* Próxima prova */}
            {proximaProva && diasParaProva !== null ? (
              <Pressable
                onPress={() => abrirMateria(proximaProva.tarefa.materiaId)}
                accessibilityRole="button"
                accessibilityLabel={`Próxima prova: ${proximaProva.tarefa.titulo}. ${textoContagem(diasParaProva)}`}
              >
                <Card>
                  <View style={styles.cardProva}>
                    <View
                      style={[
                        styles.faixaMateria,
                        { backgroundColor: proximaProva.materia?.cor ?? cores.corPadraoMateria },
                      ]}
                    />
                    <View style={styles.cardProvaTexto}>
                      <Text style={styles.rotuloCard}>Próxima prova</Text>
                      <Text style={styles.tituloProva} numberOfLines={2}>
                        {proximaProva.tarefa.titulo}
                      </Text>
                      <Text style={styles.detalhe}>
                        {proximaProva.materia?.nome ?? 'Matéria'} • {formatarPrazo(proximaProva.data)}
                      </Text>
                    </View>
                    <View style={styles.contagem}>
                      {diasParaProva > 1 ? (
                        <>
                          <Text style={styles.numeroDias}>{diasParaProva}</Text>
                          <Text style={styles.legendaDias}>dias</Text>
                        </>
                      ) : (
                        <Text style={styles.contagemCurta}>{textoContagem(diasParaProva)}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            ) : (
              <Card>
                <View style={styles.cardSemProva}>
                  <Ionicons name="happy-outline" size={22} color={cores.sucesso} />
                  <Text style={styles.textoSemProva}>
                    Nenhuma prova marcada. Aproveite para adiantar as tarefas.
                  </Text>
                </View>
              </Card>
            )}

            {/* Tarefas da semana */}
            <Text style={styles.tituloSecao}>Próximos 7 dias</Text>

            {tarefasDaSemana.length === 0 ? (
              <EmptyState
                icon="calendar-clear-outline"
                title="Semana livre"
                message="Você não tem tarefas nem provas pendentes para os próximos 7 dias."
              />
            ) : (
              tarefasDaSemana.map((item) => {
                const concluindo = concluindoId === item.tarefa.id;
                return (
                  <View key={item.tarefa.id} style={styles.linha}>
                    <Pressable
                      onPress={() => handleConcluir(item)}
                      disabled={concluindo}
                      hitSlop={10}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: false, busy: concluindo }}
                      accessibilityLabel={`Marcar ${item.tarefa.titulo} como concluída`}
                    >
                      {concluindo ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Ionicons name="ellipse-outline" size={26} color={cores.textoSuave} />
                      )}
                    </Pressable>

                    <Pressable
                      style={styles.linhaTexto}
                      onPress={() => abrirMateria(item.tarefa.materiaId)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.tituloTarefa} numberOfLines={1}>
                        {item.tarefa.titulo}
                      </Text>
                      <View style={styles.linhaInfo}>
                        <View
                          style={[
                            styles.bolinha,
                            { backgroundColor: item.materia?.cor ?? cores.corPadraoMateria },
                          ]}
                        />
                        <Text style={styles.detalhe} numberOfLines={1}>
                          {item.materia?.nome ?? 'Matéria'} • {formatarPrazo(item.data)}
                        </Text>
                      </View>
                    </Pressable>

                    {item.atrasada ? (
                      <Text style={[styles.etiqueta, styles.etiquetaAtraso]}>Atrasada</Text>
                    ) : item.tarefa.tipo === 'prova' ? (
                      <Text style={styles.etiqueta}>Prova</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  saudacao: {
    fontSize: 28,
    fontWeight: '700',
    color: cores.texto,
  },
  subtitulo: {
    fontSize: 15,
    color: cores.textoSuave,
    marginBottom: 8,
  },
  cardProva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  faixaMateria: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: 3,
  },
  cardProvaTexto: {
    flex: 1,
    gap: 4,
  },
  rotuloCard: {
    fontSize: 13,
    color: cores.textoSuave,
  },
  tituloProva: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.texto,
  },
  contagem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 8,
  },
  numeroDias: {
    fontSize: 40,
    fontWeight: '800',
    color: cores.texto,
    lineHeight: 44,
  },
  legendaDias: {
    fontSize: 13,
    color: cores.textoSuave,
  },
  contagemCurta: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.atraso,
    textAlign: 'center',
  },
  cardSemProva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textoSemProva: {
    flex: 1,
    fontSize: 15,
    color: cores.texto,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.texto,
    marginTop: 12,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  linhaTexto: {
    flex: 1,
    gap: 4,
  },
  tituloTarefa: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.texto,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bolinha: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detalhe: {
    fontSize: 13,
    color: cores.textoSuave,
    flexShrink: 1,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.texto,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  etiquetaAtraso: {
    color: cores.atraso,
    borderColor: cores.atraso,
  },
});