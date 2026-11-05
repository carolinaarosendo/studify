import { Stack } from 'expo-router';

export default function MateriasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Matérias' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhe da matéria' }} />
      <Stack.Screen name="materia-form" options={{ title: 'Matéria', presentation: 'modal' }} />
      <Stack.Screen name="tarefa-form" options={{ title: 'Tarefa ou prova', presentation: 'modal' }} />
    </Stack>
  );
}