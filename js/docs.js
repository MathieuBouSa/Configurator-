/* ============================================================
   SALUS Configurateur BETA — Documents générés dynamiquement
   ------------------------------------------------------------
   Tous les documents sont des DOCUMENTS DE SUBSTITUTION : la
   structure attendue en production est respectée (titres,
   sections, emplacements des visuels et des tableaux) mais le
   contenu est factice et marqué comme tel (filigrane + bandeau).
   Générés côté client avec jsPDF, depuis la configuration réelle
   de l'utilisateur — l'objectif est de démontrer que le
   configurateur SAIT produire une documentation (P14, P21, P26).
   ============================================================ */

(function () {
  const CAT = () => globalThis.SALUS_CATALOG;
  const COPY = () => globalThis.SALUS_COPY;

  const NAVY = [29, 40, 88], CYAN = [0, 174, 239], GRAY = [140, 145, 160];
  const M = 16; // marge mm

  function newDoc() {
    const { jsPDF } = window.jspdf;
    return new jsPDF({ unit: "mm", format: "a4" });
  }

  /* Filigrane + bandeau BETA sur la page courante */
  function stampBeta(doc) {
    doc.saveGraphicsState && doc.saveGraphicsState();
    doc.setTextColor(225, 232, 245);
    doc.setFontSize(58);
    doc.setFont("helvetica", "bold");
    doc.text("DOCUMENT DE TEST", 105, 170, { align: "center", angle: 35 });
    doc.setTextColor(0, 0, 0);
    doc.restoreGraphicsState && doc.restoreGraphicsState();
  }

  function header(doc, title, subtitle) {
    stampBeta(doc);
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, 210, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("SALUS Controls", M, 10);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(title, M, 17);
    doc.setFillColor(...CYAN);
    doc.rect(0, 24, 210, 1.6, "F");
    /* Bandeau BETA */
    doc.setFillColor(255, 244, 214);
    doc.rect(0, 25.6, 210, 8, "F");
    doc.setTextColor(146, 90, 4); doc.setFontSize(8);
    doc.text("VERSION BETA — document de substitution : structure réelle, contenu factice. Ne pas diffuser.", 105, 30.8, { align: "center" });
    if (subtitle) {
      doc.setTextColor(...GRAY); doc.setFontSize(9);
      doc.text(subtitle, M, 40);
    }
    doc.setTextColor(20, 20, 20);
    return subtitle ? 46 : 42;
  }

  function footer(doc, pageLabel) {
    doc.setFontSize(7.5); doc.setTextColor(...GRAY);
    doc.text("Contenu factice généré par le configurateur BETA Salus — " + new Date().toLocaleDateString("fr-FR") + (pageLabel ? "  ·  " + pageLabel : ""), 105, 291, { align: "center" });
    doc.setTextColor(20, 20, 20);
  }

  function h2(doc, y, txt) {
    doc.setFillColor(...CYAN); doc.rect(M, y - 3.6, 2, 5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...NAVY);
    doc.text(txt, M + 4, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(20, 20, 20);
    return y + 7;
  }

  function para(doc, y, txt, w) {
    const lines = doc.splitTextToSize(txt, w || 178);
    doc.text(lines, M, y);
    return y + lines.length * 4.4 + 2;
  }

  function imgPlaceholder(doc, y, h, label) {
    doc.setDrawColor(...GRAY); doc.setFillColor(243, 247, 252);
    doc.roundedRect(M, y, 178, h, 2, 2, "FD");
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text("[ Visuel : " + label + " ]", 105, y + h / 2, { align: "center" });
    doc.setTextColor(20, 20, 20); doc.setFontSize(9.5);
    return y + h + 5;
  }

  function ensureRoom(doc, y, needed, title) {
    if (y + needed > 280) {
      footer(doc);
      doc.addPage();
      return header(doc, title);
    }
    return y;
  }

  /* ---------- Guide d'installation unique (P21) ----------
     5 séquences dans l'ordre réel du chantier :
     préparation, câblage, appairage, mise en service, test. */
  function installGuide(answers, items, meta) {
    const doc = newDoc();
    const agg = window.SalusEngine.aggregate(items);
    const title = "Guide d'installation du système — " + (meta.projectCode || "");

    /* Page 1 : schéma + liste */
    let y = header(doc, title, window.SalusCRM.describeProject(answers));
    y = h2(doc, y + 4, "1. Votre système en un coup d'oeil");
    y = imgPlaceholder(doc, y, 62, "schéma du système généré (voir écran Ma solution)");
    y = h2(doc, y, "Matériel de cette installation");
    agg.forEach(it => {
      const p = CAT().products[it.ref] || {};
      doc.setFont("helvetica", "bold");
      doc.text(`${it.qty} × ${p.ref || it.ref}`, M, y);
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(p.name || "", 130), M + 42, y);
      y += 6;
      y = ensureRoom(doc, y, 10, title);
    });
    footer(doc, "Séquence 1/5 — Préparation");

    /* Page 2 : préparation + câblage (uniquement les produits filaires) */
    doc.addPage();
    y = header(doc, title);
    y = h2(doc, y + 4, "2. Préparation et vérifications");
    y = para(doc, y, "Coupez l'alimentation au tableau. Vérifiez la présence du matériel listé en page 1, la portée wifi près de la box, et l'accès au générateur. [Contenu de test : la notice réelle détaillera les vérifications par produit.]");
    y = h2(doc, y + 2, "3. Câblage — uniquement les appareils filaires");
    const wired = agg.filter(it => { const p = CAT().products[it.ref] || {}; return p.power === "230v"; });
    if (wired.length === 0) {
      y = para(doc, y, "Aucun câblage : tous les appareils de votre système sont sans fil.");
    } else {
      wired.forEach(it => {
        const p = CAT().products[it.ref] || {};
        y = ensureRoom(doc, y, 34, title);
        doc.setFont("helvetica", "bold"); doc.text(p.ref + " — " + p.name, M, y); doc.setFont("helvetica", "normal");
        y += 5;
        y = imgPlaceholder(doc, y, 22, "schéma de câblage " + p.ref + " (borniers L, N, contacts)");
      });
    }
    footer(doc, "Séquences 2-3/5 — Préparation & câblage");

    /* Page 3 : appairage dans l'ordre */
    doc.addPage();
    y = header(doc, title);
    y = h2(doc, y + 4, "4. Appairage — dans cet ordre précis");
    const order = ["gateway", "wiringCentre", "boilerReceiver", "roomstat", "electricStat", "acController", "trv", "repeater", "relay", "shutterRelay", "windowSensor", "presenceSensor", "standaloneRF", "standaloneWired"];
    let step = 1;
    order.forEach(role => {
      agg.forEach(it => {
        const p = CAT().products[it.ref] || {};
        if (p.role !== role) return;
        y = ensureRoom(doc, y, 16, title);
        doc.setFillColor(...CYAN); doc.circle(M + 3, y - 1.4, 3, "F");
        doc.setTextColor(255, 255, 255); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
        doc.text(String(step), M + 3, y, { align: "center" });
        doc.setTextColor(20, 20, 20); doc.setFontSize(9.5);
        doc.text(`${p.ref} (${it.qty} × )`, M + 9, y);
        doc.setFont("helvetica", "normal");
        y = para2(doc, y + 4.5, "Maintenez le bouton d'appairage 5 s, le voyant clignote, validez dans l'application. [Contenu de test — la vidéo d'appairage réelle sera attachée à cette étape.]", M + 9, 165);
        step++;
      });
    });
    footer(doc, "Séquence 4/5 — Appairage");

    /* Page 4 : mise en service + test final */
    doc.addPage();
    y = header(doc, title);
    y = h2(doc, y + 4, "5. Mise en service");
    y = para(doc, y, "Nommez chaque appareil avec le nom de sa pièce (repris de votre configuration : " + (answers.rooms || []).map(r => r.name).join(", ") + "). Réglez les consignes par défaut proposées par l'application. [Contenu de test.]");
    y = h2(doc, y + 2, "6. Test fonctionnel final");
    y = para(doc, y, "Montez la consigne de chaque thermostat de +3 °C : le générateur (ou la boucle de plancher correspondante) doit démarrer en moins de 3 minutes. Redescendez la consigne : l'arrêt doit suivre. Testez ensuite une coupure de courant : chaque appareil doit se réapparier seul.");
    y = imgPlaceholder(doc, y + 2, 30, "tableau de contrôle final (une ligne par pièce)");
    footer(doc, "Séquence 5/5 — Mise en service & test");
    return doc;
  }

  function para2(doc, y, txt, x, w) {
    const lines = doc.splitTextToSize(txt, w);
    doc.text(lines, x, y);
    return y + lines.length * 4.2 + 2.5;
  }

  /* ---------- Devis (P25) ---------- */
  function quote(answers, selection, meta) {
    const doc = newDoc();
    const num = "DEV-BETA-" + (meta.projectCode || "0000").replace(/\D/g, "").padStart(4, "0");
    let y = header(doc, "Devis n° " + num + " — prix publics conseillés",
      window.SalusCRM.describeProject(answers));
    doc.setFontSize(8.5); doc.setTextColor(...GRAY);
    doc.text("Modèle unique national — numérotation Zoho CRM (simulée en BETA)", M, y); y += 8;
    doc.setTextColor(20, 20, 20);

    /* Tableau lignes */
    doc.setFillColor(...NAVY); doc.rect(M, y, 178, 8, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("Référence", M + 2, y + 5.4); doc.text("Désignation", M + 34, y + 5.4);
    doc.text("Qté", M + 128, y + 5.4); doc.text("PU TTC*", M + 142, y + 5.4); doc.text("Total*", M + 162, y + 5.4);
    y += 8; doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "normal");
    let total = 0, shade = false;
    (selection.items || []).forEach(it => {
      const p = CAT().products[it.ref] || { name: it.ref, price: 0 };
      if (shade) { doc.setFillColor(245, 249, 253); doc.rect(M, y, 178, 7, "F"); }
      shade = !shade;
      doc.text(p.ref || it.ref, M + 2, y + 5);
      doc.text(doc.splitTextToSize(p.name, 88)[0], M + 34, y + 5);
      doc.text(String(it.qty), M + 128, y + 5);
      doc.text(p.price + " €", M + 142, y + 5);
      doc.text(p.price * it.qty + " €", M + 162, y + 5);
      total += p.price * it.qty;
      y += 7;
      y = ensureRoom(doc, y, 30, "Devis n° " + num);
    });
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.setFillColor(...CYAN); doc.rect(M + 108, y + 2, 70, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Total TTC* : " + total + " €", M + 143, y + 8.2, { align: "center" });
    doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    y += 18;
    y = para(doc, y, "* PRIX FICTIFS — version BETA. Prix publics conseillés, indicatifs, hors pose. Aucun prix net n'est affiché dans l'outil.");
    if (answers.profile === "installer") {
      doc.setFillColor(235, 246, 255); doc.roundedRect(M, y, 178, 20, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
      doc.text("Installateur :", M + 4, y + 7);
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize("présentez ce devis à votre distributeur Salus — " + COPY().distributors.join(", ") + " — pour obtenir votre remise professionnelle. Les codes produits exacts permettent un chiffrage sans retype.", 168), M + 4, y + 12);
      y += 26;
    } else {
      y = para(doc, y, "Pour la pose, des installateurs Club Pro de votre secteur peuvent vous accompagner (voir l'écran Ma solution).");
    }
    doc.setTextColor(20, 20, 20);
    footer(doc);
    return { doc, num, total };
  }

  /* ---------- Fiche produit de substitution ---------- */
  function productSheetInto(doc, ref) {
    const p = CAT().products[ref] || { ref, name: "" };
    let y = header(doc, "Fiche produit — " + p.ref, p.name);
    y = imgPlaceholder(doc, y + 2, 46, "photo produit " + p.ref + " sur fond blanc");
    y = h2(doc, y, "À quoi il sert");
    y = para(doc, y, p.solution || "");
    y = h2(doc, y + 1, "Caractéristiques techniques");
    const rows = [
      ["Référence", p.ref], ["Protocole", ({ zigbee: "Zigbee 3.0", rf: "RF 868 MHz", wifi: "Wi-Fi", wired: "Filaire", none: "—" })[p.protocol] || "—"],
      ["Alimentation", p.power === "230v" ? "230 V" : "Piles / batterie"],
      ["Passerelle requise", p.needsGateway ? "Oui (UG800)" : (p.integratedGateway ? "Intégrée au récepteur" : "Non")],
      ["Garantie", "[donnée de test : 5 ans]"], ["Classe ErP", "[donnée de test : " + (p.protocol === "wired" ? "IV" : "VIII") + "]"]
    ];
    rows.forEach(([k, v], i) => {
      if (i % 2 === 0) { doc.setFillColor(245, 249, 253); doc.rect(M, y - 4, 178, 6.4, "F"); }
      doc.setFont("helvetica", "bold"); doc.text(k, M + 2, y);
      doc.setFont("helvetica", "normal"); doc.text(String(v), M + 70, y);
      y += 6.4;
    });
    y = h2(doc, y + 3, "Installation");
    y = para(doc, y, (p.descPro || "") + " [Contenu de test : la notice réelle remplacera cette section.]");
    y = imgPlaceholder(doc, y, 26, "schéma de câblage / montage " + p.ref);
    y = h2(doc, y, "Conformité");
    y = para(doc, y, "CE — RED 2014/53/UE. [Déclaration de conformité de substitution — document de test.]");
    footer(doc);
  }

  function productSheet(ref) {
    const doc = newDoc();
    productSheetInto(doc, ref);
    return doc;
  }

  /* ---------- Pack documentaire complet (P14) ---------- */
  function docPack(refs, meta) {
    const doc = newDoc();
    let y = header(doc, "Pack documentaire — " + (meta.projectCode || ""), "Uniquement les documents des produits de VOTRE configuration");
    y = h2(doc, y + 4, "Contenu du pack");
    refs.forEach(ref => {
      const p = CAT().products[ref] || {};
      doc.setFont("helvetica", "bold"); doc.text(p.ref || ref, M, y); doc.setFont("helvetica", "normal");
      doc.text((p.docs || []).map(d => COPY().docLabels[d]).join(" · "), M + 40, y);
      y += 6; y = ensureRoom(doc, y, 12, "Pack documentaire");
    });
    footer(doc, "Sommaire");
    refs.forEach(ref => { doc.addPage(); productSheetInto(doc, ref); });
    return doc;
  }

  const Docs = { installGuide, quote, productSheet, docPack };
  if (typeof window !== "undefined") window.SalusDocs = Docs;
})();
