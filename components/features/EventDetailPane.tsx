/**
 * Panneau d'informations d'une soirée, déplié depuis `EventSpotlight` au tap
 * sur l'affiche active. Contenu migré de l'ancien `EventCard` (supprimé au
 * chantier 2) : même mise en page, sans le titre ni l'artiste — déjà visibles
 * en permanence sur l'affiche, repliée comme dépliée — et sans le second
 * niveau de repli du programme : le tap qui ouvre ce panneau joue déjà ce
 * rôle, un second toggle imbriqué ferait doublon.
 *
 * Le bouton « J'y serai » SIMULÉ : la participation bascule localement
 * (AsyncStorage `demo:rsvp:*`) et déclenche un toast. Rien n'est envoyé.
 */
import { memo, useCallback } from 'react';
import { Linking, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { styled, Text, Theme, View, XStack, YStack } from 'tamagui';

import { SeatsGauge } from '@/components/features/SeatsGauge';
import { useToast } from '@/components/toast/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, shadows, tabularNums, type } from '@/constants/theme';
import type { GuinguetteEvent } from '@/data/events';
import { useDemoFlag } from '@/hooks/useDemoFlag';

const Pane = styled(View, {
  name: 'EventDetailPane',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$md',
  overflow: 'hidden',
  padding: '$md',
  gap: '$sm',
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

type EventDetailPaneProps = { event: GuinguetteEvent };

function EventDetailPaneComponent({ event }: EventDetailPaneProps) {
  const { enabled, toggle } = useDemoFlag(`rsvp:${event.id}`);
  const { showToast } = useToast();
  const reduceMotion = useReducedMotion();

  const handleRsvp = useCallback(() => {
    const going = toggle();
    showToast(
      going ? 'C’est noté, on vous garde une place ! (démo)' : 'Participation annulée (démo)'
    );
  }, [showToast, toggle]);

  const handleArtistLink = useCallback(() => {
    if (event.artistUrl) Linking.openURL(event.artistUrl);
  }, [event.artistUrl]);

  return (
    // Le thème de la soirée peint tout le panneau — et bascule au vert dès
    // que la participation est annoncée, comme sur l'ancienne carte.
    <Theme name={enabled ? 'secondary' : event.theme}>
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.duration(220).reduceMotion(ReduceMotion.System)}
        exiting={reduceMotion ? undefined : FadeOut.duration(140).reduceMotion(ReduceMotion.System)}
      >
        <Pane style={shadows.card}>
          <XStack alignItems="center" gap="$xs">
            <Icon name="calendar" size={14} color={colors.primary} />
            <Text style={styles.date}>{event.when}</Text>
          </XStack>

          <Body>{event.description}</Body>

          <YStack gap="$sm">
            {event.program.map((step) => (
              <XStack key={step.time} gap="$base" alignItems="flex-start">
                <StepTime>{step.time}</StepTime>
                <StepLabel>{step.label}</StepLabel>
              </XStack>
            ))}
          </YStack>

          <SeatsGauge capacity={event.capacity} taken={event.taken} />

          <XStack alignItems="center" justifyContent="space-between" gap="$sm">
            <PriceTag>{event.price}</PriceTag>

            <Button
              tone="ghost"
              size="sm"
              circular
              disabled={!event.artistUrl}
              accessibilityLabel={
                event.artistUrl ? `Voir la page de ${event.artist}` : 'Lien artiste indisponible'
              }
              onPress={handleArtistLink}
            >
              <Button.Icon name="link" />
            </Button>
          </XStack>

          <Button full accessibilityState={{ selected: enabled }} onPress={handleRsvp}>
            {enabled && <Button.Icon name="check" />}
            <Button.Text>Participer</Button.Text>
          </Button>
        </Pane>
      </Animated.View>
    </Theme>
  );
}

export const EventDetailPane = memo(EventDetailPaneComponent);

const styles = StyleSheet.create({
  date: {
    // « Vendredi 8 août • 20h00 » : de la phrase, pas un libellé en
    // capitales — donc `caption`, sans le chasse de +0,6.
    ...type.caption,
    ...tabularNums,
    color: colors.primary,
  },
});
