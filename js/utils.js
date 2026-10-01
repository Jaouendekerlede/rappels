// Petits outils partagés : accès au DOM, messages, dates.

export const $ = (id) => document.getElementById(id);

export function el(balise, classe, texte) {
  const e = document.createElement(balise);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = texte;
  return e;
}

let delaiMessage = null;
export function message(texte, duree = 3500) {
  const m = $("rap-message");
  m.textContent = texte;
  m.hidden = false;
  clearTimeout(delaiMessage);
  delaiMessage = setTimeout(() => (m.hidden = true), duree);
}

// "2026-10-01" (heure locale, pas UTC -- toISOString décalerait la date le
// soir selon le fuseau horaire).
export function aujourdhui(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function dateLisible(iso) {
  const [an, mois, jour] = iso.split("-").map(Number);
  const cible = new Date(an, mois - 1, jour);
  const diffJours = Math.round((cible - new Date(aujourdhui() + "T00:00:00")) / 86400000);
  if (diffJours === 0) return "Aujourd'hui";
  if (diffJours === 1) return "Demain";
  if (diffJours === -1) return "Hier";
  const options = cible.getFullYear() === new Date().getFullYear() ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" };
  return cible.toLocaleDateString("fr-FR", options);
}

export function heureLisible(hhmm) {
  return hhmm ? ` à ${hhmm}` : "";
}

// Horodatage comparable (tri) : date + heure (minuit si pas d'heure précisée).
export function horodatage(tache) {
  if (!tache.date) return Infinity;
  return new Date(`${tache.date}T${tache.heure || "00:00"}:00`).getTime();
}

export function estEnRetard(tache, maintenant = Date.now()) {
  if (!tache.date || tache.fait) return false;
  if (tache.heure) return horodatage(tache) < maintenant;
  return tache.date < aujourdhui(); // sans heure : "en retard" seulement le lendemain
}

export function estAujourdhui(tache) {
  return tache.date === aujourdhui();
}
