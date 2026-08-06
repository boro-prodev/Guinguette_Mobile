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

import { Countdown } from '@/components/features/Countdown';
import { EventDetailPane } from '@/components/features/EventDetailPane';
import {
  Kicker,
  PosterContent,
  PosterMeta,
  PosterShell,
  PosterTitle,
  tagLabelStyle,
} from '@/components/features/SpotlightParts';
import { colors } from '@/constants/theme';
import type { GuinguetteEvent } from '@/data/events';

type EventSpotlightProps = {
  /** Titre de la section — « À l'affiche »… */
  kicker: string;
  event: GuinguetteEvent;
};

function EventSpotlightComponent({ kicker, event }: EventSpotlightProps) {
  const reduceMotion = useReducedMotion();

  return (
    <YStack gap="$sm">
      <Kicker>{kicker}</Kicker>

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

          {/* Sur la photo, c'est le thème « lampion » qui donne le voile sombre
              et le texte clair — aucune couleur écrite ici. */}
          <Theme name="lampion">
            <YStack gap="$base" padding="$md">
              <Countdown startsAt={event.startsAt} />
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
