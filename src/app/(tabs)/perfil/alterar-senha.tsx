
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Input, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function AlterarSenha() {
  const { alterarSenha } = useAuth();
  const { showToast } = useToast();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert(
        'Atenção',
        'A nova senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    if (senhaAtual === novaSenha) {
      Alert.alert(
        'Atenção',
        'A nova senha deve ser diferente da senha atual.'
      );
      return;
    }

    if (salvando) return;

    setSalvando(true);

    try {
      await alterarSenha(senhaAtual, novaSenha);

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');

      showToast(
        'Senha alterada!',
        'success',
        'Sua nova senha foi salva com sucesso.'
      );
    } catch (erro: any) {
      let mensagem = 'Não foi possível alterar sua senha. Tente novamente.';

      if (
        erro.code === 'auth/invalid-credential' ||
        erro.code === 'auth/wrong-password'
      ) {
        mensagem = 'A senha atual está incorreta.';
      } else if (erro.code === 'auth/weak-password') {
        mensagem = 'A nova senha é muito fraca.';
      } else if (erro.code === 'auth/too-many-requests') {
        mensagem = 'Muitas tentativas. Aguarde um pouco e tente novamente.';
      }

      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Alterar senha</Text>
          <Text style={styles.descricao}>
            Mantenha sua conta segura utilizando uma senha que só você conhece.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Senha atual"
            placeholder="Digite sua senha atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Nova senha"
            placeholder="Digite sua nova senha"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Confirmar nova senha"
            placeholder="Digite novamente sua nova senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.ajuda}>
            A senha deve ter pelo menos 6 caracteres.
          </Text>

          <Button
            title="Salvar nova senha"
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
  ajuda: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
