
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Input, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function traduzirErro(codigo: string) {
  const erros: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'Digite um endereço de e-mail válido.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/network-request-failed': 'Verifique sua conexão com a internet.',
    'auth/operation-not-allowed': 'O cadastro por e-mail e senha não está habilitado.',
  };

  return erros[codigo] || 'Não foi possível criar sua conta. Tente novamente.';
}

export default function Cadastro() {
  const { cadastro } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    if (!email.trim() || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await cadastro(email, senha);
    } catch (error: any) {
      console.error('ERRO NO CADASTRO:', error.code, error.message);
      Alert.alert('Não foi possível cadastrar', traduzirErro(error.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Studify</Text>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Organize sua rotina acadêmica e acompanhe sua evolução.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-mail"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Senha"
            placeholder="Mínimo de 6 caracteres"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Input
            label="Confirmar senha"
            placeholder="Digite a senha novamente"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />

          <Button
            title="Criar conta"
            onPress={handleCadastro}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.register}>
            <Text style={styles.registerText}>Já possui uma conta?</Text>
            <Link href="/(auth)/login" style={styles.link}>
              Entrar
            </Link>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  form: {
    gap: spacing.sm,
  },
  register: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  link: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
