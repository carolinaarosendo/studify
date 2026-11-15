
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Card, Input, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function DadosConta() {
  const { user, atualizarNome } = useAuth();
  const { showToast } = useToast();

  const partesNome = user?.displayName?.trim().split(/\s+/) || [];

  const [nome, setNome] = useState(partesNome[0] || '');
  const [sobrenome, setSobrenome] = useState(
    partesNome.slice(1).join(' ')
  );
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!nome.trim() || !sobrenome.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha seu nome e sobrenome.'
      );
      return;
    }

    if (salvando) return;

    setSalvando(true);

    try {
      await atualizarNome(nome, sobrenome);

      showToast(
        'Dados atualizados!',
        'success',
        'Suas informações foram salvas com sucesso.'
      );
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível atualizar seus dados. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Dados da conta</Text>
          <Text style={styles.descricao}>
            Consulte e atualize suas informações pessoais.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome"
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <Input
            label="Sobrenome"
            placeholder="Digite seu sobrenome"
            value={sobrenome}
            onChangeText={setSobrenome}
            autoCapitalize="words"
          />

          <View style={styles.emailContainer}>
            <Text style={styles.rotulo}>E-mail</Text>
            <Card>
              <Text style={styles.email}>
                {user?.email || 'Não disponível'}
              </Text>
            </Card>
            <Text style={styles.ajuda}>
              O e-mail só pode ser alterado na seção de configurações.
            </Text>
          </View>

          <Button
            title="Salvar alterações"
            onPress={handleSalvar}
            loading={salvando}
            disabled={salvando}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  descricao: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  form: {
    gap: spacing.md,
  },
  emailContainer: {
    gap: spacing.xs,
  },
  rotulo: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  ajuda: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
