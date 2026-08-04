---
name: environnement
description: Lancer l'app (émulateur Android ou téléphone), installer un paquet, toucher aux versions figées, ou committer sur ce dépôt. Couvre l'AVD Guinguette_API36, Metro/Expo Go, le pare-feu Windows, et les contraintes de build.
---

# Environnement, build et dépôt

> À lire **avant** de lancer l'app, d'installer un paquet, de toucher aux
> versions ou de committer.

## Lancer l'app sur l'émulateur Android

AVD utilisé : `Guinguette_API36` (Android 36, Play Store), avec Expo Go
(`host.exp.exponent`) déjà installé. Le SDK est sous
`%LOCALAPPDATA%\Android\Sdk` ; `adb` et `emulator` ne sont pas dans le `PATH` par
défaut, il faut les y ajouter pour la session.

```bash
export PATH="$PATH:$LOCALAPPDATA/Android/Sdk/emulator:$LOCALAPPDATA/Android/Sdk/platform-tools"

# 1. Émulateur (en tâche de fond)
emulator -avd Guinguette_API36 -gpu swiftshader_indirect -no-boot-anim

# 2. Attendre le boot complet
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 2; done

# 3. Metro (en tâche de fond, à la racine du projet)
npx expo start
# prêt quand : curl -s http://localhost:8081/status → packager-status:running

# 4. Ouvrir le projet dans Expo Go
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

Contrôle visuel sans regarder la fenêtre : `adb exec-out screencap -p > shot.png`.
Au tout premier lancement, Expo Go superpose son menu développeur à l'app — le
fermer avec `adb shell input keyevent 4`.

Si l'écran est noir et que `dumpsys window` renvoie `mCurrentFocus=null`,
l'appareil dort : `adb shell input keyevent KEYCODE_WAKEUP`. Ne pas envoyer
`KEYCODE_MENU`, qui ouvre le menu développeur d'Expo Go.

Pour arrêter proprement : `adb emu kill` (l'arrêt est asynchrone, revérifier avec
`adb devices`), puis `adb kill-server`.

**Piège GPU (poste actuel).** Sans `-gpu swiftshader_indirect`, l'émulateur peut
mourir sur « Android Emulator closed unexpectedly » (crash du driver graphique) ;
le log montre `Could not detect GPU properly for Vulkan emulation` et
`Failed to load opengl32sw`. Swiftshader est un rendu logiciel : plus lent, mais
fiable. Rien à voir avec l'app.

Deux messages qui ressemblent à des erreurs et n'en sont pas : « An update for
expo is available » (versions figées, voir plus bas) et « Running multiple
emulators with the same AVD » (une instance tient déjà le verrou — inutile d'en
relancer une).

**Bundle en cache.** Si l'app affiche « Unmatched Route » ou un toast « Cannot
connect to Expo CLI », elle tourne sur un bundle périmé : relancer Metro avec
`npx expo start --clear`, puis `adb shell am force-stop host.exp.exponent` avant
de rouvrir.

## Lancer sur un téléphone réel

Même Wi-Fi que le PC, puis `npx expo start` et scan du QR code (Expo Go sur
Android, appareil photo sur iOS).

⚠️ **Le pare-feu Windows bloque le port 8081 par défaut** — c'est la panne la
plus fréquente. Autoriser à la première popup (« Réseaux privés »), ou en
PowerShell administrateur :

```powershell
New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private
```

En USB (Android), plus fiable : `adb reverse tcp:8081 tcp:8081` puis
`npx expo start --localhost`. En dernier recours : `npx expo start --tunnel`.

## Versions figées — ne pas « mettre à jour »

Le projet est volontairement épinglé sur `expo@57.0.2` et les versions de
`bundledNativeModules` correspondantes (`react-native-reanimated@4.5.0`,
`react-native-worklets@0.10.0`, `react-native-screens@4.25.2`,
`expo-router@57.0.3`…). Ces paquets ont du code natif **compilé en dur dans
Expo Go** : au moindre écart de patch, Reanimated compare JS et natif au
démarrage et **tue le processus sans erreur JS** — l'app retombe sur l'accueil
Expo, et rien n'apparaît ni en red box ni dans le log Metro. La contrainte ne
saute qu'en passant à un build de développement ou une release.

**Ajouter un module Expo est possible s'il est livré avec Expo Go.** Vérifier
avant :

```bash
node -e "console.log(require('./node_modules/expo/bundledNativeModules.json')['expo-video'])"
```

S'il y figure, `npx expo install <module>` installe la bonne version et rien ne
casse. C'est ainsi qu'`expo-video` est arrivé.

## ⚠️ Ne jamais installer avec `--legacy-peer-deps`

Le drapeau fait passer l'installation **mais retire `react-dom` de l'arbre** —
et `@tamagui/popper` l'importe depuis `Popper.native.js`, y compris sur natif.
Le bundle meurt alors sur `Unable to resolve "react-dom"`, très loin de la cause.

`react-dom` est désormais une dépendance explicite alignée sur `react` (19.2.3),
ce qui supprime le conflit `ERESOLVE` à la racine : `npm install` passe sans
drapeau. **Si le conflit revient, réaligner les deux versions plutôt que de
forcer.**

## Autres contraintes de build

- **Pas de dossier `android/`.** Le prebuild natif a été supprimé (1,4 Go) : le
  workflow est Expo Go. Il se régénère par `npx expo prebuild` — mais cela fait
  sortir du cadre ci-dessus.
- **Pas de `babel.config.js`** : le SDK 57 fournit le preset (et le plugin
  worklets de Reanimated 4) par défaut ; en ajouter un casse le bundle.
- `npx expo-doctor` signale en permanence deux échecs **attendus** : les écarts
  de version (le pinning est volontaire) et un doublon `expo-font` qu'`expo`
  embarque lui-même. Ni l'un ni l'autre ne vient du code.

## Dépôt

- `boro-prodev/Guinguette_Mobile` sur GitHub, **privé**, branche `main`, depuis
  le 3 août 2026.
- Le projet vit sous `C:\Users\jonat\source\repos\Guinguette_Mobile` — **pas**
  sous OneDrive (une ancienne version de la doc l'indiquait à tort).
- **Les skills sont versionnés**, en vrais dossiers dans `.agents/skills/` et
  `.claude/skills/`. Avant, `.agents/skills/better-typography` était une
  **jonction Windows** vers `C:\Users\<toi>\.agents\` : git aurait suivi le lien
  et publié un morceau du dossier personnel.
  ⚠️ Contrepartie : les deux dossiers sont des **copies**, pas des liens.
  Modifier un skill impose de le recopier de l'un vers l'autre.
  `skills-lock.json` garde la provenance de `react-native-expert` et `tamagui`.
- `.claude/settings.local.json` reste hors du dépôt : chemins et permissions
  propres à la machine.
- ⚠️ Supprimer une jonction Windows avec `Remove-Item -Recurse` peut effacer la
  **cible**. Utiliser `cmd /c rmdir "<lien>"`, qui ne retire que le lien.
