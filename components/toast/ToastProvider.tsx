/**
 * Toasts de confirmation (port de src/toast.js). Empilés au-dessus de la barre
 * d'onglets, ils apparaissent et disparaissent via Reanimated ; le minuteur ne
 * sert qu'à décider de la durée de vie, jamais à animer.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';

import { colors, radius, spacing, TAB_BAR_HEIGHT, type } from '@/constants/theme';

const TOAST_DURATION = 2600;

type Toast = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé sous <ToastProvider>');
  }
  return context;
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const showToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message }]);

    const timer = setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION);
    timers.current.push(timer);
  }, []);

  // Les minuteurs survivraient au démontage et déclencheraient un setState
  // sur un composant disparu : on les purge explicitement.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.length = 0;
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="none"
        style={[styles.container, { bottom: TAB_BAR_HEIGHT + insets.bottom + spacing.md }]}
      >
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(250).reduceMotion(ReduceMotion.System)}
            style={styles.toast}
          >
            <Text style={styles.message}>{toast.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    alignItems: 'center',
    gap: spacing.base,
  },
  toast: {
    backgroundColor: colors.inverseSurface,
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  message: {
    // Trois surcharges disaient déjà « ce n'est pas un micro-libellé en
    // capitales mais une phrase » : c'est exactement `type.caption`.
    ...type.caption,
    color: colors.inverseOnSurface,
    textAlign: 'center',
  },
});
