
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
import { colors } from '@/constants/theme';

export default function ResumoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Resumo',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/resumo/configuracoes')}
              hitSlop={10}
            >
              <Ionicons
                name="settings-outline"
                size={23}
                color={colors.primary}
              />
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="configuracoes"
        options={{ title: 'Configurações' }}
      />
    </Stack>
  );
}
