/**
 * Barre supérieure, identique sur les quatre onglets.
 * Elle n'est déclarée qu'ici et branchée dans
 * app/(tabs)/_layout.tsx : c'est la source unique de la navigation haute.
 * Variante `floating` : sur l'accueil, le header se pose par-dessus la photo
 * plein écran, sans fond opaque.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, spacing, type } from '@/constants/theme';
import { venue } from '@/data/venue';
import { useReserve } from '@/features/reserve/ReserveProvider';

type AppHeaderProps = {
  floating?: boolean;
};

function AppHeaderComponent({ floating = false }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { open } = useReserve();

  return (
    <View
      style={[
        styles.header,
        floating ? styles.headerFloating : styles.headerSolid,
        { paddingTop: insets.top + spacing.base },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.brand, floating && styles.brandFloating]}
        accessibilityRole="header"
      >
        {venue.name}
      </Text>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Réserver une table"
        scaleTo={0.9}
        onPress={open}
        style={styles.callButton}
      >
        <Icon
          name="call"
          size={20}
          color={floating ? colors.surfaceContainerLowest : colors.primary}
        />
      </PressableScale>
    </View>
  );
}

export const AppHeader = memo(AppHeaderComponent);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.base,
  },
  headerSolid: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  headerFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  brand: {
    // Le 19/26 vivait ici en dur : il est désormais nommé dans l'échelle.
    ...type.headlineSm,
    color: colors.primary,
    flexShrink: 1,
  },
  brandFloating: {
    color: colors.surfaceContainerLowest,
    textShadowColor: colors.duskShade,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  callButton: {
    // 20 px d'icône + 2 × 12 : cible tactile de 44 px.
    padding: spacing.sm,
    marginRight: -spacing.base,
    borderRadius: radius.pill,
  },
});
