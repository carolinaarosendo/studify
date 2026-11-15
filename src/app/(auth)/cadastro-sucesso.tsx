
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';

export default function CadastroSucesso() {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.icone}>
          <Ionicons
            name="checkmark-circle"
            size={76}
            color={colors.success}
          />
        </View>

        <Text style={styles.titulo}>
          Conta cadastrada com sucesso!
        </Text>

        <Text style={styles.mensagem}>
          Seja bem-vindo ao Studify! Sua conta foi criada e agora você pode
          começar a organizar sua rotina acadêmica.
        </Text>

        <View style={styles.botao}>
          <Button
            title="Começar a usar"
            onPress={() => router.replace('/')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  icone: {
    marginBottom: spacing.lg,
  },
  titulo: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mensagem: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 23,
  },
  botao: {
    width: '100%',
    marginTop: spacing.xl,
  },
});
