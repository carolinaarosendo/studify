import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accentColor?: string; // faixa colorida à esquerda (ex.: cor da matéria)
  style?: ViewStyle;
};

export function Card({ children, onPress, accentColor, style }: Props) {
  const content = (
    <View style={[styles.card, style]}>
      {!!accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
      <View style={styles.body}>{children}</View>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  accent: { width: 6 },
  body: { flex: 1, padding: spacing.md, gap: spacing.xs },
});