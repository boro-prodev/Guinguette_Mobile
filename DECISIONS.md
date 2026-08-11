# Journal des décisions

> Un index chronologique, pas un second récit. Chaque ligne pointe vers l'
> endroit où la décision est déjà expliquée en détail (`.claude/rules/*.md`,
> `ROADMAP.md`) — rien n'est recopié ici, pour ne jamais avoir deux versions
> de la même raison à tenir à jour.

**À qui ça sert :** vérifier en une table si un choix (contenu, UX, arbitrage
produit) n'est pas déjà tranché avant de le rouvrir. Utile à un seul
développeur qui a oublié pourquoi ; indispensable le jour où quelqu'un
d'autre rejoint le projet sans l'historique en tête.

**Discipline pour la suite :** quand une décision de ce type se prend (pas un
correctif technique — voir la distinction ci-dessous), une ligne s'ajoute ici
en même temps que le détail part dans le fichier de règle concerné. Une ligne,
un pointeur, jamais la justification complète une seconde fois.

**Ce qui n'y figure pas :** les pièges d'implémentation purs (le `ScrollView`
qui doit venir de `gesture-handler`, `'worklet'` obligatoire sur une fonction
appelée depuis un geste…). Ce sont des bugs résolus, pas des choix — ils
restent uniquement dans les fichiers de règles, à l'endroit où on les
rencontre.

| Date | Décision | Détail |
|---|---|---|
| 3 août 2026 | Police d'affichage : Berkshire Swash remplace Fraunces. | `.claude/rules/typographie.md` § Les polices |
| 3 août 2026 | Plancher d'interligne par police, mesuré dans les tables `hhea` des `.ttf` plutôt que choisi à l'œil. | `.claude/rules/typographie.md` § L'interligne a un plancher |
| 4 août 2026 | Les deux boutons de l'accueil partagent le même traitement « verre » ; la hiérarchie se fait par `emphasis` (anneau ambré), pas par un aplat de couleur. | `.claude/rules/design-system.md` § Un seul bouton dans toute l'app |
| 5 août 2026 | Le swipe entre onglets est retiré ; le geste horizontal libéré revient entièrement au carrousel de Soirées. | `.claude/rules/ecrans.md` § Navigation |
| 5 août 2026 | Le halo de pression du bouton ne monte plus rien à chaque appui — une valeur partagée unique, montée en permanence. | `.claude/rules/design-system.md` § Le halo de pression ne monte plus rien |
| 5 août 2026 | La feuille de réservation glisse depuis `<Modal onShow>`, pas depuis un effet sur `mounted`. | `.claude/rules/ecrans.md` § La feuille de réservation glisse depuis `onShow` |
| 6 août 2026 | L'écran Soirées se feuillette comme un journal (`NewspaperPager`) — le carrousel d'affiches à trois vignettes est abandonné. | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 6 août 2026 | Les quatre onglets sont montés dès le démarrage (`lazy: false`), pas à leur première visite. | `.claude/rules/ecrans.md` § Navigation |
| 6 août 2026 | La Carte : plus de filtre « Tout » — on n'affiche jamais qu'une catégorie à la fois. | `.claude/rules/ecrans.md` § La Carte |
| 6 août 2026 | La feuille de journal porte une ombre permanente (`shadows.card`), pas un contour — tranché en deux temps dans la même session. | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 6 août 2026 | Un compteur « 2 / 3 » accompagne les pastilles de pagination de Soirées. | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 6 août 2026 | Les pastilles de réseaux sociaux d'« Artist Spot » passent en `tone="soft"`/`size="md"` (plus visibles, cible tactile 44 px). | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 6 août 2026 | Le compte à rebours (`Countdown`) disparaît de l'affiche d'« Artist Spot » — déjà porté par « À l'affiche ». | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 6 août 2026 | `ROADMAP.md` remis à plat : le récit chronologique part dans l'historique git, seule la synthèse par chantier reste. | `ROADMAP.md`, en-tête |
| 7 août 2026 | `venue.email`/`venue.website` ajoutés puis retirés le jour même — la carte de contact se resserre sur l'essentiel. | `.claude/rules/donnees-et-demo.md` § Toutes les données sont des placeholders |
| 7 août 2026 | « J'y serai » ne persiste plus entre relances de l'app (`useState` local, pas `useDemoFlag`) — pour ne jamais rouvrir déjà coché devant un prospect. | `.claude/rules/donnees-et-demo.md` § Persistance |
| 7 août 2026 | Le compte à rebours (`Countdown`) est supprimé entièrement, plus aucun appelant ne le montrait. | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 7 août 2026 | Badge de style et sous-ligne retirés de l'affiche d'« Artist Spot » — seul le nom reste, sur un panneau verre. | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 7 août 2026 | Le kicker « Retrouver l'artiste » est retiré — jugé superflu au-dessus des trois pastilles. | `.claude/rules/ecrans.md` § L'écran Soirées se feuillette comme un journal |
| 7 août 2026 | Facebook et Instagram passent à leurs vraies couleurs de marque (`SocialIcon`), seule exception au thème courant. | `.claude/rules/design-system.md` § Un seul bouton dans toute l'app ; `components/ui/SocialIcon.tsx` |
| 7 août 2026 | La petite ampoule sous l'onglet actif (`TabIcon`) est retirée. | `components/layout/TabIcon.tsx` (en-tête) |
| 7 août 2026 | Écran Infos : six passes dans la journée : version finale = photo d'ambiance en fond de carte, sans logo Google Maps (redondant avec le tap sur l'adresse). | `.claude/rules/ecrans.md` § Infos |
| 7 août 2026 | « Émoji » demandé : de vraies icônes au trait livrées à la place (rendu identique iOS/Android, un emoji Unicode ne l'est pas). | `.claude/rules/ecrans.md` § Infos |
| 11 août 2026 | Le repère de pagination (« 2 / 3 ») rejoint le kicker sur la même ligne, plutôt que sa propre ligne dans l'en-tête fixe — le journal remonte d'autant. | `components/features/EventSpotlight.tsx` (commentaire de `pageLabel`) |
| 11 août 2026 | 13 couleurs recopiées en dur (dont 2 dans `tamagui.config.ts` lui-même) sont centralisées dans `constants/theme.ts` ; un hook pre-commit bloque toute nouvelle occurrence. | `.claude/rules/design-system.md` § Où vivent les valeurs ; `.githooks/pre-commit` |
| 11 août 2026 | `SocialIcon.tsx` est documenté comme seconde exception admise à « jamais de valeur en dur ». | `.claude/rules/design-system.md` § Où vivent les valeurs |
| 11 août 2026 | Une table de référence des props (`composants.md`) et ce journal remplacent la prose seule comme point d'entrée sur les décisions et l'API des composants. | `.claude/rules/composants.md` ; ce fichier |
