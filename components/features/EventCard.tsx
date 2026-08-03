/**
 * Carte de soirée, dépliable, avec bouton « J'y serai » SIMULÉ : la
 * participation bascule localement (AsyncStorage `demo:rsvp:*`) et déclenche
 * un toast. Rien n'est envoyé.
 *
 * Deux idées portent l'animation de cette carte :
 *
 * 1. Toute la carte est peinte par UN thème Tamagui — celui de la soirée. Dès
 *    qu'on annonce sa venue, ce thème bascule au vert : la jauge, le compte à
 *    rebours et le bouton virent ensemble, sans qu'aucune couleur ne soit
 *    écrite ici.
 * 2. Le programme détaillé se déplie au toucher, et la carte grandit en
 *    douceur grâce à la transition de disposition de Reanimated — sans elle,
 *    la hauteur sauterait d'un coup.
 */
import { Image } from 'expo-image';
import { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';
import { styled, Text, Theme, View, XStack, YStack } from 'tamagui';

import { Countdown } from '@/components/features/Countdown';
import { SeatsGauge } from '@/components/features/SeatsGauge';
import { useToast } from '@/components/toast/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, shadows, tabularNums, type } from '@/constants/theme';
import type { GuinguetteEvent } from '@/data/events';
import { useDemoFlag } from '@/hooks/useDemoFlag';

const IMAGE_HEIGHT = 208;

const Card = styled(View, {
  name: 'EventCard',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$md',
  overflow: 'hidden',
});

const Title = styled(Text, {
  name: 'EventTitle',
  fontFamily: '$heading',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$color',
});

const Artist = styled(Text, {
  name: 'EventArtist',
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$solid',
});

const Body = styled(Text, {
  name: 'EventBody',
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$muted',
});

const StepTime = styled(Text, {
  name: 'EventStepTime',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  color: '$solid',
  // Largeur fixe : les heures s'alignent en colonne au lieu de tressauter.
  width: 52,
  // …mais la largeur fixe n'alignait que la colonne des LIBELLÉS. Les heures
  // elles-mêmes restaient irrégulières à l'intérieur de leurs 52 px
  // (« 21h15 » 32,9 px contre « 00h00 » 40,3 px) : il fallait aussi la
  // chasse fixe pour que la colonne d'heures s'aligne vraiment.
  fontVariant: ['tabular-nums'],
});

const StepLabel = styled(Text, {
  name: 'EventStepLabel',
  flex: 1,
  fontFamily: '$body',
  fontSize: '$1',
  lineHeight: '$1',
  color: '$muted',
});

const PriceTag = styled(Text, {
  name: 'EventPrice',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  color: '$onSoft',
  backgroundColor: '$soft',
  alignSelf: 'flex-start',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$pill',
  overflow: 'hidden',
});

function EventCardComponent({ event }: { event: GuinguetteEvent }) {
  const { enabled, toggle } = useDemoFlag(`rsvp:${event.id}`);
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleRsvp = useCallback(() => {
    const going = toggle();
    showToast(
      going ? 'C’est noté, on vous garde une place ! (démo)' : 'Participation annulée (démo)'
    );
  }, [showToast, toggle]);

  const toggleProgram = useCallback(() => setExpanded((open) => !open), []);

  return (
    // Le thème de la soirée peint toute la carte — et bascule au vert dès que
    // la participation est annoncée.
    <Theme name={enabled ? 'secondary' : event.theme}>
      <Animated.View
        layout={
          reduceMotion
            ? undefined
            : LinearTransition.springify().damping(20).stiffness(180).reduceMotion(ReduceMotion.System)
        }
      >
        <Card style={shadows.card}>
          <View height={IMAGE_HEIGHT} width="100%">
            <Image
              source={event.image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel={event.alt}
              // Prop d'expo-image, en millisecondes — rien à voir avec la
              // prop `transition` de Tamagui, qui prend un nom d'animation.
              transition={reduceMotion ? 0 : 250}
              cachePolicy="memory-disk"
            />

            <XStack
              position="absolute"
              top="$md"
              left="$md"
              right="$md"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <View
                backgroundColor={event.tagColor}
                paddingHorizontal="$sm"
                paddingVertical="$xs"
                borderRadius="$pill"
              >
                <Text style={[styles.tagLabel, { color: event.tagTextColor }]}>
                  {event.tag}
                </Text>
              </View>
            </XStack>

            {/* Sur la photo, le compte à rebours emprunte le thème lampion :
                voile sombre, texte clair, point ambré. */}
            <View position="absolute" bottom="$md" left="$md">
              <Theme name="lampion">
                <Countdown startsAt={event.startsAt} />
              </Theme>
            </View>
          </View>

          <YStack padding="$md" gap="$sm">
            <XStack alignItems="center" gap="$xs">
              <Icon name="calendar" size={14} color={colors.primary} />
              <Text style={styles.date}>{event.when}</Text>
            </XStack>

            <YStack gap="$0">
              <Title>{event.title}</Title>
              <Artist>{event.artist}</Artist>
            </YStack>

            <Body>{event.description}</Body>

            <SeatsGauge capacity={event.capacity} taken={event.taken} />

            <Button
              tone="ghost"
              size="sm"
              alignSelf="flex-start"
              paddingHorizontal="$0"
              accessibilityState={{ expanded }}
              onPress={toggleProgram}
            >
              <Button.Text>{expanded ? 'Masquer le programme' : 'Le programme'}</Button.Text>
              <View transition={reduceMotion ? null : 'medium'} rotate={expanded ? '180deg' : '0deg'}>
                <Button.Icon name="chevron" strokeWidth={2} />
              </View>
            </Button>

            {expanded && (
              <Animated.View
                entering={reduceMotion ? undefined : FadeIn.duration(220).reduceMotion(ReduceMotion.System)}
                exiting={reduceMotion ? undefined : FadeOut.duration(140).reduceMotion(ReduceMotion.System)}
              >
                <YStack gap="$sm">
                  {event.program.map((step) => (
                    <XStack key={step.time} gap="$base" alignItems="flex-start">
                      <StepTime>{step.time}</StepTime>
                      <StepLabel>{step.label}</StepLabel>
                    </XStack>
                  ))}
                  <PriceTag>{event.price}</PriceTag>
                </YStack>
              </Animated.View>
            )}

            <Button
              full
              accessibilityState={{ selected: enabled }}
              onPress={handleRsvp}
            >
              {enabled && <Button.Icon name="check" />}
              <Button.Text>{enabled ? 'Je serai là !' : 'J’y serai'}</Button.Text>
            </Button>
          </YStack>
        </Card>
      </Animated.View>
    </Theme>
  );
}

export const EventCard = memo(EventCardComponent);

const styles = StyleSheet.create({
  tagLabel: {
    // Les capitales sont une mise en forme : `events.ts` garde « Musique
    // Live » en casse naturelle, la transformation se fait ici — comme dans
    // `Button.tsx`, qui posait déjà le motif.
    ...type.labelSm,
    textTransform: 'uppercase',
  },
  date: {
    // « Vendredi 8 août • 20h00 » : de la phrase, pas un libellé en
    // capitales — donc `caption`, sans le chasse de +0,6.
    ...type.caption,
    ...tabularNums,
    color: colors.primary,
  },
});
