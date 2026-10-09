/* Trade-show video - the R-System configurator of the public site
   (rsystem-landing, configurateur/), in French, English or German.
   One complete configuration: Daikin FBA60A, a 5-outlet plenum, five
   RSQ800 thermostats, then a slow pass over the summary.
   Ends on the intro card, so the video loops without a visible cut.

       node build/video/record.mjs r-system-configurateur --root ../rsystem-landing --lang en
       --lang de   the configurator with a German text table added as it is
                   served (build/video/de/): the site has no German version

   r-system.mjs films the earlier configurator of this repository, in
   French only. */

import * as de from "./de/index.mjs";

const LANGS = {
  fr: {
    panel: {
      title: "Configurateur plénum motorisé",
      steps: ["Marque de la pompe à chaleur", "Modèle de l'unité intérieure", "Plénum motorisé", "Thermostats sans fil", "Récapitulatif"],
      chips: ["Garantie 5 ans", "Assemblé à Bordeaux", "Avec ou sans internet"],
    },
    intro: {
      title: "Votre plénum motorisé,<br>configuré en 4 étapes",
      text: "Pompe à chaleur gainable, une sortie par pièce, un thermostat sans fil par zone.",
    },
    outro: {
      title: "Le confort pièce par pièce,<br>sur votre gainable",
      text: "Configuration en ligne, récapitulatif PDF et demande de chiffrage en un clic.",
      big: "r-system-by-salus.com",
    },
    captions: [
      "Choisissez la marque de votre pompe à chaleur gainable.",
      "Sélectionnez le modèle exact de l'unité intérieure.",
      "Choisissez le nombre de sorties : une par pièce à desservir.",
      "Un thermostat sans fil par zone, piloté par l'app SALUS Premium Lite.",
      "Votre solution est prête : PDF, demande de chiffrage, documentation.",
    ],
  },
  en: {
    panel: {
      title: "Motorised plenum configurator",
      steps: ["Make of the heat pump", "Indoor unit model", "Motorised plenum", "Wireless thermostats", "Summary"],
      chips: ["Five-year warranty", "Assembled in Bordeaux", "With or without internet"],
    },
    intro: {
      title: "Your motorised plenum,<br>configured in 4 steps",
      text: "Ducted heat pump, one outlet per room, one wireless thermostat per zone.",
    },
    outro: {
      title: "Room by room comfort,<br>on your ducted system",
      text: "Online configuration, PDF summary and a quote request in one click.",
      big: "r-system-by-salus.com/en",
    },
    captions: [
      "Choose the make of your ducted heat pump.",
      "Select the exact model of the indoor unit.",
      "Choose the number of outlets: one per room to serve.",
      "One wireless thermostat per zone, run from the SALUS Premium Lite app.",
      "Your solution is ready: PDF, quote request, documentation.",
    ],
  },
  de: {
    patch: { "/configurateur/index.html": de.configurateur },
    panel: {
      title: "Konfigurator für das motorisierte Plenum",
      steps: ["Marke der Wärmepumpe", "Modell des Innengeräts", "Motorisiertes Plenum", "Funkthermostate", "Übersicht"],
      chips: ["Fünf Jahre Garantie", "Montiert in Bordeaux", "Mit oder ohne Internet"],
    },
    intro: {
      title: "Ihr motorisiertes Plenum,<br>in 4 Schritten konfiguriert",
      text: "Kanal-Wärmepumpe, ein Abgang pro Raum, ein Funkthermostat pro Zone.",
    },
    outro: {
      title: "Komfort Raum für Raum,<br>mit Ihrer Kanalklimaanlage",
      text: "Online-Konfiguration, PDF-Übersicht und Angebotsanfrage mit einem Klick.",
      big: "r-system-by-salus.com/en",
    },
    captions: [
      "Wählen Sie die Marke Ihrer Kanal-Wärmepumpe.",
      "Wählen Sie das genaue Modell des Innengeräts.",
      "Wählen Sie die Anzahl der Abgänge: einer pro Raum.",
      "Ein Funkthermostat pro Zone, gesteuert über die App SALUS Premium Lite.",
      "Ihre Lösung ist fertig: PDF, Angebotsanfrage, Dokumentation.",
    ],
  },
};

const tile = (attr, value) => ({ css: `button[${attr}="${value}"]` });
const action = name => ({ css: `button[data-action="${name}"]` });

