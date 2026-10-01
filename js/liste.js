// Affichage de la liste : groupes par échéance, chaque tâche cliquable.

import { listerTaches } from "./storage.js";
import { basculerFait, grouper } from "./taches.js";
import { majBadge } from "./notifications.js";
import { $, dateLisible, el, heureLisible } from "./utils.js";

let recherche = "";
let surOuvrir = () => {};

const NOMS_RECURRENCE = { quotidien: "🔁 tous les jours", hebdomadaire: "🔁 toutes les semaines", mensuel: "🔁 tous les mois" };

function sousTitre(t) {
  const morceaux = [];
  if (t.date) morceaux.push(dateLisible(t.date) + heureLisible(t.heure));
  if (t.recurrence) morceaux.push(NOMS_RECURRENCE[t.recurrence]);
  if (t.notes) morceaux.push(t.notes);
  return morceaux.join(" · ");
}

function creerLigne(tache) {
  const ligne = el("div", "rap-tache" + (tache.fait ? " fait" : ""));
  const coche = el("button", "rap-coche" + (tache.fait ? " coche" : ""));
  coche.type = "button";
  coche.setAttribute("aria-label", tache.fait ? "Marquer à faire" : "Marquer fait");
  coche.textContent = tache.fait ? "✓" : "";
  coche.addEventListener("click", (e) => {
    e.stopPropagation();
    basculerFait(tache.id);
    afficherListe();
  });
  const corps = el("div", "rap-tache-corps");
  const titre = el("div", "rap-tache-titre", tache.titre || "(sans titre)");
  if (tache.important) titre.append(el("span", "rap-etoile", " ★"));
  corps.append(titre);
  const sous = sousTitre(tache);
  if (sous) corps.append(el("div", "rap-tache-sous", sous));
  ligne.append(coche, corps);
  ligne.addEventListener("click", () => surOuvrir(tache.id));
  return ligne;
}

export function afficherListe() {
  const toutes = listerTaches();
  const groupes = grouper(toutes, recherche);
  const conteneur = $("rap-liste");
  conteneur.replaceChildren();
  if (!toutes.length) {
    conteneur.append(el("div", "rap-vide", "Rien à faire pour l'instant.\nAppuie sur ＋ pour ajouter ta première tâche."));
  } else if (!groupes.length) {
    conteneur.append(el("div", "rap-vide", "Aucune tâche ne correspond."));
  } else {
    for (const g of groupes) {
      const section = el("section", "rap-groupe" + (g.id === "fait" ? " rap-groupe-fait" : ""));
      section.append(el("h2", "rap-groupe-titre", `${g.nom} (${g.taches.length})`));
      section.append(...g.taches.map(creerLigne));
      conteneur.append(section);
    }
  }
  majBadge();
}

export function initialiserListe(ouvrir) {
  surOuvrir = ouvrir;
  $("rap-recherche").addEventListener("input", (e) => {
    recherche = e.target.value;
    afficherListe();
  });
}
