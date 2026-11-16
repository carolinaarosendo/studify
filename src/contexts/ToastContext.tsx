
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error';

type ToastContextData = {
  showToast: (
    message: string,
    type?: ToastType,
    description?: string
  ) => void;
  showSuccessScreen: (
    message: string,
    description?: string
  ) => void;
};

const ToastContext = createContext<ToastContextData>({
  showToast: () => {},
  showSuccessScreen: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    description?: string;
  } | null>(null);

  const [successScreen, setSuccessScreen] = useState<{
    message: string;
    description?: string;
  } | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.5)).current;

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      description?: string
    ) => {
      opacity.setValue(0);
      scale.setValue(0.8);

      setToast({ message, type, description });

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2200),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    },
    [opacity, scale]
  );

  const showSuccessScreen = useCallback(
    (message: string, description?: string) => {
      successOpacity.stopAnimation();
      successScale.stopAnimation();

      successOpacity.setValue(0);
      successScale.setValue(0.5);

      setSuccessScreen({ message, description });

      Animated.sequence([
        Animated.parallel([
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.spring(successScale, {
            toValue: 1,
            friction: 4,
            tension: 65,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1700),
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setSuccessScreen(null);
        }
      });
    },
    [successOpacity, successScale]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccessScreen }}>
      {children}

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity,
              transform: [{ scale }],
              backgroundColor:
                toast.type === 'success' ? '#2E7D32' : '#C62828',
            },
          ]}
        >
          <Ionicons
            name={
              toast.type === 'success'
                ? 'checkmark-circle'
                : 'alert-circle'
            }
            size={30}
            color="#fff"
          />

          <View style={styles.content}>
            <Text style={styles.title}>{toast.message}</Text>

            {toast.description && (
              <Text style={styles.description}>
                {toast.description}
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      <Modal
        visible={successScreen !== null}
        animationType="none"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setSuccessScreen(null)}
      >
        {successScreen && (
          <View style={styles.successOverlay}>
            <Animated.View
              style={[
                styles.successContent,
                {
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark"
                  size={68}
                  color="#2E9D61"
                />
              </View>

              <Text style={styles.successTitle}>
                {successScreen.message}
              </Text>

              {successScreen.description && (
                <Text style={styles.successDescription}>
                  {successScreen.description}
                </Text>
              )}

              <Text style={styles.successBrand}>STUDIFY</Text>
            </Animated.View>
          </View>
        )}
      </Modal>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    elevation: 6,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: '#fff',
    fontSize: 13,
  },
  successOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F7FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E3F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    color: '#173B2A',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    color: '#687B70',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  successBrand: {
    color: '#2E9D61',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 55,
  },
});
