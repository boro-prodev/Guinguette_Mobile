/**
 * Booléen persisté localement pour la démo (participation à une soirée, etc.).
 * Convention du projet : toutes les clés sont préfixées `demo:` — rien n'est
 * envoyé nulle part, la seule trace est sur l'appareil.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export function useDemoFlag(key: string) {
  const storageKey = `demo:${key}`;
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((value) => {
        if (active) setEnabled(value === '1');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [storageKey]);

  /** Bascule l'état et renvoie la nouvelle valeur (pour le message du toast). */
  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    AsyncStorage.setItem(storageKey, next ? '1' : '0').catch(() => {
      // Démo : un échec d'écriture locale ne doit jamais interrompre le parcours.
    });
    return next;
  }, [enabled, storageKey]);

  return { enabled, loading, toggle };
}
