// Deux mécanismes, tous deux sans serveur :
//  - la pastille sur l'icône de l'appli (navigator.setAppBadge), un nombre
//    visible même appli fermée sur Android/Chrome installé -- posée à chaque
//    lancement et à chaque changement de tâche, elle ne "se déclenche" pas à
//    une heure précise, elle reflète juste l'état actuel ;
//  - une vraie notification, mais seulement pendant que l'appli est ouverte
//    (ou rouverte peu après) : sans serveur, impossible de réveiller le
//    téléphone à une heure précise appli fermée.

import { DELAI_VERIFICATION_MS } from "./config.js";
import { listerTaches } from "./storage.js";
import { compterDues } from "./taches.js";
import { horodatage } from "./utils.js";

const dejaNotifiees = new Set();
let minuteur = null;

export function badgeDisponible() {
  return "setAppBadge" in navigator;
}

export function notificationsDisponibles() {
  return "Notification" in window;
}

export function permissionActuelle() {
  return notificationsDisponibles() ? Notification.permission : "unsupported";
}

export async function demanderPermission() {
  if (!notificationsDisponibles()) return "unsupported";
  return Notification.requestPermission();
}

export async function majBadge() {
  if (!badgeDisponible()) return;
  const n = compterDues(listerTaches());
  try {
    if (n > 0) await navigator.setAppBadge(n);
    else await navigator.clearAppBadge();
  } catch {
    // Refusé par le navigateur : tant pis, pas bloquant.
  }
}

function verifierEcheances() {
  if (Notification.permission !== "granted") return;
  const maintenant = Date.now();
  for (const t of listerTaches()) {
    if (t.fait || !t.date || !t.heure || dejaNotifiees.has(t.id)) continue;
    const h = horodatage(t);
    // Dans la minute écoulée : évite de notifier une échéance d'il y a des
    // jours à la première vérification après une longue absence.
    if (h <= maintenant && h > maintenant - 2 * DELAI_VERIFICATION_MS) {
      dejaNotifiees.add(t.id);
      try {
        new Notification("⏰ Rappels", { body: t.titre, icon: "icons/icon-192.png", tag: t.id });
      } catch {
        // Notification refusée/indisponible à cet instant : tant pis.
      }
    }
  }
}

export function demarrerVerifications() {
  clearInterval(minuteur);
  verifierEcheances();
  minuteur = setInterval(verifierEcheances, DELAI_VERIFICATION_MS);
}
