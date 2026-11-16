
import { Stack } from 'expo-router';

export default function ResumoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Resumo', headerShown: false }}
      />
      <Stack.Screen
        name="configuracoes"
        options={{ title: 'Configurações' }}
      />
    </Stack>
  );
}
