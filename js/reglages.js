// Fenêtre Réglages : thème, notifications, nettoyage des tâches terminées,
// lien de sauvegarde et mentions légales.

import { LIEN_LONG } from "./config.js";
import { MENTION_COURTE, MENTION_LEGALE, VERSION_TEXTE } from "./mentions.js";
import { demanderPermission, majBadge, notificationsDisponibles, permissionActuelle } from "./notifications.js";
import { creerLienSauvegarde } from "./restauration.js";
import { ecrireTaches, listerTaches, lirePrefs, sauverPrefs } from "./storage.js";
import { appliquerTheme } from "./theme.js";
import { $, message } from "./utils.js";

function majEtatNotifications() {
  if (!notificationsDisponibles()) {
    $("rap-notif-etat").textContent = "Non disponibles sur ce navigateur.";
    $("rap-notif-btn").hidden = true;
    return;
  }
  const p = permissionActuelle();
  $("rap-notif-btn").hidden = p !== "default";
  $("rap-notif-etat").textContent =
    p === "granted"
      ? "✅ Activées : un rappel s'affiche quand une tâche avec une heure arrive à échéance, tant que l'appli est ouverte (ou récemment ouverte)."
      : p === "denied"
        ? "🚫 Refusées -- réactive-les dans les réglages du navigateur si tu changes d'avis."
        : "Pas encore activées.";
}

let surChangement = () => {};

async function nettoyerTerminees() {
  const taches = listerTaches();
  const nb = taches.filter((t) => t.fait).length;
  if (!nb) return message("Aucune tâche terminée à nettoyer.");
  if (!confirm(`Supprimer les ${nb} tâche(s) terminée(s) ? C'est définitif.`)) return;
  ecrireTaches(taches.filter((t) => !t.fait));
  $("rap-reglages").close();
  message(`${nb} tâche(s) supprimée(s).`);
  surChangement();
}

async function creerSauvegarde() {
  const retour = $("rap-sauvegarde-retour");
  retour.hidden = false;
  retour.textContent = "Préparation du lien…";
  try {
    const lien = await creerLienSauvegarde();
    let copie = false;
    try {
      await navigator.clipboard.writeText(lien);
      copie = true;
    } catch {
      // Presse-papiers refusé : le lien reste affiché pour le copier à la main.
    }
    const tropLong = lien.length > LIEN_LONG ? " ⚠️ Il est assez long : certaines messageries le coupent, préfère un mail ou une note." : "";
    retour.textContent = copie ? `✅ Lien copié dans le presse-papiers.${tropLong}` : `Copie ce lien :${tropLong} ${lien}`;
  } catch (e) {
    retour.textContent = `⚠️ Impossible de créer le lien : ${e.message}`;
  }
}

export function initialiserReglages(apresChangement) {
  surChangement = apresChangement;
  $("rap-version").textContent = VERSION_TEXTE;
  $("rap-mention").textContent = `${MENTION_COURTE}. ${MENTION_LEGALE}`;

  $("rap-reglages-btn").addEventListener("click", () => {
    $("rap-theme").value = lirePrefs().theme ?? "auto";
    $("rap-sauvegarde-retour").hidden = true;
    majEtatNotifications();
    $("rap-reglages").showModal();
  });
  $("rap-reglages-fermer").addEventListener("click", () => $("rap-reglages").close());
  $("rap-theme").addEventListener("change", (e) => {
    sauverPrefs({ theme: e.target.value });
    appliquerTheme(e.target.value);
  });
  $("rap-notif-btn").addEventListener("click", async () => {
    await demanderPermission();
    majEtatNotifications();
    majBadge();
  });
  $("rap-nettoyer-btn").addEventListener("click", nettoyerTerminees);
  $("rap-sauvegarde-btn").addEventListener("click", creerSauvegarde);
}
