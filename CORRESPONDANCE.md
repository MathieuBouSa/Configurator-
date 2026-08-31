# Tableau de correspondance — atelier → configurateur BETA

Source de vérité : fichier `Configurator_Brainstorm_Solutions_1.xlsx` (onglets **Problems** et **Solutions**).
Chaque fonctionnalité de la maquette est reliée au problème (P#) et à la ligne de l'onglet Solutions qui la justifient.
Cette table est aussi visible dans l'outil (page « À propos de cette BETA »).

| P# | Problème (résumé) | Ligne Solutions | Fonctionnalité dans la BETA | Traitement |
|---|---|---|---|---|
| P1 | Identifier les appareils compatibles | l. 2 | Moteur de compatibilité à 3 états (compatible / **grisé avec la raison en une phrase** / avec limite), contrôle de complétude, produit manquant proposé avec bouton d'ajout | Fonctionnel |
| P2 | Faire correspondre besoins et produits | l. 3 | Logique **besoins → système abstrait (rôles) → produits** ; aucun catalogue montré avant la recommandation ; le questionnaire survit aux changements de catalogue | Fonctionnel |
| P3 | Parcours client flou | l. 4 | 4 étapes nommées « Mon logement · Mon chauffage · Mes habitudes · Ma solution », barre visible en permanence, retour sans perte | Fonctionnel |
| P4 | Client incertain du bon choix | l. 5 | « Votre solution » en 3 niveaux **Essential / Comfort / Premium** calculés par règles de composition + variante technique (têtes auto-équilibrantes) + packs séparés | Fonctionnel |
| P5 | Parcours non intuitif | l. 6 | Une question par écran, cartes illustrées cliquables, profil Particulier / Installateur choisi au départ (avec l'explication du pourquoi), vocabulaire adapté | Fonctionnel |
| P6 | Voir toutes les options | l. 7 | Écran résultat en 2 parties : logement pièce par pièce en haut, liste en dessous, bouton **« Autre choix »** par ligne (même rôle, compatible, écart prix + fonction en une ligne) | Fonctionnel |
| P7 | Trop d'étapes avant l'achat | l. 8 | **Proposition précoce** dès l'étape Mon chauffage, mise à jour en direct à chaque réponse ; 3 actions finales (liste par email, devis, mise en relation) | Fonctionnel (actions simulées) |
| P8 | Installateur obligé d'aller sur site | l. 9 | Espace pro : **pré-visite** — lien envoyé au client, 3 photos demandées explicitement, configuration pré-remplie à valider | Simulé (lien + retour client factices) |
| P9 | Pas de fournisseur unique | l. 10 | Routage par code postal vers le commercial du secteur, message clair « c'est un service, pas un blocage » | Simulé (payload visible en coulisses) |
| P10 | Adéquation au lieu à valider | l. 11 | Questions de contexte (murs, étages, surface, wifi) + règles de portée radio → **répéteur RE600 ajouté d'office, retirable**, avertissement, jamais de blocage | Fonctionnel |
| P11 | Choisir en ligne / hors ligne | l. 12 | Jamais demandé : 3 questions d'usage, **conclusion** « votre solution sera connectée » + carte comparative montrée une seule fois | Fonctionnel |
| P12 | Avantages du pilotage à distance flous | l. 13 | **4 situations vécues** en une phrase + image, placées exactement au moment des questions de connectivité | Fonctionnel |
| P13 | Installateur noyé dans la documentation | l. 14 | Matrice documentaire interrogée avec les produits sélectionnés : blocs par produit, **document manquant affiché comme manquant**, pack complet en un clic | Fonctionnel (documents de test) |
| P14 | Trouver le remplaçant d'un produit | l. 15 | Module remplacement : recherche **tolérante aux fautes**, concurrents couverts (Delta Dore, Netatmo, Honeywell, Tado) + anciens Salus, produits additionnels indiqués, photo d'étiquette (simulée) | Fonctionnel (table de 10 équivalences) |
| P15 | Configurateurs du marché trop limités | l. 16 | **Dossier qualifié** : tertiaire, > 12 zones, générateur/émetteur non couvert, GTB → le configurateur prépare le dossier avec sa recommandation, rappel sous 48 h ; chaque correction humaine = une règle à ajouter | Simulé (Deals Zoho en coulisses) |
| P16 | Pas de vidéos guidées | l. 17 | Vidéos attachées à un produit **et** à un moment (comprendre avant / installer après), jamais en bibliothèque isolée | Placeholders positionnés |
| P17 | Système difficile à visualiser | l. 18 | **Schéma généré automatiquement** depuis la configuration : générateur en bas à gauche, distribution au centre, pièces en haut, filaire en trait plein, radio en pointillé, eau en couleur | Fonctionnel (icônes placeholder) |
| P18 | Prix total difficile à comprendre | l. 19 | Prix total en direct, détail ligne par ligne, prix public conseillé partout (aucun prix net), installateurs **Club Pro par code postal**, membres en premier | Fonctionnel (prix fictifs marqués) |
| P19 | Économies difficiles à estimer | l. 20 | Calculateur : 4 entrées connues du client, résultat en **fourchette** (% et €/an), « voir la méthode » (EN 15232), calcul stocké avec la configuration | Fonctionnel (coefficients fictifs) |
| P20 | Pas de guide d'installation d'ensemble | l. 21 | **Guide unique généré en PDF** dans l'ordre réel du chantier : préparation, câblage (produits filaires seuls), appairage ordonné, mise en service, test final ; schéma en page 1 | Fonctionnel (contenu de test) |
| P21 | Bénéfices mal expliqués | l. 22 | Bénéfices exprimés **pièce par pièce**, générés à partir des pièces déclarées par le client | Fonctionnel |
| P22 | Comparer les options (économies, etc.) | — *(aucune ligne Solutions)* | **Ajout hors atelier, validé par Mathieu** : écran de comparaison des 3 niveaux côte à côte (prix, appareils, économies, pilotage) | Fonctionnel |
| P23 | Tout recommencer à chaque visite | l. 23 | **Code projet** dès la première réponse, reprise exacte à l'étape quittée (localStorage), lien de reprise par email (l'email alimente le CRM — P26 traité en même temps), relance à 48 h | Fonctionnel (email simulé) |
| P24 | Trouver le bon système dans un budget | l. 24 | Curseur budget ; niveau au-dessus du budget **visible et grisé avec l'écart affiché** ; nommage Essential/Comfort/Premium unique partout ; packs jamais mélangés aux niveaux | Fonctionnel |
| P25 | Transformer la config en devis | l. 25 | Devis généré (modèle unique, numérotation nationale simulée) au **prix public conseillé** ; message installateur « présentez ce devis à votre distributeur Salus (Espace Aubade, Algorel, Richardson) » — aucun prix net | Fonctionnel (PDF de test, Zoho simulé) |
| P26 | Configurateur non relié au CRM | l. 26 | Chaque configuration crée/actualise un Lead (profil, CP, projet, zones, niveau, montant, étape d'abandon) ; panneau **« Coulisses CRM »** : flux expliqués, payload en direct, journal des événements | Simulé intégralement (exigence BETA) |

## Ajouts hors fichier atelier (signalés, validés par Mathieu)

1. **Écran de comparaison des niveaux** — couvre P22, seul problème sans ligne de solution.
2. **Bouton « Scénario démo — maison mixte »** — parcours pré-rempli pour la présentation interne de 5 minutes.
3. **Page « À propos de cette BETA »** — cette table, dans l'outil.

Le bandeau BETA, les mentions « prix fictif », le panneau coulisses et le README viennent du brief BETA, pas du fichier atelier.

## Règles produits spécifiques (dictées par Mathieu, hors fichier)

- Niveaux TRV : Essential = 0 thermostat · Comfort = 1 thermostat pièce à vivre · Premium = thermostat dans chaque pièce.
- RX30RF proposé pour les deux univers (chaudière, PAC, circulateur, vannes), pré-coché si le générateur est accessible.
- Mixte : plancher au RDC → TRV proposées pour les pièces à radiateurs ; TRV proposées → option têtes auto-équilibrantes.
- RE600 conseillé si > 15 appareils radio, murs épais, étage à franchir, ou wifi déjà difficile (question proxy posée).
- Thermostats autonomes RF : Essential RT520RF · Comfort iT700 · Premium iT800 WiFi — **passerelle intégrée à leur récepteur chaudière** (pas d'UG800 ajouté). Filaire ON/OFF : RT520, WQ610.
- UG800 pour tout le reste du connecté ; chaque produit passant par l'UG800 est présenté « sous forme de solution : à quoi ça sert ».
- Pack sécurité (détecteurs de fenêtre selon le nombre de fenêtres demandé + détecteur de présence), pack volets roulants (RS600), prise intelligente via **relais SR600 logé dans la prise**.
