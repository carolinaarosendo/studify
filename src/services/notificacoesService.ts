
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formatarPrazo, paraData } from '@/utils/datasInicio';

const CANAL_ANDROID = 'lembretes-provas';

export type ConfigLembrete = {
  antecedenciaLembrete: number;
  notificacoesAtivas: boolean;
};

export const CONFIG_PADRAO: ConfigLembrete = {
  antecedenciaLembrete: 15,
  notificacoesAtivas: true,
};

type ProvaParaLembrete = {
  titulo: string;
  tipo: string;
  prazo: unknown;
  concluida?: boolean;
  notificacaoId?: string | null;
};

export async function obterConfigLembrete(
  uid: string,
): Promise<ConfigLembrete> {
  try {
    const snap = await getDoc(
      doc(db, 'users', uid, 'configuracoes', 'preferencias'),
    );

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

export async function salvarConfigLembrete(
  uid: string,
  config: ConfigLembrete,
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'configuracoes', 'preferencias'),
    {
      antecedenciaLembrete: config.antecedenciaLembrete,
      notificacoesAtivas: config.notificacoesAtivas,
    },
    { merge: true },
  );
}

export async function salvarIdLembrete(
  uid: string,
  tarefaId: string,
  notificacaoId: string | null,
): Promise<void> {
  await updateDoc(
    doc(db, 'users', uid, 'tarefas', tarefaId),
    { notificacaoId },
  );
}

export async function configurarNotificacoes(): Promise<boolean> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Lembretes de provas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;

  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function agendarLembreteProva(
  prova: ProvaParaLembrete,
  config: ConfigLembrete,
  nomeMateria?: string,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  if (
    !config.notificacoesAtivas ||
    prova.tipo !== 'prova' ||
    prova.concluida
  ) {
    return null;
  }

  const dataProva = paraData(prova.prazo);
  const agora = new Date();

  if (!dataProva || dataProva.getTime() <= agora.getTime()) {
    return null;
  }

  let quando = new Date(
    dataProva.getTime() - config.antecedenciaLembrete * 60 * 1000,
  );

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

export async function cancelarLembrete(
  notificacaoId?: string | null,
): Promise<void> {
  if (!notificacaoId || Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificacaoId);
  } catch {
  }
}

export async function sincronizarLembreteProva(
  prova: ProvaParaLembrete,
  config: ConfigLembrete,
  nomeMateria?: string,
): Promise<string | null> {
  await cancelarLembrete(prova.notificacaoId);

  return agendarLembreteProva(prova, config, nomeMateria);
}

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
