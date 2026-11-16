
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { Loading } from '@/components';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = '@studify:onboarding-completed';

export default function Index() {
  const { user, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    let ativo = true;

    async function verificarBoasVindas() {
      if (loading) return;

      if (!user) {
        setOnboardingCompleted(false);
        return;
      }

      setOnboardingCompleted(null);

      try {
        const completed = await AsyncStorage.getItem(
          `${ONBOARDING_KEY}:${user.uid}`
        );

        if (ativo) {
          setOnboardingCompleted(completed === 'true');
        }
      } catch {
        if (ativo) {
          setOnboardingCompleted(false);
        }
      }
    }

    verificarBoasVindas();

    return () => {
      ativo = false;
    };
  }, [user?.uid, loading]);

  if (loading || (user && onboardingCompleted === null)) {
    return <Loading message="Preparando o Studify..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/boas-vindas" />;
  }

  return <Redirect href="/(tabs)" />;
}
