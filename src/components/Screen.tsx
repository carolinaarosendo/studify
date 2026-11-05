import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

// container padrão das telas: fundo, espaçamento e rolagem opcional
export function Screen({ children, scroll = false }: { children: ReactNode; scroll?: boolean }) {
  if (scroll) {
    return (
      <ScrollView style={styles.base} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.base, styles.content]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.md },
});