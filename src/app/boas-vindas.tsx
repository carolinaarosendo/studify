
import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Screen } from '@/components';
import { colors, fontSize, spacing } from '@/constants/theme';

const ONBOARDING_KEY = '@studify:onboarding-completed';

const slides = [
  {
    icon: 'book-outline' as const,
    title: 'Organize seus estudos',
    description:
      'Reúna suas matérias em um só lugar e mantenha sua rotina acadêmica organizada.',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Não perca nenhum prazo',
    description:
      'Cadastre tarefas, provas e compromissos para acompanhar tudo o que precisa fazer.',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Acompanhe sua evolução',
    description:
      'Visualize seu progresso, acompanhe suas atividades e evolua um dia de cada vez.',
  },
];

export default function BoasVindas() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  async function finalizar() {
    if (loading) return;

    setLoading(true);

    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/');
    } catch {
      setLoading(false);
    }
  }

  function avancar() {
    if (loading) return;

    if (isLastSlide) {
      finalizar();
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -45,
        duration: 160,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSlide((previous) => previous + 1);
      translateX.setValue(45);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.logo}>Studify</Text>

          <Text style={styles.skip} onPress={finalizar}>
            Pular
          </Text>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={slide.icon}
              size={76}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>{slide.title}</Text>

          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>

        <View style={styles.bottom}>
          <View style={styles.indicators}>
            {slides.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.indicator,
                  index === currentSlide && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          <Text style={styles.counter}>
            {currentSlide + 1} de {slides.length}
          </Text>

          <Text
            style={[styles.button, loading && styles.disabledButton]}
            onPress={avancar}
          >
            {loading
              ? 'Carregando...'
              : isLastSlide
                ? 'Começar'
                : 'Continuar'}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  skip: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    padding: spacing.sm,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 25,
  },
  bottom: {
    alignItems: 'center',
    gap: spacing.md,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  indicator: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  activeIndicator: {
    width: 26,
    backgroundColor: colors.primary,
  },
  counter: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  button: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
