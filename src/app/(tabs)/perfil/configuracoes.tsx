
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Card, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useEstudos } from '@/hooks/useEstudos';
import {
  obterConfigLembrete,
  salvarConfigLembrete,
  salvarIdLembrete,
  sincronizarLembreteProva,
  type ConfigLembrete,
} from '@/services/notificacoesService';

const opcoesAntecedencia = [5, 15, 30, 60];

export default function Configuracoes() {
  const { user } = useAuth();
  const { tarefas, materias, carregando } = useEstudos();

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [antecedenciaLembrete, setAntecedenciaLembrete] = useState(15);
  const [carregandoConfig, setCarregandoConfig] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarConfiguracoes() {
      if (!user) {
        setCarregandoConfig(false);
        return;
      }

      try {
        const config = await obterConfigLembrete(user.uid);

        setNotificacoesAtivas(config.notificacoesAtivas);
        setAntecedenciaLembrete(config.antecedenciaLembrete);
      } finally {
        setCarregandoConfig(false);
      }
    }

    carregarConfiguracoes();
  }, [user]);

  async function atualizarConfiguracoes(
    alteracoes: Partial<ConfigLembrete>,
  ) {
    if (!user || salvando || carregandoConfig) return;

    if (carregando) {
      Alert.alert(
        'Aguarde',
        'As tarefas ainda estão sendo carregadas. Tente novamente.',
      );
      return;
    }

    const novaConfig: ConfigLembrete = {
      notificacoesAtivas,
      antecedenciaLembrete,
      ...alteracoes,
    };

    setNotificacoesAtivas(novaConfig.notificacoesAtivas);
    setAntecedenciaLembrete(novaConfig.antecedenciaLembrete);
    setSalvando(true);

    try {
      await salvarConfigLembrete(user.uid, novaConfig);

      const provas = tarefas.filter(
        (tarefa) => tarefa.tipo === 'prova',
      );

      for (const prova of provas) {
        const materia = materias.find(
          (item) => item.id === prova.materiaId,
        );

        const notificacaoId = await sincronizarLembreteProva(
          {
            titulo: prova.titulo,
            tipo: prova.tipo,
            prazo: prova.prazo,
            concluida: prova.concluida,
            notificacaoId: prova.notificacaoId,
          },
          novaConfig,
          materia?.nome,
        );

        await salvarIdLembrete(
          user.uid,
          prova.id,
          notificacaoId,
        );
      }
    } catch {
      Alert.alert(
        'Atenção',
        'As configurações foram alteradas, mas não foi possível atualizar todos os lembretes. Verifique sua conexão.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Text style={styles.secao}>Minha conta</Text>

        <Card>
          <Text style={styles.rotulo}>E-mail</Text>
          <Text style={styles.valor}>
            {user?.email ?? 'Não disponível'}
          </Text>
        </Card>

        <Text style={styles.secao}>Notificações</Text>

        <Card>
          <View style={styles.linha}>
            <View style={styles.textos}>
              <Text style={styles.valor}>Ativar notificações</Text>

              <Text style={styles.descricao}>
                Receber lembretes sobre suas atividades.
              </Text>
            </View>

            <Switch
              value={notificacoesAtivas}
              onValueChange={(ativo) =>
                atualizarConfiguracoes({
                  notificacoesAtivas: ativo,
                })
              }
              disabled={carregandoConfig || salvando}
              trackColor={{
                false: colors.border,
                true: colors.primaryLight,
              }}
              thumbColor={
                notificacoesAtivas ? colors.primary : '#F4F3F4'
              }
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.valor}>
            Antecedência dos lembretes
          </Text>

          <Text style={styles.descricao}>
            Quanto tempo antes deseja ser avisado?
          </Text>

          <View style={styles.opcoes}>
            {opcoesAntecedencia.map((minutos) => {
              const selecionado = antecedenciaLembrete === minutos;

              return (
                <Text
                  key={minutos}
                  onPress={() => {
                    if (carregandoConfig || salvando) return;

                    atualizarConfiguracoes({
                      antecedenciaLembrete: minutos,
                    });
                  }}
                  style={[
                    styles.opcao,
                    selecionado && styles.opcaoSelecionada,
                    (carregandoConfig || salvando) && styles.opcaoDesabilitada,
                  ]}
                >
                  {minutos} min
                </Text>
              );
            })}
          </View>

          {salvando && (
            <Text style={styles.status}>
              Atualizando lembretes...
            </Text>
          )}

          {carregandoConfig && (
            <Text style={styles.status}>
              Carregando configurações...
            </Text>
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  secao: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rotulo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  valor: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  descricao: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textos: {
    flex: 1,
    gap: spacing.xs,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  opcao: {
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  opcaoSelecionada: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    color: colors.primary,
  },
  opcaoDesabilitada: {
    opacity: 0.5,
  },
  status: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
