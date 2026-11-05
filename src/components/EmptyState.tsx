import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

type Props = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
};

export function EmptyState({ icon = 'file-tray-outline', title, message }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, textAlign: 'center' },
  message: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
});