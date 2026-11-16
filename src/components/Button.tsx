import { colors, fontSize, radius, spacing } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon }: Props) {
  const isDisabled = disabled || loading;
  const contentColor = variant === 'secondary' ? colors.primary : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (pressed || isDisabled) && styles.faded,
      ]}>
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={contentColor} />}
          <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight },
  danger: { backgroundColor: colors.danger },
  faded: { opacity: 0.6 },
  text: { color: '#fff', fontSize: fontSize.md, fontWeight: '600' },
  textSecondary: { color: colors.primary },
});