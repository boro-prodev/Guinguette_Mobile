/**
 * Panneau d'informations d'un artiste, toujours affiché sous l'affiche active
 * dans `ArtistSpotlight`. Bio, style musical et liens seulement — jamais de
 * programme, de jauge, de tarif ni de bouton « Participer » : ça reste le
 * territoire d'« À l'affiche » / `EventDetailPane`.
 *
 * Le thème vient de la soirée liée (`event.theme`) : la fiche artiste porte
 * la couleur de son concert, pas de teinte qui lui serait propre.
 *
 * ⚠️ **`Pane` (l'ombre portée) ne se démonte jamais** — même piège et même
 * correctif qu'`EventDetailPane` : voir sa documentation.
 */
import { memo, useCallback } from 'react';
import { Linking } from 'react-native';
import Animated, { FadeIn, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { Theme, XStack, YStack } from 'tamagui';

import { Body, Pane } from '@/components/features/PosterCarousel';
import { Button } from '@/components/ui/Button';
import { shadows } from '@/constants/theme';
import type { Artist } from '@/data/artists';
import type { GuinguetteEvent } from '@/data/events';

type ArtistDetailPaneProps = { artist: Artist; event: GuinguetteEvent };

function ArtistDetailContent({ artist, event }: ArtistDetailPaneProps) {
  const reduceMotion = useReducedMotion();

  const openWebsite = useCallback(() => {
    if (artist.website) Linking.openURL(artist.website);
  }, [artist.website]);

  const openInstagram = useCallback(() => {
    if (artist.instagram) Linking.openURL(artist.instagram);
  }, [artist.instagram]);

  const openFacebook = useCallback(() => {
    if (artist.facebook) Linking.openURL(artist.facebook);
  }, [artist.facebook]);

  return (
    <Theme name={event.theme}>
      <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200).reduceMotion(ReduceMotion.System)}>
        <YStack gap="$sm">
          <Body>{artist.bio}</Body>

          <XStack gap="$sm">
            <Button
              tone="ghost"
              size="sm"
              circular
              disabled={!artist.website}
              accessibilityLabel={
                artist.website ? `Voir le site de ${artist.name}` : 'Site indisponible'
              }
              onPress={openWebsite}
            >
              <Button.Icon name="link" />
            </Button>

            <Button
              tone="ghost"
              size="sm"
              circular
              disabled={!artist.instagram}
              accessibilityLabel={
                artist.instagram ? `Voir l’Instagram de ${artist.name}` : 'Instagram indisponible'
              }
              onPress={openInstagram}
            >
              <Button.Icon name="instagram" />
            </Button>

            <Button
              tone="ghost"
              size="sm"
              circular
              disabled={!artist.facebook}
              accessibilityLabel={
                artist.facebook ? `Voir le Facebook de ${artist.name}` : 'Facebook indisponible'
              }
              onPress={openFacebook}
            >
              <Button.Icon name="facebook" />
            </Button>
          </XStack>
        </YStack>
      </Animated.View>
    </Theme>
  );
}

function ArtistDetailPaneComponent({ artist, event }: ArtistDetailPaneProps) {
  return (
    <Pane style={shadows.card}>
      <ArtistDetailContent key={artist.id} artist={artist} event={event} />
    </Pane>
  );
}

export const ArtistDetailPane = memo(ArtistDetailPaneComponent);
