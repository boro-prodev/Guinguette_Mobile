/**
 * Racine de l'application : chargement des polices, safe-area, gestes, le
 * design system Tamagui, puis les deux fournisseurs de la démo (toasts et
 * parcours de réservation) montés une seule fois pour être accessibles depuis
 * n'importe quel écran.
 */
import { BerkshireSwash_400Regular } from '@expo-google-fonts/berkshire-swash/400Regular';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat/600SemiBold';
import { Karla_400Regular } from '@expo-google-fonts/karla/400Regular';
import { Karla_400Regular_Italic } from '@expo-google-fonts/karla/400Regular_Italic';
import { Karla_600SemiBold } from '@expo-google-fonts/karla/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { ToastProvider } from '@/components/toast/ToastProvider';
import { colors } from '@/constants/theme';
import { ReserveProvider } from '@/features/reserve/ReserveProvider';
import { config } from '@/tamagui.config';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Le splash a déjà pu être masqué (rechargement à chaud) : sans conséquence.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BerkshireSwash_400Regular,
    Karla_400Regular,
    Karla_400Regular_Italic,
    Karla_600SemiBold,
    Caveat_600SemiBold,
  });

  useEffect(() => {
    // On masque le splash même si une police a échoué : mieux vaut une démo
    // avec la police système qu'un écran de démarrage bloqué.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/*
        Pas de mode sombre dans cette app (`userInterfaceStyle: light` dans
        app.json) : le thème est figé sur `light`, et les composants basculent
        d'accent via <Theme name="secondary"> plutôt que par un schéma système.
      */}
      <TamaguiProvider config={config} defaultTheme="light">
        <SafeAreaProvider>
          <ToastProvider>
            <ReserveProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </ReserveProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
