// Lien de sauvegarde : toutes les tâches, compressées dans l'adresse de
// l'appli après le « # ». Même principe que Vallet/MeteoAI/TrajetVE : sans
// rappel automatique, juste un bouton dans Réglages. La partie après « # »
// n'est jamais envoyée à GitHub Pages.

import { listerTaches, ecrireTaches } from "./storage.js";

const MARQUE = "#rappels=";
const FORMAT = "rappels-sauvegarde";

async function transformer(octets, flux) {
  const sortie = new Blob([octets]).stream().pipeThrough(flux);
  return new Uint8Array(await new Response(sortie).arrayBuffer());
}

function versBase64Url(octets) {
  let binaire = "";
  for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode(...octets.subarray(i, i + 0x8000));
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function depuisBase64Url(texte) {
  const binaire = atob(texte.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binaire, (c) => c.charCodeAt(0));
}

export async function creerLienSauvegarde(adresse = location.href) {
  const sauvegarde = { format: FORMAT, date: new Date().toISOString(), taches: listerTaches() };
  const octets = await transformer(new TextEncoder().encode(JSON.stringify(sauvegarde)), new CompressionStream("deflate"));
  const base = adresse.split("#")[0].split("?")[0];
  return `${base}${MARQUE}${versBase64Url(octets)}`;
}

// À appeler une fois au démarrage. Si l'adresse contient un lien, restaure
// (remplace toutes les tâches actuelles) et nettoie l'adresse. Renvoie le
// nombre de tâches restaurées, ou null si l'adresse n'en contenait pas.
export async function restaurerDepuisAdresse() {
  const hash = location.hash;
  if (!hash.startsWith(MARQUE)) return null;
  history.replaceState(null, "", location.pathname);
  const octets = await transformer(depuisBase64Url(hash.slice(MARQUE.length)), new DecompressionStream("deflate"));
  const sauvegarde = JSON.parse(new TextDecoder().decode(octets));
  if (sauvegarde?.format !== FORMAT || !Array.isArray(sauvegarde.taches)) throw new Error("ce lien n'est pas une sauvegarde Rappels valide");
  ecrireTaches(sauvegarde.taches);
  return sauvegarde.taches.length;
}
