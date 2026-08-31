# Visuels attendus — configurateur BETA

Des placeholders neutres sont en place aux bonnes dimensions, avec des **chemins figés** :
pour mettre un vrai visuel, il suffit de **déposer le fichier au même chemin, avec le même nom**
— aucun code à modifier. Le nom et l'extension doivent rester exactement ceux listés
(une photo JPEG convient si elle est enregistrée/renommée en `.png`).

Règle générale : fond clair ou détouré, pas de texte incrusté (les libellés sont dans l'interface).

## 1. Photos produits — `assets/products/` · PNG · **800 × 800** · ratio 1:1 · ≤ 200 Ko

Produit détouré sur fond blanc ou transparent, vue de trois quarts, l'écran allumé quand il y en a un.

| Fichier | Produit | Vu sur les écrans |
|---|---|---|
| `ug800.png` | Passerelle UG800 avec son câble réseau | Liste solution, Autre choix, documents |
| `trv3rf.png` | Tête TRV3RF montée sur un corps de robinet | idem |
| `trv3rf-ab.png` | Tête auto-équilibrante (variante) | Autre choix, variante technique |
| `sq610.png` / `sq610b.png` | Thermostat SQ610 blanc / noir, de face, écran allumé | idem |
| `sq610rf.png` / `sq610brf.png` | SQ610RF blanc / noir sur son support aimanté | idem |
| `rx30rf.png` | Récepteur RX30RF | idem |
| `cb12rf.png` | Centre de câblage CB12RF, capot ouvert | idem |
| `cb500co.png` | Centre de câblage CB500CO | idem |
| `t30nc.png` | Actionneur thermique sur collecteur | idem |
| `thb.png` | Actionneur auto-équilibrant | idem |
| `el600f.png` | Thermostat fil pilote EL600F | idem |
| `re600.png` | Répéteur RE600 branché sur une prise | idem |
| `sr600.png` | Relais SR600 tenu entre deux doigts (échelle) | idem |
| `rs600.png` | Module volet RS600 | idem |
| `os600.png` | Détecteur d'ouverture posé sur une fenêtre | Packs |
| `ms600.png` | Détecteur de présence | Packs |
| `rt520.png` / `rt520rf.png` | RT520 seul / kit RT520RF avec récepteur | Liste solution (parcours mono-zone) |
| `wq610.png` | Thermostat WQ610 | idem |
| `it700.png` | Kit iT700 : thermostat + récepteur à passerelle intégrée | idem |
| `it800wifi.png` | iT800 WiFi et son récepteur | idem |
| `rsq800wrf.png` | Thermostat R-System RSQ800WRF | Parcours gainable |

## 2. Illustrations de questions — `assets/questions/` · PNG · **600 × 400** · ratio 3:2 · ≤ 150 Ko

Photo ou illustration très lisible : le client doit reconnaître SA situation en une seconde.

| Fichier | Écran (question) | Ce qui doit être visible |
|---|---|---|
| `logement-maison.png` · `logement-appartement.png` · `logement-tertiaire.png` | Mon logement — type | Maison individuelle / immeuble d'habitation / bâtiment de bureaux-commerce |
| `niveaux-plainpied.png` · `niveaux-1etage.png` · `niveaux-2etages.png` | Mon logement — niveaux | Coupe ou façade évoquant 1, 2, 3+ niveaux |
| `murs-standard.png` · `murs-epais.png` · `murs-inconnu.png` | Mon logement — murs | Mur brique/placo · mur en pierre épais · point d'interrogation sobre |
| `gen-gaz.png` | Mon chauffage — générateur | Chaudière gaz murale |
| `gen-fioul.png` | idem | Chaudière fioul au sol avec cuve évoquée |
| `gen-pac-eau.png` | idem | Unité extérieure PAC + départ hydraulique |
| `gen-pac-air.png` | idem | Unité extérieure + grille de soufflage |
| `gen-electrique.png` | idem | Radiateur électrique + tableau |
| `gen-reseau.png` | idem | Sous-station / échangeur réseau urbain |
| `gen-bois.png` | idem | Poêle à granulés |
| `gen-inconnu.png` | idem | Point d'interrogation sobre |
| `emit-radiateur-eau.png` | Mon chauffage — émetteurs | Radiateur acier avec robinet thermostatique |
| `emit-plancher-eau.png` | idem | Serpentins de plancher + collecteur |
| `emit-plancher-elec.png` | idem | Trame électrique sous carrelage |
| `emit-radiateur-elec.png` | idem | Panneau rayonnant au mur |
| `emit-gainable.png` | idem | Grille de soufflage plafond + gaine |
| `emit-ventilo.png` | idem | Ventilo-convecteur console |
| `cables-oui.png` · `cables-non.png` | Mon chauffage — câbles existants | Boîtier mural avec fils apparents / mur nu (les 2 photos de la solution atelier P5) |
| `zonage-multi.png` · `zonage-mono.png` | Mon chauffage — pièce par pièce | Le dessin des « deux maisons » : pièces à températures différentes / uniformes (solution atelier P6) |

## 3. Situations vécues — `assets/situations/` · PNG · **800 × 500** · ratio 16:10 · ≤ 180 Ko

Illustrations chaleureuses, une personne dans la situation (solutions atelier P12/P13).

| Fichier | Situation illustrée |
|---|---|
| `situation-train.png` | Personne dans le train, téléphone en main, maison au loin |
| `situation-gel.png` | Maison de vacances sous la neige + notification d'alerte |
| `situation-installateur.png` | Installateur au bureau réglant à distance |
| `situation-voiture.png` | Conducteur à l'arrêt, app ouverte |

## 4. Pictogrammes pièces — `assets/pieces/` · PNG · **400 × 400** · ratio 1:1 · ≤ 80 Ko

Style pictogramme uniforme (même trait, mêmes couleurs charte).
`piece-sejour.png`, `piece-cuisine.png`, `piece-chambre.png`, `piece-bureau.png`, `piece-sdb.png`, `piece-autre.png`.

## 5. Accueil — `assets/hero/`

| Fichier | Format / dimensions | Poids max | Description |
|---|---|---|---|
| `logo-salus.png` | PNG transparent · **480 × 120** (4:1) | 50 Ko | Logo officiel Salus Controls |
| `profil-particulier.png` | PNG/JPG · **800 × 450** (16:9) | 250 Ko | Famille dans son salon, ambiance chaleureuse |
| `profil-installateur.png` | PNG/JPG · **800 × 450** (16:9) | 250 Ko | Installateur en intervention devant une chaudière |

## 6. À prévoir pour la suite (pas encore de placeholder fichier)

| Élément | Format | Usage |
|---|---|---|
| Bibliothèque d'icônes du schéma système | SVG vectoriel, un fichier par bloc : générateur, circulateur, vanne, collecteur, centre de câblage, thermostat, tête TRV, passerelle, box internet, sonde extérieure | Remplace les icônes placeholder dessinées dans `js/schematic.js` — prévoir aussi ~10 schémas de référence dessinés à la main comme modèles (solution atelier P18) |
| Vidéos courtes de choix (≤ 1 min) et d'installation (par étape) | MP4 H.264 960 × 540 + vignette PNG | Remplacent les blocs « vidéo de substitution » ; à attacher produit + moment du parcours (P17) |
