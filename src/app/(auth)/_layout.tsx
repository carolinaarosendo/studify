
import { Redirect, Stack, useSegments } from 'expo-router';
import { Loading } from '@/components';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  const isCadastro = segments[1] === 'cadastro';
  const isCadastroSucesso = segments[1] === 'cadastro-sucesso';

  if (loading) {
    return <Loading message="Verificando sua conta..." />;
  }

  if (user && !isCadastro && !isCadastroSucesso) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ title: 'Entrar', headerShown: false }}
      />
      <Stack.Screen
        name="cadastro"
        options={{ title: 'Criar conta' }}
      />
      <Stack.Screen
        name="cadastro-sucesso"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
