import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Stack';
import { GlassSurface } from '../primitives/GlassSurface';
import { Icon, type IconName } from '../icons/Icon';
import { settle } from '../motion';

export type ToastTone = 'neutral' | 'success' | 'danger';

interface ToastRecord {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (message: string, options?: { tone?: ToastTone; duration?: number }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_ICON: Record<ToastTone, IconName> = {
  neutral: 'edit',
  success: 'check',
  danger: 'close',
};

function ToastCard({ toast }: { toast: ToastRecord }) {
  const theme = useTheme();
  const toneColor =
    toast.tone === 'success'
      ? theme.colors.success
      : toast.tone === 'danger'
        ? theme.colors.danger
        : theme.colors.ink;

  return (
    <Animated.View
      entering={ZoomIn.springify()
        .damping(theme.motion.springs.bouncy.damping)
        .stiffness(theme.motion.springs.bouncy.stiffness)}
      exiting={FadeOut.duration(150)}
      layout={settle(theme.motion.springs.gentle)}
    >
      <Row
        gap="sm"
        px="md"
        py="sm"
        bg={theme.material ? undefined : 'surface'}
        rounded="md"
        shadow="card"
        style={{ borderWidth: theme.borders.regular, borderColor: theme.colors.border }}
      >
        {theme.material ? (
          <GlassSurface
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { borderRadius: theme.radii.md }]}
          />
        ) : null}
        <Icon name={TONE_ICON[toast.tone]} size={16} color={toneColor} />
        <Text variant="label">{toast.message}</Text>
      </Row>
    </Animated.View>
  );
}

/**
 * Mount once near the app root; call `useToast().show('Saved!')` anywhere.
 * Toasts pop in at the top with a bounce and stack without jumping.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const counter = useRef(0);

  const show = useCallback<ToastApi['show']>((message, options) => {
    const id = ++counter.current;
    setToasts((current) => [...current, { id, message, tone: options?.tone ?? 'neutral' }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, options?.duration ?? 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <SafeAreaView
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { alignItems: 'center', paddingTop: 24 }]}
      >
        <Box gap="sm" align="center">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} />
          ))}
        </Box>
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside a <ToastProvider>');
  return api;
}
