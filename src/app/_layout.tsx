
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components';

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isCadastro = segments[1] === 'cadastro';
    const isCadastroSucesso = segments[1] === 'cadastro-sucesso';

    if (!user && inTabsGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && inAuthGroup && !isCadastro && !isCadastroSucesso) {
      router.replace('/');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return <Loading message="Verificando sua conta..." />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="boas-vindas" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
