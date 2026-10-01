// Calcul de la prochaine échéance d'une tâche répétée. Une tâche répétée
// garde un seul exemplaire : cocher "fait" avance sa date au lieu d'en créer
// une nouvelle (pas d'historique qui s'accumule).

function ajouterJours(iso, n) {
  const [an, mois, jour] = iso.split("-").map(Number);
  const d = new Date(an, mois - 1, jour + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// +1 mois en gardant le jour, ramené au dernier jour du mois cible si besoin
// (ex. 31 janvier -> 28/29 février, jamais un débordement sur mars).
function ajouterMois(iso, n) {
  const [an, mois, jour] = iso.split("-").map(Number);
  const dernierJourCible = new Date(an, mois - 1 + n + 1, 0).getDate();
  const d = new Date(an, mois - 1 + n, Math.min(jour, dernierJourCible));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Renvoie la date ISO suivante, ou null si pas de date ou pas de répétition.
export function prochaineDate(tache) {
  if (!tache.date || !tache.recurrence) return null;
  if (tache.recurrence === "quotidien") return ajouterJours(tache.date, 1);
  if (tache.recurrence === "hebdomadaire") return ajouterJours(tache.date, 7);
  if (tache.recurrence === "mensuel") return ajouterMois(tache.date, 1);
  return null;
}
