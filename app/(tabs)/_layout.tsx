/**
 * Navigation par onglets : les quatre écrans partagent le même header et la même barre
 * basse, et l'onglet actif est déduit de la route par Expo Router.
 * C'est aussi ici que se décide *comment* on passe d'un écran à l'autre : la
 * transition (`sceneStyleInterpolator`) est définie à cet endroit et nulle
 * part ailleurs.
 *
 * ⚠️ Navigation **au tap uniquement** — pas de swipe au doigt entre onglets.
 * Il y en a eu un (`SwipeTabsArea`, `components/layout/SwipeTabs.tsx`),
 * retiré : le même geste servait aussi à naviguer dans l'écran Soirées, ce qui
 * créait une ambiguïté entre « je navigue dans l'écran » et « je change
 * d'onglet ». Le swipe horizontal appartient maintenant au feuilletage de
 * Soirées (`components/features/NewspaperPager.tsx`), la barre d'onglets
 * reprend le tap classique.
 */
import { Tabs } from 'expo-router';
import { Animated, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/AppHeader';
import { TabIcon } from '@/components/layout/TabIcon';
import { colors, radius, spacing, TAB_BAR_HEIGHT, type } from '@/constants/theme';

/** Amplitude du glissement latéral d'un écran qui entre ou qui sort. */
const SHIFT = 44;

/**
 * L'écran actif est à `progress = 0`. Ceux placés avant lui dans la barre sont
 * à -1, ceux placés après à +1 — et l'animation interpole entre les deux. Un
 * écran qui arrive par la droite glisse donc de +44 px vers 0 en apparaissant,
 * pendant que le sortant part vers -44 px : les deux vont dans le même sens,
 * c'est ce qui donne la sensation de suivre le doigt.
 *
 * Seuls `opacity` et `transform` sont animés : ce sont les deux seules
 * propriétés que le driver natif sait porter, et tout le reste ferait repasser
 * l'animation par le thread JS.
 */
const sceneStyleInterpolator = ({ current }: { current: { progress: Animated.Value } }) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-SHIFT, 0, SHIFT],
        }),
      },
      {
        scale: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.94, 1, 0.94],
        }),
      },
    ],
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }],
        sceneStyle: styles.scene,

        // `animation: 'none'` coupe net la transition quand l'utilisateur a
        // désactivé les effets au niveau du système. Sinon on ne renseigne PAS
        // `animation` : le navigateur considère alors qu'il y a animation dès
        // qu'un `transitionSpec` est fourni, et prend le nôtre.
        ...(reduceMotion
          ? { animation: 'none' as const }
          : {
              sceneStyleInterpolator,
              transitionSpec: {
                animation: 'spring' as const,
                config: {
                  stiffness: 240,
                  damping: 26,
                  mass: 1,
                  // Sans ça le ressort dépasse la cible : un écran qui entre
                  // deviendrait brièvement plus opaque que 1, ce qui se voit
                  // sur les fondus.
                  overshootClamping: true,
                  restDisplacementThreshold: 0.01,
                  restSpeedThreshold: 0.01,
                },
              },
            }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          // L'accueil est une photo plein écran : le header s'y pose par-dessus.
          header: () => <AppHeader floating />,
          headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="carte"
        options={{
          title: 'La Carte',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="menu" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="soirees"
        options={{
          title: 'Soirées',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="infos"
        options={{
          title: 'Infos',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="info" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.base,
    elevation: 12,
    shadowColor: colors.dusk,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  item: {
    // ≥ 44 px de large : chaque onglet reste une cible tactile confortable.
    minWidth: 64,
  },
  label: {
    ...type.labelSm,
    marginTop: spacing.xs,
  },
  scene: {
    backgroundColor: colors.background,
  },
});
