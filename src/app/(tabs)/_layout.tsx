
import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(active: IconName, inactive: IconName) {
  return ({
    color,
    size,
    focused,
  }: {
    color: unknown;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons
      name={focused ? active : inactive}
      color={typeof color === "string" ? color : colors.textSecondary}
      size={size}
    />
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: tabIcon("home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="materias"
        options={{
          title: "Matérias",
          headerShown: pathname === "/materias",
          tabBarIcon: tabIcon("book", "book-outline"),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendário",
          tabBarIcon: tabIcon("calendar", "calendar-outline"),
        }}
      />
      <Tabs.Screen
        name="resumo"
        options={{
          title: "Resumo",
          headerShown: pathname === "/resumo",
          tabBarIcon: tabIcon("stats-chart", "stats-chart-outline"),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title:
            pathname === "/perfil/configuracoes"
              ? "Configurações"
              : "Perfil",
          headerShown: true,
          headerLeft:
            pathname === "/perfil/configuracoes"
              ? () => (
                  <Pressable
                    onPress={() => router.back()}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={24}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 16,
                      }}
                    >
                      Voltar
                    </Text>
                  </Pressable>
                )
              : undefined,
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}
