# Configurateur Salus — version BETA

Maquette fonctionnelle du configurateur unifié Salus Controls, destinée à une **démonstration interne**.
Ce n'est **pas un outil de production** : son seul but est de rendre le concept tangible — montrer comment
le configurateur fonctionnerait, ce qu'il produirait en sortie, et quel potentiel il représente.

Un seul parcours : **Mon logement → Mon chauffage → Mes habitudes → Ma solution.**
Chaque fonctionnalité vient de l'atelier Problems / Solutions — voir [CORRESPONDANCE.md](CORRESPONDANCE.md)
et la page « À propos » dans l'outil.

## Simulé vs réel — noir sur blanc

| Élément | Dans cette BETA | En production |
|---|---|---|
| **Prix** | **Fictifs**, générés pour la démo. Mention « prix fictif · BETA » sur chaque prix affiché. | Prix publics conseillés issus de l'ERP / tarif officiel. |
| **Références produits** | **Réelles** (UG800, TRV3RF, SQ610…, RT520, WQ610, iT700, iT800 WiFi, CB12RF, CB500CO, RX30RF, RE600, SR600, RS600, OS600, RSQ800WRF). Celles marquées « réf. à confirmer » (TRV3RF-AB, T30NC, THB, MS600) sont à valider. | Catalogue complet maintenu, disponibilité par pays. |
| **Règles de compatibilité** | Réduites au catalogue BETA (3 états : compatible / grisé avec raison / avec limite ; complétude vérifiée). | Matrice complète : protocole, alimentation, rôle, quantités, firmware, disponibilité pays. |
| **Documents** (fiches, guide d'installation, devis, pack) | **Documents de substitution** générés dynamiquement en PDF depuis la configuration : structure réelle, contenu factice, filigrane « DOCUMENT DE TEST ». | Matrice documentaire alimentée par les vraies notices, schémas de câblage et vidéos (un propriétaire unique du fichier, champ obligatoire à chaque création de code produit). |
| **CRM Zoho** | **Aucune connexion.** Le panneau « Coulisses CRM » montre les payloads JSON exacts (Leads / Quotes / Deals), le service cible, les enregistrements créés, les notifications et les suites pour le commercial et l'installateur. Rien ne quitte le navigateur. | Création/mise à jour réelle des Leads, devis Zoho à numérotation nationale, affectation par code postal, relance automatique à 48 h, tableau de bord. |
| **Emails / SMS** (liste, lien de reprise, pré-visite) | Simulés à l'écran (aperçu de l'email qui partirait). | Envois réels via le CRM. |
| **Reprise de projet** | Code projet réel + sauvegarde **localStorage** du navigateur. Le lien email est simulé. | Lien de reprise réel envoyé par email, synchronisé au CRM. |
| **Photos de pré-visite** | Emplacements simulés. | Upload réel de 3 photos demandées explicitement (générateur, radiateur + vanne, tableau électrique). |
| **Installateurs Club Pro / distributeurs** | Noms fictifs, secteur simulé. | Annuaire réel géolocalisé par code postal, membres Club Pro servis en premier. |
| **Économies estimées** | Fourchette calculée avec **coefficients et prix d'énergie fictifs** (méthode inspirée EN 15232, consultable dans l'outil). | Coefficients validés EN 15232, prix de l'énergie actualisés. |
| **Vidéos** | Placeholders positionnés aux bons moments du parcours. | Vidéos réelles : courtes pour choisir (≤ 1 min), par étape pour installer. |
| **Visuels** | Placeholders neutres aux bonnes dimensions (voir [VISUELS.md](VISUELS.md)) — remplacement par simple dépôt de fichier, sans toucher au code. | Photos produits, illustrations et bibliothèque d'icônes officielles. |
| **Schéma du système** | Généré réellement en SVG depuis la configuration (règles fixes, filaire plein / radio pointillé) avec des **icônes placeholder**. | Même générateur avec la bibliothèque d'icônes vectorielles officielle + une dizaine de dessins de référence. |
| **Reconnaissance d'étiquette** (module remplacement) | Bouton présent, fonction simulée. Table d'équivalence réduite à 10 entrées (Delta Dore, Netatmo, Honeywell, Tado, anciens Salus). | OCR de l'étiquette, table d'équivalence complète et enrichie par les demandes non trouvées. |

## Choix assumés de la BETA (à arbitrer)

- **Niveau Premium plancher chauffant** : ajoute des actionneurs auto-équilibrants (réf. THB à confirmer) —
  interprétation à valider, la règle atelier ne parlait que des TRV.
- **Bibliothèques embarquées** (`vendor/` : React 18, jsPDF, CSS Tailwind compilé) au lieu des CDN des
  configurateurs précédents : la démo fonctionne **même sans internet** et ne dépend d'aucun service tiers.
  Même stack, zéro build au déploiement (voir `build/README-build.md` pour recompiler le CSS si besoin).
- **Connectivité** : le réglage pièce par pièce de radiateurs à eau passe toujours par la passerelle UG800
  (réalité technique des TRV) ; la carte comparative l'explique au client.

## Lancer / déployer

Site 100 % statique — aucun build, aucune dépendance.

- **En local** : ouvrir `index.html`, ou `python3 -m http.server` puis http://localhost:8000
- **Netlify** : le dépôt est relié au site — chaque push déclenche un déploiement (`netlify.toml` : publish `.`)

## Structure

```
index.html            Point d'entrée (bandeau BETA permanent)
js/data/catalog.js    Catalogue produits (réels) + prix (fictifs) + règles
js/data/markets.js    Générateurs & émetteurs FR / UK / DE / RO / DK
js/data/copy.js       Textes, bénéfices par pièce, équivalences, scénario démo
js/engine.js          Moteur : besoins → système abstrait → produits, niveaux,
                      compatibilité 3 états, économies, dossier qualifié
js/schematic.js       Générateur de schéma système (SVG)
js/crm.js             Simulation Zoho CRM : payloads, flux expliqués, journal
js/docs.js            Documents PDF de substitution (jsPDF)
js/ui.js              Composants partagés · js/result.js Écran « Ma solution »
js/app.js             Parcours, accueil, remplacement, pré-visite, coulisses
assets/               Placeholders visuels (chemins figés — voir VISUELS.md)
vendor/               React, jsPDF, CSS Tailwind compilé (autonome)
build/                Config de recompilation du CSS (optionnel)
```

## Tester

- Moteur : `node tests/test-engine.js` (33 assertions, aucune dépendance à installer).
- Bouton **« Scénario démo — maison mixte »** sur l'accueil : parcours pré-rempli en un clic
  (plancher RDC + radiateurs étage + chaudière gaz), pour la présentation de 5 minutes.
