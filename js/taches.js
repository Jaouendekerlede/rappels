// Fonctions sur les tâches : création, modification, tri et regroupement.
// Rien ici ne touche au DOM (voir liste.js) ni directement au stockage au-delà
// de lire/écrire le tableau complet (pas de base de données, un simple JSON).

import { ecrireTaches, listerTaches } from "./storage.js";
import { prochaineDate } from "./recurrence.js";
import { estAujourdhui, estEnRetard, horodatage } from "./utils.js";

export function nouvelleTacheVide() {
  return { titre: "", notes: "", date: "", heure: "", recurrence: "", important: false };
}

export function ajouterTache(champs) {
  const taches = listerTaches();
  const nouvelle = { id: `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, fait: false, faitLe: null, creeLe: Date.now(), modifieLe: Date.now(), ...champs };
  taches.push(nouvelle);
  ecrireTaches(taches);
  return nouvelle;
}

export function modifierTache(id, champs) {
  const taches = listerTaches();
  const i = taches.findIndex((t) => t.id === id);
  if (i < 0) throw new Error("tâche introuvable");
  taches[i] = { ...taches[i], ...champs, modifieLe: Date.now() };
  ecrireTaches(taches);
  return taches[i];
}

export function supprimerTache(id) {
  ecrireTaches(listerTaches().filter((t) => t.id !== id));
}

// Coche/décoche une tâche. Si elle se répète et qu'on la coche, elle est
// simplement avancée à sa prochaine échéance au lieu d'être marquée faite.
export function basculerFait(id) {
  const taches = listerTaches();
  const i = taches.findIndex((t) => t.id === id);
  if (i < 0) return;
  const tache = taches[i];
  if (!tache.fait && tache.recurrence) {
    const suivante = prochaineDate(tache);
    if (suivante) {
      taches[i] = { ...tache, date: suivante, modifieLe: Date.now() };
      ecrireTaches(taches);
      return;
    }
  }
  taches[i] = { ...tache, fait: !tache.fait, faitLe: !tache.fait ? Date.now() : null, modifieLe: Date.now() };
  ecrireTaches(taches);
}

function normaliser(t) {
  return (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Regroupe les tâches non terminées par échéance, triées par importance puis
// par date/heure à l'intérieur de chaque groupe. `recherche` filtre d'abord.
export function grouper(taches, recherche = "") {
  const requete = normaliser(recherche.trim());
  const filtrees = requete ? taches.filter((t) => normaliser(`${t.titre} ${t.notes}`).includes(requete)) : taches;
  const parImportance = (a, b) => Number(b.important) - Number(a.important) || horodatage(a) - horodatage(b);

  const enCours = filtrees.filter((t) => !t.fait);
  const groupes = [
    { id: "retard", nom: "⚠️ En retard", taches: enCours.filter((t) => estEnRetard(t)).sort(parImportance) },
    { id: "jour", nom: "📅 Aujourd'hui", taches: enCours.filter((t) => !estEnRetard(t) && estAujourdhui(t)).sort(parImportance) },
    { id: "venir", nom: "🗓️ À venir", taches: enCours.filter((t) => !estEnRetard(t) && !estAujourdhui(t) && t.date).sort(parImportance) },
    { id: "sans-date", nom: "📋 Sans date", taches: enCours.filter((t) => !t.date).sort(parImportance) },
    { id: "fait", nom: "✅ Terminées", taches: filtrees.filter((t) => t.fait).sort((a, b) => (b.faitLe ?? 0) - (a.faitLe ?? 0)) },
  ];
  return groupes.filter((g) => g.taches.length);
}

// Pour la pastille sur l'icône : tâches en retard ou dues aujourd'hui, non faites.
export function compterDues(taches = listerTaches(), maintenant = Date.now()) {
  return taches.filter((t) => !t.fait && (estEnRetard(t, maintenant) || estAujourdhui(t))).length;
}
