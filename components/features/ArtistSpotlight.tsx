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
 *
 * ⚠️ **Plus de badge de style ni de sous-ligne sur l'affiche** — demande de
 * Jonathan, 7 août 2026 : seul le nom de l'artiste reste, posé dans un
 * panneau « verre » qui reprend le traitement du bouton « Réserver une
 * table » de l'accueil (`Button.tsx`, `tone="glass"` : flou natif via
 * `expo-blur` derrière un voile teinté, liseré translucide). Sur Android,
 * `expo-blur` ne floute rien sans qu'on lui désigne explicitement une cible
 * (`blurTarget`) — ici la photo de l'artiste, via `photoRef`. `EventSpotlight`
 * garde son badge et sa sous-ligne : cette retouche ne touche qu'Artist Spot.
 */
import { BlurTargetView, BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useRef } from 'react';
import { StyleSheet, Text, View, type View as RNViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { YStack } from 'tamagui';

import { ArtistDetailPane } from '@/components/features/ArtistDetailPane';
import { Kicker, PosterContent, PosterShell } from '@/components/features/SpotlightParts';
import { colors, radius, spacing, type } from '@/constants/theme';
import type { Artist } from '@/data/artists';
import type { GuinguetteEvent } from '@/data/events';

type ArtistSpotlightProps = {
  /** Titre de la section — « Artist Spot ». */
  kicker: string;
  artist: Artist;
  /** La soirée de la page — celle que cet artiste vient jouer. */
  event: GuinguetteEvent;
};

function ArtistSpotlightComponent({ kicker, artist, event: event }: ArtistSpotlightProps) {
  const reduceMotion = useReducedMotion();

  /**
   * La cible du flou du panneau « verre » du nom — même dispositif que les
   * deux boutons de l'accueil (`app/(tabs)/index.tsx`) : une seule cible,
   * qui enveloppe tout ce qui doit apparaître dans le verre (ici, seulement
   * la photo). Ce qui reste dehors — le panneau lui-même — ne s'y voit pas,
   * c'est l'effet recherché.
   */
  const photoRef = useRef<RNViewInstance | null>(null);

  return (
    <YStack gap="$sm">
      <Kicker>{kicker}</Kicker>

      <PosterShell>
        <PosterContent>
          <BlurTargetView ref={photoRef} style={StyleSheet.absoluteFill}>
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
          </BlurTargetView>

          <View style={styles.nameWrap}>
            <View style={styles.glassPanel}>
              <BlurView
                intensity={40}
                tint="dark"
                blurMethod="dimezisBlurView"
                blurTarget={photoRef}
                style={StyleSheet.absoluteFill}
              />
              <View style={[StyleSheet.absoluteFill, styles.glassTint]} pointerEvents="none" />
              <Text style={styles.glassName}>{artist.name}</Text>
            </View>
          </View>
        </PosterContent>
      </PosterShell>

      <ArtistDetailPane artist={artist} event={event} />
    </YStack>
  );
}

export const ArtistSpotlight = memo(ArtistSpotlightComponent);

const styles = StyleSheet.create({
  nameWrap: {
    padding: spacing.md,
    // Centre le panneau dans la largeur de l'affiche — `alignSelf: 'flex-start'`
    // sur `glassPanel` le laissait plaqué à gauche. Demande de Jonathan,
    // 7 août 2026.
    alignItems: 'center',
  },
  glassPanel: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassEdge,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  glassTint: {
    backgroundColor: colors.duskShade,
  },
  glassName: {
    // `headlineMd` plutôt que `headlineLg` : trop grand une fois seul dans le
    // panneau, sans plus de sous-ligne pour l'accompagner. Même demande,
    // 7 août 2026.
    ...type.headlineMd,
    color: colors.surfaceContainerLowest,
    textAlign: 'center',
  },
});
