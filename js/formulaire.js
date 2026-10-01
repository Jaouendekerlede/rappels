// Formulaire d'ajout / modification d'une tâche.

import { RECURRENCES } from "./config.js";
import { listerTaches } from "./storage.js";
import { ajouterTache, modifierTache, nouvelleTacheVide, supprimerTache } from "./taches.js";
import { $, aujourdhui } from "./utils.js";

let idEnCours = null;
let surChangement = () => {};

export function ouvrirFormulaire(id = null, { datePredefinies } = {}) {
  idEnCours = id;
  const existante = id ? listerTaches().find((t) => t.id === id) : null;
  const tache = existante ?? { ...nouvelleTacheVide(), date: datePredefinies ?? "" };
  $("rap-form-titre").textContent = existante ? "Modifier la tâche" : "Nouvelle tâche";
  $("rap-f-supprimer").hidden = !existante;
  $("rap-f-titre-champ").value = tache.titre;
  $("rap-f-date").value = tache.date;
  $("rap-f-heure-zone").hidden = !tache.date;
  $("rap-f-recurrence-zone").hidden = !tache.date;
  $("rap-f-heure").value = tache.heure;
  $("rap-f-recurrence").value = tache.recurrence;
  $("rap-f-important").checked = !!tache.important;
  $("rap-f-notes").value = tache.notes;
  $("rap-form").showModal();
  setTimeout(() => $("rap-f-titre-champ").focus(), 50);
}

function fermer() {
  $("rap-form").close();
}

function enregistrer(e) {
  e.preventDefault();
  const titre = $("rap-f-titre-champ").value.trim();
  if (!titre) return;
  const champs = {
    titre,
    date: $("rap-f-date").value,
    heure: $("rap-f-date").value ? $("rap-f-heure").value : "", // une heure sans date n'a pas de sens
    recurrence: $("rap-f-date").value ? $("rap-f-recurrence").value : "",
    important: $("rap-f-important").checked,
    notes: $("rap-f-notes").value.trim(),
  };
  if (idEnCours) modifierTache(idEnCours, champs);
  else ajouterTache(champs);
  fermer();
  surChangement();
}

export function initialiserFormulaire(apresChangement) {
  surChangement = apresChangement;
  $("rap-f-date").min = aujourdhui();
  $("rap-f-recurrence").replaceChildren(...RECURRENCES.map((r) => new Option(r.nom, r.id)));
  $("rap-f-date").addEventListener("change", () => {
    const vide = !$("rap-f-date").value;
    $("rap-f-heure-zone").hidden = vide;
    $("rap-f-recurrence-zone").hidden = vide;
    if (vide) {
      $("rap-f-heure").value = "";
      $("rap-f-recurrence").value = "";
    }
  });
  $("rap-f-annuler").addEventListener("click", fermer);
  $("rap-form").addEventListener("cancel", fermer);
  $("rap-f-supprimer").addEventListener("click", () => {
    if (idEnCours && confirm("Supprimer cette tâche ?")) {
      supprimerTache(idEnCours);
      fermer();
      surChangement();
    }
  });
  $("rap-form-corps").addEventListener("submit", enregistrer);
}
