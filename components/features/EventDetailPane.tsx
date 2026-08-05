/**
 * Panneau d'informations d'une soirée, toujours affiché sous l'affiche active
 * dans `EventSpotlight`. Contenu migré de l'ancien `EventCard` (supprimé au
 * chantier 2) : même mise en page, sans le titre ni l'artiste — déjà visibles
 * en permanence sur l'affiche — et sans second niveau de repli pour le
 * programme.
 *
 * Le lien vers l'artiste vit désormais dans « Artist Spot »
 * (`ArtistDetailPane`) : ce panneau-ci ne parle que de la soirée.
 *
 * Le bouton « Participer » SIMULÉ : la participation bascule localement
 * (AsyncStorage `demo:rsvp:*`) et déclenche un toast. Rien n'est envoyé.
 *
 * ⚠️ **`Pane` (l'ombre portée) ne se démonte jamais.** Remonter tout le
 * panneau à chaque changement de soirée faisait clignoter l'ombre Android
 * (`elevation`) un instant avant le contenu — `elevation` n'est pas porté par
 * l'animation d'opacité de `entering`/`exiting`, contrairement au reste de la
 * vue, donc elle « saute » au lieu de suivre le fondu. Seul le contenu
 * (`EventDetailContent`, ci-dessous) se remonte, `Pane` reste stable.
 */
import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { styled, Text, Theme, XStack, YStack } from 'tamagui';

import { Body, Pane } from '@/components/features/PosterCarousel';
import { SeatsGauge } from '@/components/features/SeatsGauge';
import { useToast } from '@/components/toast/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, shadows, tabularNums, type } from '@/constants/theme';
import type { GuinguetteEvent } from '@/data/events';
import { useDemoFlag } from '@/hooks/useDemoFlag';

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

function EventDetailContent({ event }: EventDetailPaneProps) {
  const { enabled, toggle } = useDemoFlag(`rsvp:${event.id}`);
  const { showToast } = useToast();
  const reduceMotion = useReducedMotion();

  const handleRsvp = useCallback(() => {
    const going = toggle();
    showToast(
      going ? 'C’est noté, on vous garde une place ! (démo)' : 'Participation annulée (démo)'
    );
  }, [showToast, toggle]);

  return (
    // Le thème de la soirée peint tout le panneau — et bascule au vert dès
    // que la participation est annoncée, comme sur l'ancienne carte.
    <Theme name={enabled ? 'secondary' : event.theme}>
      <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200).reduceMotion(ReduceMotion.System)}>
        <YStack gap="$sm">
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

          <PriceTag>{event.price}</PriceTag>

          <Button full accessibilityState={{ selected: enabled }} onPress={handleRsvp}>
            {enabled && <Button.Icon name="check" />}
            <Button.Text>Participer</Button.Text>
          </Button>
        </YStack>
      </Animated.View>
    </Theme>
  );
}

function EventDetailPaneComponent({ event }: EventDetailPaneProps) {
  return (
    <Pane style={shadows.card}>
      <EventDetailContent key={event.id} event={event} />
    </Pane>
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
