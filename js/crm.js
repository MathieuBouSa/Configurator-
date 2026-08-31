/* ============================================================
   SALUS Configurateur BETA — Simulation CRM Zoho (P25 / P26)
   ------------------------------------------------------------
   AUCUNE connexion réelle. Ce module construit exactement ce qui
   PARTIRAIT vers Zoho CRM en production : payloads JSON, service
   cible, enregistrements créés, notifications déclenchées et
   suites pour le commercial et l'installateur. Le panneau
   « coulisses » de l'interface affiche ces données.
   ============================================================ */

(function () {
  const CAT = globalThis.SALUS_CATALOG;
  const COPY = globalThis.SALUS_COPY;

  /* Journal des événements CRM simulés de la session */
  const eventLog = [];

  function logEvent(kind, title, payload, explain) {
    eventLog.push({
      at: new Date().toISOString(),
      kind, title, payload, explain
    });
    return eventLog[eventLog.length - 1];
  }

  function getLog() { return eventLog.slice().reverse(); }

  /* ---------- Payloads Zoho ---------- */

  function leadPayload(answers, meta) {
    meta = meta || {};
    const rooms = answers.rooms || [];
    return {
      module: "Leads",
      endpoint: "POST https://www.zohoapis.eu/crm/v8/Leads",
      trigger: ["workflow", "blueprint"],
      data: [{
        Lead_Source: "Configurateur Web",
        Layout: "Configurateur",
        Company: answers.profile === "installer" ? "(société installateur)" : "Particulier",
        Last_Name: "(nom saisi à l'étape contact)",
        Email: "(email saisi — sert aussi au lien de reprise)",
        Zip_Code: answers.postalCode || "(code postal)",
        Country: "France",
        Profil: answers.profile === "installer" ? "Installateur" : "Particulier",
        Type_de_projet: describeProject(answers),
        Generateur: answers.generator || null,
        Nombre_de_zones: rooms.length,
        Niveau_choisi: meta.level || "(non choisi)",
        Montant_estime: meta.total || null,
        Etape_d_abandon: meta.abandonStep || null,
        Code_projet: meta.projectCode || null,
        Configuration_JSON: "(configuration complète sérialisée — reprise & SAV)"
      }]
    };
  }

  function quotePayload(answers, selection, meta) {
    meta = meta || {};
    const lines = (selection.items || []).map(it => {
      const p = CAT.products[it.ref] || {};
      return {
        Product_Code: p.ref || it.ref,
        Product_Name: p.name || it.ref,
        Quantity: it.qty,
        List_Price: p.price,
        Total: p.price * it.qty
      };
    });
    return {
      module: "Quotes",
      endpoint: "POST https://www.zohoapis.eu/crm/v8/Quotes",
      trigger: ["workflow"],
      data: [{
        Subject: "Devis configurateur " + (meta.projectCode || ""),
        Quote_Number: "(numérotation unique nationale — modèle unique)",
        Quote_Stage: "Draft",
        Valid_Till: "(date + 30 jours)",
        Billing_Code: answers.postalCode || null,
        Adjusted_By: "Configurateur",
        Niveau: meta.level,
        Prix_affiche: "Prix public conseillé (jamais de prix net dans l'outil)",
        Message_installateur: answers.profile === "installer"
          ? "Présentez ce devis à votre distributeur Salus (" + COPY.distributors.join(", ") + ") pour obtenir votre remise professionnelle."
          : null,
        Product_Details: lines,
        Grand_Total: lines.reduce((s, l) => s + l.Total, 0)
      }]
    };
  }

  function qualifiedFilePayload(answers, reasons, meta) {
    return {
      module: "Deals",
      endpoint: "POST https://www.zohoapis.eu/crm/v8/Deals",
      trigger: ["workflow", "approval"],
      data: [{
        Deal_Name: "Projet à valider — " + describeProject(answers),
        Stage: "Validation technique",
        Lead_Source: "Configurateur Web",
        Zip_Code: answers.postalCode || "(code postal)",
        Motifs_de_sortie: reasons,
        Recommandation_configurateur: "(recommandation partielle + hypothèses + points à vérifier)",
        Assigne_a: "(commercial du secteur — règle d'affectation par code postal)",
        SLA: "Rappel sous 48 h"
      }]
    };
  }

  /* ---------- Explications « ce qui se passerait en vrai » ---------- */

  const flows = {
    lead: {
      title: "Création / mise à jour du lead",
      what: "Dès la première réponse, un enregistrement Lead est créé dans Zoho CRM, puis mis à jour à chaque étape (module Leads, layout « Configurateur »).",
      dataSent: "Profil, code postal, type de projet, générateur, nombre de zones, niveau choisi, montant estimé, étape d'abandon, code projet, configuration complète en JSON.",
      record: "1 Lead par configuration (dédupliqué par email + code projet).",
      notifications: [
        "Règle d'affectation Zoho : le lead est assigné au commercial du secteur (code postal).",
        "Workflow « abandon » : si aucune activité pendant 48 h, email automatique de reprise avec le lien du projet.",
        "Tableau de bord Zoho Analytics : volumes, niveaux choisis, étapes d'abandon — ce que le marché demande vraiment."
      ],
      next: "Le commercial voit arriver des leads qualifiés avec la configuration complète ; l'installateur Club Pro du secteur reçoit les demandes de mise en relation en priorité."
    },
    quote: {
      title: "Génération du devis",
      what: "La configuration part vers Zoho CRM qui produit le devis (module Quotes) avec un modèle unique et une numérotation nationale.",
      dataSent: "Lignes produits (codes exacts, quantités, prix publics conseillés), total, code postal, niveau choisi.",
      record: "1 Quote rattaché au Lead / Contact.",
      notifications: [
        "Particulier : le devis part par email, l'enregistrement entre au CRM.",
        "Installateur : devis au prix public + message « présentez ce devis à votre distributeur Salus pour votre remise professionnelle » — aucun prix net dans l'outil, le rôle du distributeur est protégé.",
        "Le distributeur chiffre sans retaper : les codes produits exacts sont sur le devis."
      ],
      next: "Le projet revient dans le réseau de distribution (Espace Aubade, Algorel, Richardson…)."
    },
    qualified: {
      title: "Dossier qualifié — reprise humaine",
      what: "Quand le projet sort du parcours automatique (tertiaire, >12 zones, générateur non couvert, GTB), le configurateur ne bloque pas : il prépare le dossier avec sa recommandation partielle et l'envoie au commercial du secteur (module Deals, étape « Validation technique »).",
      dataSent: "Configuration complète, motifs de sortie, recommandation du configurateur, hypothèses, points à vérifier, contact et code postal.",
      record: "1 Deal assigné au commercial du secteur.",
      notifications: [
        "Notification immédiate au commercial (règle d'affectation par code postal).",
        "SLA : rappel du client sous 48 h.",
        "Chaque correction du commercial devient une règle à ajouter au configurateur — c'est ainsi que l'outil s'améliore."
      ],
      next: "Le commercial oriente vers le distributeur capable de tout fournir ; le client a vu un message clair : « votre projet mérite une validation, un technicien Salus vous rappelle sous 48 h »."
    },
    previsit: {
      title: "Questionnaire pré-visite (installateur)",
      what: "Le bouton « préparer une visite » crée un lien unique envoyé au client. Ses réponses et ses 3 photos pré-remplissent la configuration.",
      dataSent: "Réponses du questionnaire particulier + 3 photos demandées explicitement : le générateur, un radiateur avec sa vanne, le tableau électrique.",
      record: "La configuration liée au Lead passe à l'état « pré-visite complétée ».",
      notifications: ["L'installateur reçoit une notification : configuration pré-remplie à valider ou corriger avant de se déplacer."],
      next: "L'installateur arrive sur site avec le matériel déjà chiffré."
    },
    resume: {
      title: "Lien de reprise (email)",
      what: "Le code projet est créé à la première réponse et conservé dans le navigateur. L'email saisi pour recevoir le lien de reprise alimente aussi le CRM (P23 + P26 traités ensemble).",
      dataSent: "Email + code projet + étape courante.",
      record: "Le Lead existant est complété avec l'email.",
      notifications: ["Email immédiat « continuez votre configuration où vous l'avez laissée »", "Relance automatique à 48 h si le client n'est pas revenu."],
      next: "Le client rouvre le parcours exactement à l'étape quittée, toutes réponses conservées."
    }
  };

  function describeProject(a) {
    const rooms = a.rooms || [];
    const emitters = [...new Set(rooms.map(r => r.emitter).filter(Boolean))];
    const labels = { water_radiators: "radiateurs eau", ufh_water: "plancher chauffant", ufh_electric: "plancher électrique", electric_radiators: "radiateurs électriques", ducted_ac: "gainable", fan_coils: "ventilo-convecteurs" };
    return [
      a.homeType === "house" ? "Maison" : a.homeType === "flat" ? "Appartement" : "Bâtiment",
      a.surface ? a.surface + " m²" : null,
      rooms.length ? rooms.length + " pièces" : null,
      emitters.map(e => labels[e] || e).join(" + ") || null
    ].filter(Boolean).join(" · ");
  }

  const CRM = { leadPayload, quotePayload, qualifiedFilePayload, flows, logEvent, getLog, describeProject };
  if (typeof window !== "undefined") window.SalusCRM = CRM;
  if (typeof module !== "undefined" && module.exports) module.exports = CRM;
})();
