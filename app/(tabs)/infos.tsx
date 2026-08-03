/**
 * Infos Pratiques — adresse, contact et horaires (port de infos-pratiques.html).
 * Contenu court et statique : une ScrollView suffit, pas de liste virtualisée.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { colors, radius, shadows, spacing, tabularNums, type } from '@/constants/theme';
import { openingHours, venue } from '@/data/venue';
import { useReserve } from '@/features/reserve/ReserveProvider';

export default function InfosScreen() {
  const { open } = useReserve();

  const openMaps = useCallback(() => {
    Linking.openURL(venue.mapsUrl).catch(() => {
      // Aucune app de cartes disponible : on ne casse pas la démo pour autant.
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Reveal fadeOnly style={styles.hero}>
        <Image
          source={require('../../assets/images/presentation-global.webp')}
          style={styles.heroImage}
          contentFit="cover"
          priority="high"
          accessibilityLabel="Vue d’ensemble de la guinguette au bord de l’eau"
        />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(12,23,32,0.55)', 'rgba(240,173,74,0.12)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroText}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeLabel}>Découvrir</Text>
          </View>
          <Text style={styles.heroTitle}>Infos Pratiques</Text>
        </View>
      </Reveal>

      {/* Nous trouver */}
      <Reveal delay={100} style={[styles.card, shadows.card]}>
        <View style={styles.cardHeader}>
          <Icon name="location" size={24} color={colors.primary} />
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Nous Trouver</Text>
            <Text style={styles.address}>{venue.street}</Text>
            <Text style={styles.city}>{venue.city}</Text>
          </View>
        </View>

        <Image
          source={require('../../assets/images/presentation-centre.webp')}
          style={styles.map}
          contentFit="cover"
          accessibilityLabel="Vue du site de la guinguette"
          cachePolicy="memory-disk"
        />

        <Button
          full
          accessibilityLabel='Ouvrir l’itinéraire dans Google Maps'
          onPress={openMaps}
        >
          <Button.Icon name="directions" />
          <Button.Text>M’y rendre</Button.Text>
        </Button>
      </Reveal>

      {/* Contact */}
      <Reveal delay={200} style={[styles.card, shadows.card]}>
        <View style={styles.cardHeader}>
          <Icon name="call" size={24} color={colors.secondary} />
          <Text style={styles.cardTitle}>Contact</Text>
        </View>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Réserver une table — ${venue.phone}`}
          scaleTo={0.97}
          onPress={open}
          style={styles.phoneBlock}
        >
          <Text style={styles.phoneLead}>Réservez votre table</Text>
          <Text style={styles.phone}>{venue.phone}</Text>
        </PressableScale>
      </Reveal>

      {/* Horaires */}
      <Reveal delay={300} style={[styles.card, shadows.card]}>
        <View style={styles.cardHeader}>
          <Icon name="clock" size={24} color={colors.tertiary} />
          <Text style={styles.cardTitle}>Horaires</Text>
        </View>

        <View>
          {openingHours.map((row, index) => (
            <View
              key={row.id}
              style={index === openingHours.length - 1 ? styles.hourRow : [styles.hourRow, styles.hourDivider]}
            >
              {row.highlight && <View style={styles.highlightBar} />}
              <Text style={styles.hourDays}>{row.days}</Text>
              <Text style={styles.hourValue}>{row.hours}</Text>
            </View>
          ))}
        </View>
      </Reveal>

      <View style={styles.footer}>
        <Icon name="glass" size={40} color={colors.primaryContainer} />
        <Text style={styles.demoNote}>Démo — aucune donnée n’est envoyée</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  /* Hero */
  hero: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroText: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  heroBadgeLabel: {
    // « Découvrir » est en casse normale : `caption`, pas le chasse de `labelSm`.
    ...type.caption,
    color: colors.onTertiaryContainer,
  },
  heroTitle: {
    // `headlineLg` plutôt qu'un 34/40 inventé sur place : le cran existait
    // déjà dans l'échelle, et 34 px réclamait un interligne de 41,9 px —
    // « Infos Pratiques » y perdait le jambage de son « p » et de son « q ».
    ...type.headlineLg,
    color: colors.surfaceContainerLowest,
    textShadowColor: 'rgba(12,23,32,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  /* Cartes */
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  address: {
    ...type.bodyLg,
    color: colors.onSurfaceVariant,
  },
  city: {
    ...type.bodyLg,
    // Les capitales de la localité sont une présentation, pas du contenu :
    // `venue.city` est stocké en casse normale et mis en forme ici.
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
  },
  map: {
    width: '100%',
    height: 176,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  /* Contact */
  phoneBlock: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  phoneLead: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  phone: {
    ...type.headlineLg,
    color: colors.primary,
  },

  /* Horaires */
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  hourDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  highlightBar: {
    position: 'absolute',
    left: -spacing.sm,
    top: spacing.base,
    bottom: spacing.base,
    width: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.tertiaryFixedDim,
  },
  hourDays: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  hourValue: {
    ...type.bodyMd,
    fontFamily: type.labelSm.fontFamily,
    // Sans chasse fixe, « 17h00 — 23h00 » (112,4 px) et « 12h00 — 00h00 »
    // (114,7 px) ne commencent pas au même endroit : la colonne est en
    // dents de scie sur ses bords gauches.
    ...tabularNums,
    color: colors.onSurface,
  },

  /* Pied de page */
  footer: {
    alignItems: 'center',
    gap: spacing.base,
    paddingTop: spacing.md,
  },
  demoNote: {
    ...type.caption,
    // L'`opacity: 0.6` qui couvrait tout le pied de page ramenait ce texte à
    // 2,92:1 sur le fond crème — sous le plancher de 4,5:1, et c'est
    // justement la mention qui annonce que la démo n'envoie rien. La
    // discrétion se joue sur la couleur, pas en voilant du 13 px.
    color: colors.onSurfaceVariant,
  },
});
