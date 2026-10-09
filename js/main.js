// Point d'entrée : restaure une éventuelle sauvegarde, câble les écrans, lance
// les vérifications de notifications et la pastille, puis affiche la liste.

import { afficherListe, initialiserListe } from "./liste.js";
import { initialiserFormulaire, ouvrirFormulaire } from "./formulaire.js";
import { initialiserReglages } from "./reglages.js";
import { demarrerVerifications, majBadge } from "./notifications.js";
import { restaurerDepuisAdresse } from "./restauration.js";
import { appliquerTheme } from "./theme.js";
import { $, message } from "./utils.js";

appliquerTheme();

async function demarrer() {
  try {
    const restaurees = await restaurerDepuisAdresse();
    if (restaurees !== null) message(`✅ ${restaurees} tâche(s) restaurée(s).`);
  } catch (e) {
    message(`⚠️ Lien de sauvegarde invalide : ${e.message}`);
  }
  initialiserListe(ouvrirFormulaire);
  initialiserFormulaire(afficherListe);
  initialiserReglages(afficherListe);
  $("rap-ajout-btn").addEventListener("click", () => ouvrirFormulaire());
  afficherListe();
  demarrerVerifications();
  majBadge();

  // Reçu via le menu Partager du téléphone (ex: NoticeKona -> Partager une
  // fiche), ou via un lien direct construit par une autre appli -- ouvre
  // directement une nouvelle tâche préremplie. Demande explicite du
  // 2026-10-09.
  const parametres = new URLSearchParams(location.search);
  const titrePartage = parametres.get("titre");
  if (titrePartage) {
    history.replaceState(null, "", location.pathname);
    ouvrirFormulaire(null, { titrePredefini: titrePartage, notesPredefinies: parametres.get("texte") || "" });
  }

  const splash = $("rap-splash");
  splash.classList.add("fini");
  setTimeout(() => splash.remove(), 400);
}

demarrer();

// Lien de sauvegarde ouvert alors que l'appli l'était déjà (même onglet) :
// changer seulement le "#" ne recharge pas la page (même document), donc le
// code de restauration ci-dessus ne s'exécuterait jamais -- on force un vrai
// rechargement (même principe que TrajetVE et Coffre pour leur propre lien).
window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#rappels=")) location.reload();
});

// Revérifie les échéances dès que l'appli revient au premier plan.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    demarrerVerifications();
    majBadge();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
