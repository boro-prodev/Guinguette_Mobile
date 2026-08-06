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
import { Theme, useTheme, XStack, YStack } from 'tamagui';

import { Body, Pane } from '@/components/features/SpotlightParts';
import { Button } from '@/components/ui/Button';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { shadows } from '@/constants/theme';
import type { Artist } from '@/data/artists';
import type { GuinguetteEvent } from '@/data/events';

type ArtistDetailPaneProps = { artist: Artist; event: GuinguetteEvent };

function ArtistDetailContent({ artist, event }: ArtistDetailPaneProps) {
  const reduceMotion = useReducedMotion();
  // Le globe du site web reste teinté par le thème de la soirée, comme avant —
  // seuls Facebook et Instagram, plus bas, portent leur couleur de marque fixe.
  const theme = useTheme();
  const websiteColor = String(theme.onSoft?.val);

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
        {/*
          Demande de Jonathan, 6 août 2026 : « mettre les réseaux de l'artiste
          un peu plus en avant ». Ce que ça a changé, aucune fois ne touchant à
          la mécanique (mêmes trois pastilles, même `Linking.openURL`, même
          désactivation si l'URL est vide — voir
          `.claude/rules/donnees-et-demo.md`) :
          - `tone="soft"` plutôt que `ghost` : un disque de couleur douce
            (teinte du thème de la soirée) au lieu d'une icône nue qui se
            fond dans le fond du panneau ;
          - `size="md"` plutôt que `sm` : la cible tactile passe de 36 à
            44 px, la même que partout ailleurs dans l'app.

          7 août 2026 : Facebook et Instagram sont passés à leurs vraies
          couleurs de marque (`SocialIcon`, `components/ui/SocialIcon.tsx`) à
          la place du trait générique d'`Icon.tsx` — plus reconnaissables au
          premier coup d'œil. Le globe du site web reste sur le principe
          habituel (teinte du thème), n'ayant pas de couleur de marque à
          respecter ; seul son pictogramme a changé, le lien en chaîne prêtant
          à confusion avec un simple copier-coller d'URL. La rangée est aussi
          passée en `space-around` (répartie sur toute la largeur du panneau,
          plutôt que tassée à gauche par `gap`).

          Même jour, plus tard : le kicker « Retrouver l'artiste » a sauté —
          Jonathan le jugeait superflu au-dessus de trois pastilles déjà assez
          parlantes. `gap="$md"` (au lieu de `$sm`) sépare maintenant la bio de
          la rangée : la même valeur que le padding de `Pane` (`shadows.card`,
          `padding: '$md'`) qui fixe l'espace entre la rangée et le bas du
          panneau — l'espacement au-dessus de la rangée et en dessous reste
          ainsi identique, sans le kicker pour le porter.
        */}
        <YStack gap="$md">
          <Body>{artist.bio}</Body>
          <XStack justifyContent="space-around" alignItems="center">
            <Button
              tone="soft"
              size="md"
              circular
              disabled={!artist.website}
              accessibilityLabel={
                artist.website ? `Voir le site de ${artist.name}` : 'Site indisponible'
              }
              onPress={openWebsite}
            >
              {/* 18 = `ICON_SIZE.md` dans `Button.tsx`, non exporté : la
                  taille de l'icône native pour ce gabarit de bouton. */}
              <SocialIcon name="website" size={18} color={websiteColor} />
            </Button>

            <Button
              tone="soft"
              size="md"
              circular
              disabled={!artist.instagram}
              accessibilityLabel={
                artist.instagram ? `Voir l’Instagram de ${artist.name}` : 'Instagram indisponible'
              }
              onPress={openInstagram}
            >
              <SocialIcon name="instagram" size={18} />
            </Button>

            <Button
              tone="soft"
              size="md"
              circular
              disabled={!artist.facebook}
              accessibilityLabel={
                artist.facebook ? `Voir le Facebook de ${artist.name}` : 'Facebook indisponible'
              }
              onPress={openFacebook}
            >
              <SocialIcon name="facebook" size={18} />
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
