
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Button, Card, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const opcoesAntecedencia = [5, 15, 30, 60];

export default function Configuracoes() {
  const { user, logout } = useAuth();

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [antecedenciaLembrete, setAntecedenciaLembrete] = useState(15);
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    setSaindo(true);

    try {
      await logout();
    } catch {
      Alert.alert('Erro', 'Não foi possível sair da sua conta. Tente novamente.');
      setSaindo(false);
    }
  }

  function confirmarLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza de que deseja sair do Studify?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
    );
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Text style={styles.titulo}>Configurações</Text>
        <Text style={styles.subtitulo}>
          Gerencie sua conta e suas preferências.
        </Text>

        <Text style={styles.secao}>Minha conta</Text>

        <Card>
          <Text style={styles.rotulo}>E-mail</Text>
          <Text style={styles.valor}>{user?.email ?? 'Não disponível'}</Text>
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
              onValueChange={setNotificacoesAtivas}
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
          <Text style={styles.valor}>Antecedência dos lembretes</Text>
          <Text style={styles.descricao}>
            Quanto tempo antes deseja ser avisado?
          </Text>

          <View style={styles.opcoes}>
            {opcoesAntecedencia.map((minutos) => {
              const selecionado = antecedenciaLembrete === minutos;

              return (
                <Text
                  key={minutos}
                  onPress={() => setAntecedenciaLembrete(minutos)}
                  style={[
                    styles.opcao,
                    selecionado && styles.opcaoSelecionada,
                  ]}
                >
                  {minutos} min
                </Text>
              );
            })}
          </View>
        </Card>

        <Text style={styles.secao}>Sessão</Text>

        <Card>
          <Text style={styles.descricao}>
            Ao sair, você precisará entrar novamente para acessar sua conta.
          </Text>

          <Button
            title="Sair da conta"
            variant="danger"
            onPress={confirmarLogout}
            loading={saindo}
            disabled={saindo}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 120,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
});
