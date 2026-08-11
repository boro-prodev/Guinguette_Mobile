/**
 * Parcours de réservation SIMULÉ (port de src/reserve.js).
 * Bottom sheet en 3 étapes — créneau → coordonnées → confirmation.
 * Rien n'est envoyé : la seule trace est un enregistrement local
 * `demo:reservation`. Le fournisseur est monté une fois à la racine, n'importe
 * quel écran ouvre la feuille via `useReserve().open()`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  Keyboard,
  type KeyboardEvent,
  type LayoutChangeEvent,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, shadows, spacing, type } from '@/constants/theme';
import { MAX_GUESTS, RESERVATION_TIMES, venue } from '@/data/venue';
import { addDays, formatLongDate, formatShortDate } from '@/utils/date';

const TIMING = { duration: 400, easing: Easing.bezier(0.22, 1, 0.36, 1) };
/**
 * Délai au-delà duquel on fait monter la feuille même sans `onShow`. Assez long
 * pour que la présentation native ait toujours eu lieu (une à deux trames),
 * assez court pour qu'un `onShow` manquant ne se voie pas comme un blocage.
 */
const SHOW_FALLBACK_MS = 250;
/** Distance de glissement au-delà de laquelle la feuille se referme. */
const DISMISS_THRESHOLD = 90;
const DAYS_AHEAD = 8;

type ReserveDay = { id: string; label: string; long: string };

function buildDays(): ReserveDay[] {
  const today = new Date();
  return Array.from({ length: DAYS_AHEAD }, (_, index) => {
    const date = addDays(today, index);
    const label =
      index === 0 ? 'Aujourd’hui' : index === 1 ? 'Demain' : formatShortDate(date);
    return { id: `j${index}`, label, long: formatLongDate(date) };
  });
}

type ReserveContextValue = { open: () => void };

const ReserveContext = createContext<ReserveContextValue | null>(null);

export function useReserve(): ReserveContextValue {
  const context = useContext(ReserveContext);
  if (!context) {
    throw new Error('useReserve doit être utilisé sous <ReserveProvider>');
  }
  return context;
}

