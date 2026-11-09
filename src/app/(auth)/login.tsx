
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Input, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function traduzirErro(codigo: string) {
  const erros: Record<string, string> = {
    'auth/invalid-email': 'Digite um endereço de e-mail válido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Verifique sua conexão com a internet.',
  };

  return erros[codigo] || 'Não foi possível entrar. Tente novamente.';
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      await login(email, senha);
    } catch (error: any) {
      Alert.alert('Não foi possível entrar', traduzirErro(error.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Studify</Text>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>
            Entre na sua conta para continuar organizando seus estudos.
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
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.register}>
            <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
            <Link href="/(auth)/cadastro" style={styles.link}>
              Criar conta
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
