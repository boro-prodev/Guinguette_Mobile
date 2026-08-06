/**
 * « Artist Spot » — l'artiste de la soirée, sur la même page de journal
 * qu'elle : son affiche, puis sa fiche (bio, style, liens).
 *
 * ⚠️ **Ce composant ne navigue plus**, et n'a plus à se synchroniser avec
 * « À l'affiche » : depuis que la page entière se feuillette d'un bloc
 * (`NewspaperPager`, 6 août 2026), une soirée et son artiste sont **sur la
 * même feuille**. L'`activeEventId` qui reliait les deux carrousels n'a plus
 * d'objet — c'est la page qui les tient ensemble.
 *
 * ⚠️ **Pas de `Countdown` ici** — demande de Jonathan, 6 août 2026 : le
 * pastille « J-12 · 5 h » et son point qui bat n'apparaissent que sur la
 * première affiche (« À l'affiche », `EventSpotlight`). La répéter sur celle
 * de l'artiste doublait l'information sans rien ajouter, et faisait battre
 * deux points sur la même page.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Text, Theme, View, XStack, YStack } from 'tamagui';

import { ArtistDetailPane } from '@/components/features/ArtistDetailPane';
import {
  Kicker,
  PosterContent,
  PosterMeta,
  PosterShell,
  PosterTitle,
  tagLabelStyle,
} from '@/components/features/SpotlightParts';
import { colors } from '@/constants/theme';
import type { Artist } from '@/data/artists';
import type { GuinguetteEvent } from '@/data/events';

type ArtistSpotlightProps = {
  /** Titre de la section — « Artist Spot ». */
  kicker: string;
  artist: Artist;
  /** La soirée de la page — celle que cet artiste vient jouer. */
  event: GuinguetteEvent;
};

function ArtistSpotlightComponent({ kicker, artist, event }: ArtistSpotlightProps) {
  const reduceMotion = useReducedMotion();

  return (
    <YStack gap="$sm">
      <Kicker>{kicker}</Kicker>

      <PosterShell>
        <PosterContent>
          <Image
            source={artist.image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={reduceMotion ? 0 : 300}
            accessibilityLabel={artist.alt}
            cachePolicy="memory-disk"
          />

          <LinearGradient
            pointerEvents="none"
            colors={[colors.duskFade, colors.duskVeil]}
            locations={[0.35, 1]}
            style={StyleSheet.absoluteFill}
          />

          <XStack position="absolute" top="$md" left="$md">
            <View
              backgroundColor={colors.tertiaryFixed}
              paddingHorizontal="$sm"
              paddingVertical="$xs"
              borderRadius="$pill"
            >
              <Text style={[tagLabelStyle, { color: colors.onTertiaryFixed }]}>{artist.style}</Text>
            </View>
          </XStack>

          <Theme name="lampion">
            <YStack gap="$base" padding="$md">
              <PosterTitle>{artist.name}</PosterTitle>
              <PosterMeta>{`${event.title} · ${event.when}`}</PosterMeta>
            </YStack>
          </Theme>
        </PosterContent>
      </PosterShell>

      <ArtistDetailPane artist={artist} event={event} />
    </YStack>
  );
}

export const ArtistSpotlight = memo(ArtistSpotlightComponent);
