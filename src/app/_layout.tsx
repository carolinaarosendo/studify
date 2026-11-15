<<<<<<< HEAD
import { Loading } from '@/components';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EstudosProvider } from '@/contexts/EstudosContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
=======
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EstudosProvider } from '@/contexts/EstudosContext';
import { Loading } from '@/components';
import { configurarNotificacoes } from '@/services/notificacoesService';
>>>>>>> 386bddfe3addb9e8da2b096e7a980844914e9f59

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Pede permissão e prepara o canal de notificações ao abrir o app (Luiza Eduarda)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    configurarNotificacoes().catch(() => {
      // Se o usuário negar ou der erro, o app continua funcionando sem lembretes
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && inAuthGroup) {
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
    <ToastProvider>
      <AuthProvider>
        <EstudosProvider>
          <RootNavigator />
        </EstudosProvider>
      </AuthProvider>
    </ToastProvider>
  );
}