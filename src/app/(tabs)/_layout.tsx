import { colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, size, focused }: { color: unknown; size: number; focused: boolean }) => (
    <Ionicons
      name={focused ? active : inactive}
      color={typeof color === 'string' ? color : colors.textSecondary}
      size={size}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="materias"
        options={{ title: 'Matérias', tabBarIcon: tabIcon('book', 'book-outline') }}
      />
      <Tabs.Screen
        name="calendario"
        options={{ title: 'Calendário', tabBarIcon: tabIcon('calendar', 'calendar-outline') }}
      />
      <Tabs.Screen
        name="resumo"
        options={{ title: 'Resumo', tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline') }}
      />
    </Tabs>
  );
}