/**
 * « À l'affiche » — la soirée d'une page de journal : son affiche, puis son
 * panneau d'informations.
 *
 * ⚠️ **Ce composant ne navigue plus.** Il portait un carrousel (tap et swipe
 * pour changer de soirée, glissement à trois affiches) ; depuis le 6 août
 * 2026, c'est **toute la page** qui se feuillette d'un bloc
 * (`NewspaperPager`), et une soirée ne quitte plus jamais son artiste. Il ne
 * reste ici qu'une soirée, montrée. La navigation vit dans
 * `app/(tabs)/soirees.tsx` — le geste sur la feuille et la rangée de
 * pastilles, rien d'autre.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Text, Theme, View, XStack, YStack } from 'tamagui';

import { EventDetailPane } from '@/components/features/EventDetailPane';
import {
  Kicker,
  PosterContent,
  PosterMeta,
  PosterShell,
  PosterTitle,
  tagLabelStyle,
} from '@/components/features/SpotlightParts';
import { colors, tabularNums } from '@/constants/theme';
import type { GuinguetteEvent } from '@/data/events';

type EventSpotlightProps = {
  /** Titre de la section — « À l'affiche »… */
  kicker: string;
  event: GuinguetteEvent;
  /**
   * Repère de pagination (« 2 / 3 »), affiché à droite du kicker sur la même
   * ligne — demande de Jonathan, 11 août 2026 : il vivait seul dans l'en-tête
   * fixe de l'écran (`app/(tabs)/soirees.tsx`), sur sa propre ligne, ce qui
   * poussait le journal — le contenu principal — plus bas qu'il ne le
   * faudrait. Recevoir un texte déjà formaté plutôt que `index`/`total` :
   * `EventSpotlight` ne sait rien de la pagination, il ne fait qu'afficher.
   */
  pageLabel?: string;
};

function EventSpotlightComponent({ kicker, event, pageLabel }: EventSpotlightProps) {
  const reduceMotion = useReducedMotion();

  return (
    <YStack gap="$sm">
      <XStack alignItems="center" gap="$sm">
        {/* `flex={1}` + `numberOfLines={1}` : même parade que le titre d'une
            liste de La Carte dans sa rangée — sans eux, un kicker long
            pousserait le repère de pagination hors du cadre au lieu de se
            tronquer proprement devant lui. */}
        <Kicker flex={1} numberOfLines={1}>
          {kicker}
        </Kicker>
        {/* `tabularNums` : il se réécrit à chaque tour de page, une chasse
            fixe lui évite de tressauter en largeur — ne marche que sur
            Karla, la police du kicker. */}
        {pageLabel !== undefined && <Kicker style={tabularNums}>{pageLabel}</Kicker>}
      </XStack>

      <PosterShell>
        <PosterContent>
          <Image
            source={event.image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={reduceMotion ? 0 : 300}
            accessibilityLabel={event.alt}
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
              backgroundColor={event.tagColor}
              paddingHorizontal="$sm"
              paddingVertical="$xs"
              borderRadius="$pill"
            >
              <Text style={[tagLabelStyle, { color: event.tagTextColor }]}>{event.tag}</Text>
            </View>
          </XStack>

          {/*
            Sur la photo, c'est le thème « lampion » qui donne le voile sombre
            et le texte clair — aucune couleur écrite ici.

            ⚠️ Plus de pastille de compte à rebours ici — demande de Jonathan,
            7 août 2026 : la pastille qui clignotait (« J-7 · 18 h ») a sauté.
            `Countdown` (`components/features/Countdown.tsx`) n'a plus aucun
            appelant dans l'app et a été supprimé avec elle, ainsi que
            `countdownTo`/`formatCountdown` dans `utils/date.ts`, restés sans
            utilisateur.
          */}
          <Theme name="lampion">
            <YStack gap="$base" padding="$md">
              <PosterTitle>{event.title}</PosterTitle>
              <PosterMeta>{`${event.artist} · ${event.when}`}</PosterMeta>
            </YStack>
          </Theme>
        </PosterContent>
      </PosterShell>

      <EventDetailPane event={event} />
    </YStack>
  );
}

export const EventSpotlight = memo(EventSpotlightComponent);
