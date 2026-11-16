
import { Stack } from 'expo-router';

export default function PerfilLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="configuracoes" />
      <Stack.Screen name="dados-conta" />
      <Stack.Screen name="alterar-senha" />
    </Stack>
  );
}
