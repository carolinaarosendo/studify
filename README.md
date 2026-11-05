# Studify

App mobile em React Native (Expo) para organizar a vida acadêmica: matérias, tarefas, provas, calendário e lembretes, com dados no Firebase.

> README inicial — a versão completa (prints, divisão de tarefas) será feita pela Luiza Eduarda.

## Como rodar

```bash
git clone https://github.com/carolinaarosendo/studify.git
cd studify
npm install
cp .env.example .env   # preencha com as chaves do Firebase
npx expo start
```

Abra o app **Expo Go** no celular e leia o QR Code (o celular e o computador precisam estar na mesma rede Wi-Fi).

## Estrutura

```
src/
  app/          telas e rotas (Expo Router)
  components/   componentes reutilizáveis (Button, Input, Card, EmptyState, Loading, Screen)
  constants/    tema (cores, espaçamentos)
  contexts/     estado global (Context API)
  hooks/        hooks personalizados
  services/     acesso ao Firebase
  types/        tipos compartilhados
```

## Git Flow

- `main`: versão final
- `develop`: integração
- `feature/<nome>`: uma branch por integrante, criada a partir da `develop`
- Todo PR vai para a `develop` e precisa da revisão de outra pessoa do grupo.