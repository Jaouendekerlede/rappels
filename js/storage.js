// Stockage local (localStorage) : tâches et préférences.

import { STORAGE_KEYS } from "./config.js";

function lireJson(cle, defaut) {
  try {
    const v = JSON.parse(localStorage.getItem(cle));
    return v ?? defaut;
  } catch {
    return defaut;
  }
}

function ecrireJson(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
    return true;
  } catch {
    return false; // stockage plein ou bloqué (navigation privée)
  }
}

export function listerTaches() {
  return lireJson(STORAGE_KEYS.taches, []);
}

export function ecrireTaches(taches) {
  return ecrireJson(STORAGE_KEYS.taches, taches);
}

export function lirePrefs() {
  return lireJson(STORAGE_KEYS.prefs, {});
}

export function sauverPrefs(partiel) {
  ecrireJson(STORAGE_KEYS.prefs, { ...lirePrefs(), ...partiel });
}
