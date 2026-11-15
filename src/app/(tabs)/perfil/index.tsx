
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Card } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  const [fotoLocal, setFotoLocal] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarFoto() {
      if (!user?.uid) return;

      try {
        const chave = `@studify:foto-perfil:${user.uid}`;
        const uri = await AsyncStorage.getItem(chave);

        if (!uri) return;

        const arquivo = new File(uri);

        if (arquivo.exists && ativo) {
          setFotoLocal(uri);
        } else {
          await AsyncStorage.removeItem(chave);
        }
      } catch {
        if (ativo) setFotoLocal(null);
      }
    }

    carregarFoto();

    return () => {
      ativo = false;
    };
  }, [user?.uid]);

  async function selecionarFoto(origem: 'galeria' | 'camera') {
    if (!user?.uid) return;

    try {
      let resultado: ImagePicker.ImagePickerResult;

      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissao.granted) {
          Alert.alert(
            'Permissão necessária',
            'Permita o acesso à câmera para tirar uma foto.',
          );
          return;
        }

        resultado = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        resultado = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (resultado.canceled || !resultado.assets?.length) return;

      const imagemSelecionada = new File(resultado.assets[0].uri);
      const destino = new File(
        Paths.document,
        `foto-perfil-${user.uid}-${Date.now()}.jpg`,
      );

      await imagemSelecionada.copy(destino);

      const chave = `@studify:foto-perfil:${user.uid}`;
      const fotoAnterior = await AsyncStorage.getItem(chave);

      await AsyncStorage.setItem(chave, destino.uri);
      setFotoLocal(destino.uri);

      if (fotoAnterior) {
        try {
          const arquivoAnterior = new File(fotoAnterior);
          if (arquivoAnterior.exists) arquivoAnterior.delete();
        } catch {
        }
      }

      Alert.alert('Tudo certo!', 'Sua foto de perfil foi atualizada.');
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível atualizar sua foto. Tente novamente.',
      );
    }
  }

  function abrirOpcoesFoto() {
    Alert.alert('Foto de perfil', 'Como deseja adicionar sua foto?', [
      {
        text: 'Escolher da galeria',
        onPress: () => {
          void selecionarFoto('galeria');
        },
      },
      {
        text: 'Tirar uma foto',
        onPress: () => {
          void selecionarFoto('camera');
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  }

  async function handleLogout() {
    setSaindo(true);

    try {
      await logout();
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível sair da sua conta. Tente novamente.',
      );
      setSaindo(false);
    }
  }

  function confirmarLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza de que deseja sair do Studify?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
    );
  }

  const fotoExibida = fotoLocal || user?.photoURL;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <View style={styles.perfil}>
        <Pressable onPress={abrirOpcoesFoto} style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {fotoExibida ? (
              <Image
                source={{ uri: fotoExibida }}
                style={styles.foto}
              />
            ) : (
              <Ionicons
                name="person"
                size={42}
                color={colors.textSecondary}
              />
            )}
          </View>

          <View style={styles.iconeCamera}>
            <Ionicons name="camera" size={17} color="#fff" />
          </View>
        </Pressable>

        <Text style={styles.alterarFoto}>Alterar foto</Text>

        <Text style={styles.nome}>
          {user?.displayName || 'Estudante'}
        </Text>

        <Text style={styles.email}>
          {user?.email || 'E-mail não disponível'}
        </Text>
      </View>

      <Text style={styles.tituloSecao}>Minha conta</Text>

      <Card onPress={() => router.push('/perfil/dados-conta')}>
        <View style={styles.linha}>
          <View style={styles.icone}>
            <Ionicons
              name="person-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.textos}>
            <Text style={styles.tituloItem}>Dados da conta</Text>
            <Text style={styles.descricao}>
              Visualize suas informações pessoais.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </Card>

      <Text style={styles.tituloSecao}>Preferências</Text>

      <Card onPress={() => router.push('/perfil/configuracoes')}>
        <View style={styles.linha}>
          <View style={styles.icone}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.textos}>
            <Text style={styles.tituloItem}>Configurações</Text>
            <Text style={styles.descricao}>
              Preferências e segurança da sua conta.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </Card>

      <Text style={styles.tituloSecao}>Sessão</Text>

      <Card onPress={confirmarLogout}>
        <View style={styles.linha}>
          <View style={styles.icone}>
            <Ionicons
              name="log-out-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.textos}>
            <Text style={styles.tituloItem}>Logout</Text>
            <Text style={styles.descricao}>
              Encerre sua sessão no Studify.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 32,
  },
  perfil: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  iconeCamera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  alterarFoto: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  nome: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tituloSecao: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icone: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
    gap: spacing.xs,
  },
  tituloItem: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  descricao: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
