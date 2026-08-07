/**
 * Infos Pratiques — une carte de contact, puis les horaires.
 *
 * ⚠️ **Quatrième version de la carte de contact en une session (7 août
 * 2026)** — après le hero-photo d'origine, la carte de visite sombre (titre,
 * sous-titre, séparateur), puis une version avec la photo d'ambiance de
 * l'accueil en fond. Cette dernière est repartie : « ça ne donne pas bien »,
 * retour à une carte simple, au même langage que la carte Horaires juste en
 * dessous (fond clair, bordure fine). Ce qui reste : un titre court (« Infos
 * Pratiques », sans sous-titre) et trois lignes de contact essentielles
 * (appeler, SMS, localisation), chacune avec l'icône au trait du projet
 * plutôt qu'un vrai emoji Unicode — le tout centré **verticalement** dans la
 * carte, pas seulement horizontalement.
 *
 * ⚠️ **« Émoji » demandés, icônes livrées — délibérément.** Un vrai emoji
 * (📞, 💬, 📍) est un glyphe **couleur**, dessiné différemment par la police
 * emoji de chaque OS (Apple Color Emoji ≠ Noto Color Emoji) : il ne peut pas
 * être rendu « noir et blanc » de façon fiable, et ne rendra jamais
 * identique sur iPhone et Android — l'inverse de ce qui était demandé.
 * `Icon.tsx` (`call`, `message`, `location`) est le jeu de pictogrammes du
 * projet, un seul trait, une seule couleur, un seul rendu quelle que soit la
 * plateforme : c'est la version qui tient vraiment la promesse « compatible
 * iPhone et Android, en noir et blanc ».
 */
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { colors, radius, shadows, spacing, tabularNums, type } from '@/constants/theme';
import { openingHours, venue } from '@/data/venue';

export default function InfosScreen() {
  /**
   * Demande de Jonathan, 7 août 2026 : la carte de contact (photo) doit faire
   * la même hauteur que la carte Horaires juste en dessous. La hauteur des
   * Horaires dépend du rendu réel des polices (rien de fixe à recopier), donc
   * on la MESURE (`onLayout`, ajouté à `Reveal`) plutôt que de deviner un
   * nombre — exact quel que soit l'appareil, contrairement à une valeur en
   * dur qui aurait fini par diverger.
   */
  const [hoursHeight, setHoursHeight] = useState<number>();
  const onHoursLayout = useCallback((event: LayoutChangeEvent) => {
    setHoursHeight(event.nativeEvent.layout.height);
  }, []);

  const callPhone = useCallback(() => {
    Linking.openURL(`tel:${venue.phoneDial}`).catch(() => {
      // Aucune app de téléphonie disponible : on ne casse pas la démo pour autant.
    });
  }, []);

  const smsPhone = useCallback(() => {
    Linking.openURL(`sms:${venue.phoneDial}`).catch(() => {
      // Même filet que `callPhone` — un appareil sans app SMS reste possible.
    });
  }, []);

  const openMaps = useCallback(() => {
    Linking.openURL(venue.mapsUrl).catch(() => {
      // Aucune app de cartes disponible : on ne casse pas la démo pour autant.
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Reveal
        fadeOnly
        style={[styles.card, shadows.card, hoursHeight != null && { height: hoursHeight }]}
      >
        <Text style={styles.cardTitle}>Infos Pratiques</Text>

        <View style={styles.contactList}>
          <ContactLine
            icon="call"
            label={venue.phone}
            onPress={callPhone}
            accessibilityLabel={`Appeler ${venue.phone}`}
            accessibilityHint="Ouvre le clavier d’appel, numéro déjà composé"
          />
          <ContactLine
            icon="message"
            label="Envoyer un SMS"
            onPress={smsPhone}
            accessibilityLabel="Envoyer un SMS"
            accessibilityHint="Ouvre l’application de messages, numéro déjà rempli"
          />
          <ContactLine
            icon="location"
            label={`${venue.street}, ${venue.city}`}
            onPress={openMaps}
            accessibilityLabel="Ouvrir l’itinéraire dans Google Maps"
          />

          {/*
            Demande de Jonathan, 7 août 2026 : « bien indiquer ce qu'il se
            passe » sous l'adresse — le vrai logo Google Maps (fourni par
            Jonathan, converti en WebP — voir `assets/images/`) plutôt qu'une
            simple icône de lieu, pour que l'action soit reconnaissable au
            premier coup d'œil. Remplace le logo redessiné à la main
            (`SocialIcon`, name `maps`, retiré du même coup) du premier essai
            — celui-ci est le vrai logo, pas une reconstitution. Même geste
            que la ligne du dessus (`openMaps`) : un second déclencheur, plus
            explicite. Fond blanc opaque propre au fichier d'origine (un
            `.jpg` fourni sans transparence, la conversion WebP ne lui en
            invente pas) : une bordure fine (`mapsBadge`) l'entoure pour qu'il
            ne se fonde pas dans le fond clair de la carte.
          */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Ouvrir dans Google Maps"
            accessibilityHint="Ouvre l’itinéraire dans Google Maps"
            scaleTo={0.96}
            onPress={openMaps}
            style={styles.mapsBadge}
          >
            <Image
              source={require('../../assets/images/googlemaps.webp')}
              style={styles.mapsLogo}
              contentFit="contain"
              accessibilityLabel="Logo Google Maps"
            />
          </PressableScale>
        </View>
      </Reveal>

      <Reveal delay={150} onLayout={onHoursLayout} style={[styles.hoursCard, shadows.card]}>
        <Text style={styles.hoursTitle}>Horaires</Text>
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

type ContactLineProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

/** Une ligne de contact tappable — pas un `Button` : ça se lit comme du texte,
 *  pas comme une action étiquetée (voir `.claude/rules/design-system.md`,
 *  « trois primitives tactiles »). `PressableScale` est la zone tactile brute
 *  du projet, exactement ce rôle-là. */
function ContactLine({ icon, label, onPress, accessibilityLabel, accessibilityHint }: ContactLineProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      scaleTo={0.97}
      onPress={onPress}
      style={styles.contactRow}
    >
      <Icon name={icon} size={20} color={colors.primary} />
      <Text style={styles.contactText}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  /* Carte de contact */
  card: {
    // Le contenu (titre + lignes) est centré au flex, pas par un padding
    // fixe : `justifyContent`/`alignItems` marchent aussi bien avant que
    // `hoursHeight` soit connu (replis sur `minHeight`) qu'une fois la
    // hauteur mesurée appliquée — un padding fixe aurait dû être recalculé
    // dans les deux cas.
    minHeight: 240,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  contactList: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    // Zone tactile ≥ 44 px même pour une ligne icône + texte sans fond.
    minHeight: 44,
  },
  contactText: {
    ...type.bodyLg,
    color: colors.onSurface,
  },
  mapsBadge: {
    marginTop: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  mapsLogo: {
    // Ratio du fichier source (300 × 150 = 2:1), conservé pour ne pas
    // déformer le logo — `contentFit="contain"` rend ça sans effet ici,
    // mais autant partir d'un cadre juste plutôt que d'un carré qui rogne.
    width: 150,
    height: 75,
  },

  /* Horaires */
  hoursCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
  },
  hoursTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
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
