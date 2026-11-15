import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formatarPrazo, paraData, somarDias } from '@/utils/datasInicio';

const CANAL_ANDROID = 'lembretes-provas';

export type ConfigLembrete = {
  antecedenciaLembrete: number; // em dias (1, 2, 3...)
  notificacoesAtivas: boolean;
};

// Usado enquanto o usuário não tiver salvo nada na tela Configurações
export const CONFIG_PADRAO: ConfigLembrete = {
  antecedenciaLembrete: 1,
  notificacoesAtivas: true,
};

type ProvaParaLembrete = {
  titulo: string;
  tipo: string; // só agenda quando for 'prova'
  prazo: unknown;
  concluida?: boolean;
  notificacaoId?: string | null;
};

// Lê as configurações salvas pela tela Configurações (Kauã) em
// users/{uid}/configuracoes/preferencias. Se não houver nada, usa o padrão.
export async function obterConfigLembrete(uid: string): Promise<ConfigLembrete> {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'configuracoes', 'preferencias'));
    if (!snap.exists()) return CONFIG_PADRAO;
    const dados = snap.data();
    return {
      antecedenciaLembrete:
        typeof dados.antecedenciaLembrete === 'number'
          ? dados.antecedenciaLembrete
          : CONFIG_PADRAO.antecedenciaLembrete,
      notificacoesAtivas:
        typeof dados.notificacoesAtivas === 'boolean'
          ? dados.notificacoesAtivas
          : CONFIG_PADRAO.notificacoesAtivas,
    };
  } catch {
    return CONFIG_PADRAO;
  }
}

// Guarda na tarefa o id da notificação agendada (ou null quando não há lembrete)
export async function salvarIdLembrete(
  uid: string,
  tarefaId: string,
  notificacaoId: string | null,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'tarefas', tarefaId), { notificacaoId });
}

// Chamar uma vez quando o app abre (no src/app/_layout.tsx).
// Devolve true se o usuário permitiu as notificações.
export async function configurarNotificacoes(): Promise<boolean> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, // mostra mesmo com o app aberto
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Lembretes de prova',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;

  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

// Agenda o lembrete e devolve o id da notificação (salvar em tarefa.notificacaoId).
// Devolve null quando não há nada para agendar.
export async function agendarLembreteProva(
  prova: ProvaParaLembrete,
  config: ConfigLembrete,
  nomeMateria?: string,
): Promise<string | null> {
  if (Platform.OS === 'web') return null; // notificações não funcionam no navegador
  if (!config.notificacoesAtivas || prova.tipo !== 'prova' || prova.concluida) return null;

  const dataProva = paraData(prova.prazo);
  const agora = new Date();
  if (!dataProva || dataProva.getTime() <= agora.getTime()) return null;

  let quando = somarDias(dataProva, -config.antecedenciaLembrete);
  // Se a prova está mais perto do que a antecedência escolhida, avisa logo em seguida
  if (quando.getTime() <= agora.getTime()) {
    quando = new Date(agora.getTime() + 5000);
  }

  const materia = nomeMateria ? `${nomeMateria}, ` : '';

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Prova chegando: ${prova.titulo}`,
      body: `${materia}${formatarPrazo(dataProva)}. Bons estudos!`,
      sound: true,
      data: { tipo: 'lembrete-prova' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: quando,
      channelId: CANAL_ANDROID,
    },
  });
}

export async function cancelarLembrete(notificacaoId?: string | null): Promise<void> {
  if (!notificacaoId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificacaoId);
  } catch {
    // Se a notificação já disparou ou não existe mais, não há o que cancelar
  }
}

// Usar ao criar OU editar uma prova: cancela o lembrete antigo (se houver)
// e agenda um novo com a data e a antecedência atuais.
export async function sincronizarLembreteProva(
  prova: ProvaParaLembrete,
  config: ConfigLembrete,
  nomeMateria?: string,
): Promise<string | null> {
  await cancelarLembrete(prova.notificacaoId);
  return agendarLembreteProva(prova, config, nomeMateria);
}

// Útil para testar e para a apresentação: dispara em 5 segundos.
export async function enviarNotificacaoTeste(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Studify',
      body: 'As notificações estão funcionando!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CANAL_ANDROID,
    },
  });
}