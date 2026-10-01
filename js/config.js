// Constantes de l'appli.

export const STORAGE_KEYS = {
  taches: "rap_taches",
  prefs: "rap_prefs",
};

export const RECURRENCES = [
  { id: "", nom: "Ne se répète pas" },
  { id: "quotidien", nom: "Tous les jours" },
  { id: "hebdomadaire", nom: "Toutes les semaines" },
  { id: "mensuel", nom: "Tous les mois" },
];

// Vérifie les tâches dues toutes les X ms pendant que l'appli est ouverte
// (aucune notification n'est possible appli fermée, sans serveur).
export const DELAI_VERIFICATION_MS = 30 * 1000;

export const LIEN_LONG = 30000;