export function ReserveProvider({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [dayId, setDayId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(height);
  const days = useRef(buildDays()).current;
  const selectedDay = days.find((day) => day.id === dayId) ?? null;

  /** Vrai dès que la glissade d'ouverture est lancée — voir `slideIn`. */
  const slideStarted = useRef(false);
  const showFallback = useRef<ReturnType<typeof setTimeout>>(undefined);

  /**
   * Remontée du panneau quand le clavier apparaît — mais seulement du
   * *débordement* au-delà d'une « zone sacrifiée » (résumé + pied de page),
   * mesurée en direct via `onLayout`. Tant que le clavier tient dans cette
   * zone, `keyboardShift` reste à 0 : rien ne bouge, le clavier se pose
   * simplement par-dessus elle. Un `KeyboardAvoidingView` classique n'a pas
   * cette notion — il pousse toujours de la hauteur pleine du clavier, ce
   * qui déplaçait tout le panneau (« casse le design », retour de Jonathan).
   */
  const keyboardShift = useSharedValue(0);
  const footerHeight = useRef(0);
  const summaryHeight = useRef(0);
  const sacrificeHeight = useRef(0);

  const measureFooter = useCallback((event: LayoutChangeEvent) => {
    footerHeight.current = event.nativeEvent.layout.height;
    sacrificeHeight.current = footerHeight.current + summaryHeight.current;
  }, []);

  const measureSummary = useCallback((event: LayoutChangeEvent) => {
    summaryHeight.current = event.nativeEvent.layout.height;
    sacrificeHeight.current = footerHeight.current + summaryHeight.current;
  }, []);

  useEffect(() => {
    // `Will*` est plus doux sur iOS (anticipe l'animation native du clavier) ;
    // `Did*` est la seule paire fiable sur Android.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      const overshoot = Math.max(0, event.endCoordinates.height - sacrificeHeight.current);
      keyboardShift.value = withTiming(overshoot, {
        duration: event.duration || TIMING.duration,
        easing: TIMING.easing,
        reduceMotion: ReduceMotion.System,
      });
    };
    const onHide = () => {
      keyboardShift.value = withTiming(0, { ...TIMING, reduceMotion: ReduceMotion.System });
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardShift]);

  const reset = useCallback(() => {
    setStep(1);
    setDayId(null);
    setTime(null);
    setGuests(2);
    setName('');
    setPhone('');
    setError('');
  }, []);

  /**
   * ⚠️ `reset()` reste ICI, sur le chemin d'ouverture, contrairement à ce que
   * suggérait la feuille de route (« sept `setState` sur le chemin critique »).
   * Vérifié : les sept, plus `setMounted`, sont dans le même bloc synchrone —
   * React 18 les regroupe donc en **un seul rendu**, pas huit. Les déplacer à
   * la fermeture n'économiserait rien et ouvrirait un vrai risque : rouvrir
   * avant la fin de l'animation de fermeture montrerait l'état précédent.
   */
  const open = useCallback(() => {
    reset();
    translateY.value = height;
    keyboardShift.value = 0;
    slideStarted.current = false;
    setMounted(true);
  }, [height, keyboardShift, reset, translateY]);

  /**
   * Fait monter la feuille. Appelée par `<Modal onShow>` — c'est-à-dire quand
   * la **fenêtre native est réellement présentée**, et non quand React a fini
   * son commit.
   *
   * La version précédente partait d'un `useEffect` sur `mounted`. L'intention
   * était déjà la bonne (« ne pas lancer le timing dès `open()` »), mais elle
   * s'arrêtait à mi-chemin : sur Android, `<Modal>` crée une fenêtre native,
   * ce qui coûte une à deux trames APRÈS le commit. Le glissement commençait
   * donc pendant que la fenêtre n'était pas encore à l'écran, et on en perdait
   * le début.
   *
   * Idempotente par `slideStarted` : le filet de sécurité ci-dessous peut
   * l'appeler sans risquer de relancer une animation déjà en cours.
   */
  const slideIn = useCallback(() => {
    if (slideStarted.current) return;
    slideStarted.current = true;
    clearTimeout(showFallback.current);
    translateY.value = withTiming(0, { ...TIMING, reduceMotion: ReduceMotion.System });
  }, [translateY]);

  /**
   * Filet de sécurité. `onShow` est fiable sur les deux plateformes, mais une
   * feuille montée qui resterait hors écran serait une impasse totale : plus
   * rien à toucher, et le fond déjà assombri. Même discipline que l'ouverture
   * de l'accueil, où trois sorties garantissent que les boutons finissent
   * toujours par apparaître — une animation ne tient jamais le contenu en
   * otage.
   */
  useEffect(() => {
    if (!mounted) return;
    showFallback.current = setTimeout(slideIn, SHOW_FALLBACK_MS);
    return () => clearTimeout(showFallback.current);
  }, [mounted, slideIn]);

  const close = useCallback(() => {
    translateY.value = withTiming(
      height,
      { ...TIMING, reduceMotion: ReduceMotion.System },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      }
    );
  }, [height, translateY]);

  const confirm = useCallback(() => {
    if (!selectedDay || !time) return;
    // Démo : la « réservation » ne quitte jamais l'appareil.
    AsyncStorage.setItem(
      'demo:reservation',
      JSON.stringify({ day: selectedDay.long, time, guests, name })
    ).catch(() => {});
    setStep(3);
  }, [guests, name, selectedDay, time]);

  const goNext = useCallback(() => {
    if (step === 1) {
      if (!selectedDay || !time) {
        setError('Choisissez une date et une heure pour continuer.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    if (step === 2) {
      if (name.trim().length < 2) {
        setError('Indiquez votre nom.');
        return;
      }
      if (phone.replace(/\D/g, '').length < 8) {
        setError('Indiquez un numéro de téléphone valide.');
        return;
      }
      setError('');
      confirm();
      return;
    }

    close();
  }, [close, confirm, name, phone, selectedDay, step, time]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((event) => {
          translateY.value = Math.max(0, translateY.value + event.changeY);
        })
        .onEnd((event) => {
          if (translateY.value > DISMISS_THRESHOLD || event.velocityY > 800) {
            runOnJS(close)();
          } else {
            translateY.value = withTiming(0, { ...TIMING, reduceMotion: ReduceMotion.System });
          }
        }),
    [close, translateY]
  );

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - keyboardShift.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height], [1, 0], Extrapolation.CLAMP),
  }));

  const value = useMemo(() => ({ open }), [open]);

  const summary = selectedDay
    ? `Table pour ${guests} ${guests > 1 ? 'personnes' : 'personne'} · ${selectedDay.long} à ${time}`
    : '';

  const nextLabel =
    step === 1 ? 'Continuer' : step === 2 ? 'Confirmer la réservation' : 'Fermer';

  return (
    <ReserveContext.Provider value={value}>
      {children}

      <Modal
        visible={mounted}
        transparent
        animationType="none"
        statusBarTranslucent
        // La fenêtre native est présentée : c'est MAINTENANT que la feuille
        // peut glisser, et pas au commit React (cf. `slideIn`).
        onShow={slideIn}
        // Bouton retour Android : referme la feuille au lieu de quitter l'écran.
        onRequestClose={close}
      >
        <GestureHandlerRootView style={styles.flex}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Fermer la réservation"
              scaleTo={1}
              onPress={close}
              style={styles.flex}
            />
          </Animated.View>

          {/*
            Pas de <KeyboardAvoidingView> ici : la remontée est pilotée par
            `keyboardShift` (voir plus haut), combiné à `translateY` dans
            `panelStyle`. Un simple <View> suffit comme conteneur.
          */}
          <View style={styles.sheetWrapper} pointerEvents="box-none">
            <Animated.View
              accessibilityViewIsModal
              style={[
                styles.panel,
                { maxHeight: height * 0.92, paddingBottom: insets.bottom },
                shadows.sheet,
                panelStyle,
              ]}
            >
              <GestureDetector gesture={panGesture}>
                <View style={styles.handleZone}>
                  <View style={styles.handle} />
                </View>
              </GestureDetector>

              <View style={styles.header}>
                <Text style={styles.title}>Réserver une table</Text>
                <Button
                  theme="neutral"
                  tone="ghost"
                  size="sm"
                  circular
                  accessibilityLabel="Fermer"
                  onPress={close}
                >
                  <Button.Icon name="close" strokeWidth={1.75} />
                </Button>
              </View>

              <View style={styles.dots} accessible={false}>
                {[1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={index <= step ? [styles.dot, styles.dotOn] : styles.dot}
                  />
                ))}
              </View>

              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {step === 1 && (
                  <>
                    <Text style={styles.question}>Quand venez-vous ?</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      {days.map((day) => (
                        <Chip
                          key={day.id}
                          label={day.label}
                          value={day.id}
                          selected={day.id === dayId}
                          onSelect={setDayId}
                        />
                      ))}
                    </ScrollView>

                    <Text style={styles.question}>À quelle heure ?</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      {RESERVATION_TIMES.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          value={slot}
                          selected={slot === time}
                          onSelect={setTime}
                        />
                      ))}
                    </ScrollView>

                    <Text style={styles.question}>Combien de personnes ?</Text>
                    <View style={styles.guestRow}>
                      <Button
                        theme="neutral"
                        tone="outline"
                        circular
                        disabled={guests <= 1}
                        accessibilityLabel="Une personne de moins"
                        onPress={() => setGuests((count) => Math.max(1, count - 1))}
                      >
                        <Button.Icon name="minus" strokeWidth={1.75} />
                      </Button>
                      <Text
                        accessibilityLiveRegion="polite"
                        accessibilityLabel={`${guests} ${guests > 1 ? 'personnes' : 'personne'}`}
                        style={styles.guestCount}
                      >
                        {guests}
                      </Text>
                      <Button
                        theme="neutral"
                        tone="outline"
                        circular
                        disabled={guests >= MAX_GUESTS}
                        accessibilityLabel="Une personne de plus"
                        onPress={() => setGuests((count) => Math.min(MAX_GUESTS, count + 1))}
                      >
                        <Button.Icon name="plus" strokeWidth={1.75} />
                      </Button>
                    </View>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Text style={styles.question}>Vos coordonnées</Text>
                    <Text style={styles.inputLabel}>Nom</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Jean Dupont"
                      placeholderTextColor={colors.outline}
                      autoComplete="name"
                      textContentType="name"
                      returnKeyType="next"
                    />
                    <Text style={styles.inputLabel}>Téléphone</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="0470 12 34 56"
                      placeholderTextColor={colors.outline}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                    />
                    <Text style={styles.summary} onLayout={measureSummary}>
                      {summary}
                    </Text>
                  </>
                )}

                {step === 3 && (
                  <View style={styles.confirmBlock}>
                    <Animated.View
                      entering={ZoomIn.springify().damping(9).reduceMotion(ReduceMotion.System)}
                      style={styles.confirmBadge}
                    >
                      <Icon
                        name="check"
                        size={32}
                        color={colors.onSecondaryContainer}
                        strokeWidth={2}
                      />
                    </Animated.View>
                    <Text style={styles.confirmTitle}>Demande enregistrée !</Text>
                    <Text style={styles.confirmRecap}>
                      {`Table pour ${guests} · ${selectedDay?.long} à ${time}, au nom de ${name.trim()}.`}
                    </Text>
                    <Text style={styles.confirmNote}>
                      Ceci est une démonstration : aucune réservation réelle n’a été créée.
                    </Text>
                  </View>
                )}

                {error !== '' && (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                )}
              </ScrollView>

              <View style={styles.footer} onLayout={measureFooter}>
                <View style={styles.footerButtons}>
                  {step === 2 && (
                    <Button
                      theme="neutral"
                      tone="outline"
                      size="lg"
                      onPress={() => {
                        setError('');
                        setStep(1);
                      }}
                    >
                      Retour
                    </Button>
                  )}
                  {/*
                    La dernière étape est une confirmation : le bouton passe au
                    vert plutôt que de rester rouge « action à faire ».
                  */}
                  <Button
                    theme={step === 3 ? 'secondary' : 'primary'}
                    size="lg"
                    flex={1}
                    onPress={goNext}
                  >
                    {nextLabel}
                  </Button>
                </View>
                <Text style={styles.demoNote}>
                  {`Démo — aucune donnée n’est envoyée · ou appelez le ${venue.phone}`}
                </Text>
              </View>
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </ReserveContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  handleZone: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.base,
  },
  title: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceVariant,
  },
  dotOn: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  contentInner: {
    paddingBottom: spacing.sm,
  },
  question: {
    ...type.bodyLg,
    fontFamily: type.headlineMd.fontFamily,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.base,
  },
  guestCount: {
    // Pas de `tabularNums` ici : ce compteur est dans la police d'affichage,
    // qui n'a pas de `tnum` — la propriété serait un no-op silencieux. Le
    // `minWidth` fait déjà le travail en empêchant la ligne de se réagencer.
    ...type.headlineLg,
    color: colors.onSurface,
    minWidth: 48,
    textAlign: 'center',
  },
  inputLabel: {
    // Vrai micro-libellé en capitales : `labelSm` et son chasse sont ici à
    // leur place. La casse, elle, se fait au style et non dans le texte.
    ...type.labelSm,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    marginTop: spacing.base,
  },
  input: {
    ...type.bodyMd,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  summary: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  confirmBlock: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  confirmBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  confirmTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  confirmRecap: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  confirmNote: {
    // `opacity: 0.7` ramenait ce texte à 3,28:1 : la mention qui dit que rien
    // n'a réellement été réservé était la moins lisible de l'écran.
    ...type.caption,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  error: {
    ...type.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoNote: {
    // Le `letterSpacing: 0` posé ici en rattrapage disait déjà que `labelSm`
    // n'était pas le bon token : c'est `caption`.
    ...type.caption,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
