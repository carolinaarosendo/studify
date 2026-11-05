import { Redirect } from 'expo-router';

// Ponto de entrada do app.
// Kauã: aqui entra a lógica de primeiro acesso (boas-vindas) e de usuário logado (login x abas).
export default function Index() {
  return <Redirect href="/(tabs)" />;
}