export default (lang) => {
  const L = LANGS[lang];
  if (!L) throw new Error(`r-system-configurateur: no "${lang}" version (fr, en, de)`);
  const say = L.captions;
  return {
    lang,
    ready: "#root .tuile",
    url: `/configurateur/?lang=${lang}`,
    windowUrl: `r-system-by-salus.com/configurateur/${lang === "fr" ? "" : "?lang=" + lang}`,
    patch: L.patch,
    /* Embedded, the configurator leaves its side margins to the page around
       it: the browser window of the stage gets them back. */
    css: "#root .colonne{padding-left:32px;padding-right:32px}",

    panel: { eyebrow: "R-System by SALUS", ...L.panel },
    cards: {
      intro: { eyebrow: "R-System by SALUS", ...L.intro, chips: ["Daikin", "Mitsubishi", "Toshiba", "Panasonic"] },
      outro: { eyebrow: "R-System by SALUS", ...L.outro, chips: L.panel.chips },
    },

    async run(r) {
      /* Intro */
      await r.wait(3.6);
      await r.card("intro", false);
      await r.step(0, say[0]);
      await r.wait(1.4);

      /* 1 - make */
      await r.cursorOn(true);
      await r.point(tile("data-id", "MITSUBISHI"), { sec: 1.1 });
      await r.wait(0.5);
      await r.point(tile("data-id", "TOSHIBA"), { sec: 0.7 });
      await r.wait(0.4);
      await r.point(tile("data-id", "PANASONIC"), { sec: 0.7 });
      await r.wait(0.5);
      await r.clickOn(tile("data-id", "DAIKIN"), { sec: 0.9 });
      await r.step(1, say[1]);
      await r.wait(1.3);

      /* 2 - model */
      await r.point(tile("data-modele", "FBA35A"), { sec: 0.9 });
      await r.wait(0.3);
      await r.point(tile("data-modele", "FBA50A"), { sec: 0.6 });
      await r.wait(0.3);
      await r.clickOn(tile("data-modele", "FBA60A"), { sec: 0.7 });
      await r.step(2, say[2]);
      await r.wait(1.6);

      /* 3 - plenum: FBA60A offers 4, 5 or 6 outlets */
      await r.reveal(tile("data-i", "0"), { sec: 1.2, place: 0.5 });
      await r.point(tile("data-i", "0"), { sec: 0.9 });
      await r.wait(0.4);
      await r.point(tile("data-i", "2"), { sec: 0.7 });
      await r.wait(0.3);
      await r.clickOn(tile("data-i", "1"), { sec: 0.7 });
      await r.scrollTo(0, 0.8);
      await r.step(3, say[3]);
      await r.wait(1.4);

      /* 4 - thermostats: from 1 to 5, one per outlet */
      const plus = action("plus");
      await r.reveal(plus, { sec: 0.8, place: 0.5 });
      await r.point(plus, { sec: 0.9 });
      for (let i = 0; i < 4; i++) { await r.wait(0.22); await r.click(); await r.wait(0.18); }
      await r.wait(0.7);
      await r.reveal(action("recap"), { sec: 0.7, place: 0.7 });
      await r.clickOn(action("recap"), { sec: 0.8 });
      await r.scrollTo(0, 0.6);
      await r.step(4, say[4]);
      await r.wait(0.6);
      await r.cursorOn(false);
      await r.wait(2.6);

      /* Summary - one slow pass down to the plenum photo */
      await r.reveal(action("mail"), { sec: 1.6, place: 0.55 });
      await r.cursorOn(true);
      await r.point(action("pdf"), { sec: 0.9 });
      await r.wait(0.6);
      await r.point(action("mail"), { sec: 0.7 });
      await r.wait(0.9);
      await r.cursorOn(false);
      await r.reveal({ css: ".doc-titre" }, { sec: 2.2, place: 0 });
      await r.wait(1.8);
      await r.scrollToEnd(4.5);
      await r.wait(2.4);

      /* Outro, then back to the intro card: the loop point */
      await r.card("outro", true);
      await r.wait(5.5);
      await r.card("intro", true);             // under the outro: it shows only as the outro fades away
      await r.wait(0.8);
      await r.card("outro", false);
      await r.wait(1.2);
    },
  };
};
