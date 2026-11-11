
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
    async function verificarBoasVindas() {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setOnboardingCompleted(completed === 'true');
      } catch {
        setOnboardingCompleted(false);
      }
    }

    verificarBoasVindas();
  }, []);

  if (loading || onboardingCompleted === null) {
    return <Loading message="Preparando o Studify..." />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/boas-vindas" />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
