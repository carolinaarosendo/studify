
import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MateriasLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: false,
        headerLargeTitle: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Matérias' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhe da matéria' }} />
      <Stack.Screen name="materia-form" options={{ title: 'Matéria', presentation: 'modal' }} />
      <Stack.Screen name="tarefa-form" options={{ title: 'Tarefa ou prova', presentation: 'modal' }} />
    </Stack>
  );
}
