/* Trade-show video - R-System plenum configurator (r-system/index.html).
   One complete configuration: Daikin FBA60A, a 5-outlet plenum, five
   RSQ800WRF thermostats, then a slow pass over the summary.
   Ends on the intro card, so the video loops without a visible cut. */

export default {
  lang: "fr",
  url: "/r-system/index.html",
  tailwindCdn: "r-system/index.html",
  windowUrl: "r-system-by-salus.com",

  panel: {
    eyebrow: "R-System by SALUS",
    title: "Configurateur plénum motorisé",
    steps: ["Marque de la pompe à chaleur", "Modèle de l'unité intérieure", "Plénum motorisé", "Thermostats sans fil", "Récapitulatif"],
    chips: ["Garantie 5 ans", "Assemblé en France", "Avec ou sans internet"],
  },
  cards: {
    intro: {
      eyebrow: "R-System by SALUS",
      title: "Votre plénum motorisé,<br>configuré en 4 étapes",
      text: "Pompe à chaleur gainable, une sortie par pièce, un thermostat sans fil par zone.",
      chips: ["Daikin", "Mitsubishi", "Toshiba", "Panasonic"],
    },
    outro: {
      eyebrow: "R-System by SALUS",
      title: "Le confort pièce par pièce,<br>sur votre gainable",
      text: "Configuration en ligne, récapitulatif PDF et demande de chiffrage en un clic.",
      big: "r-system-by-salus.com",
      chips: ["Garantie 5 ans", "Assemblé en France", "Avec ou sans internet"],
    },
  },

  async run(r) {
    /* Intro */
    await r.wait(3.6);
    await r.card("intro", false);
    await r.step(0, "Choisissez la marque de votre pompe à chaleur gainable.");
    await r.wait(1.4);

    /* 1 - brand */
    await r.cursorOn(true);
    await r.point({ css: "button", alt: "Mitsubishi" }, { sec: 1.1 });
    await r.wait(0.5);
    await r.point({ css: "button", alt: "Toshiba" }, { sec: 0.7 });
    await r.wait(0.4);
    await r.scrollToEnd(1.1);
    await r.point({ css: "button", alt: "Panasonic" }, { sec: 0.7 });
    await r.wait(0.5);
    await r.scrollTo(0, 1.0);
    await r.clickOn({ css: "button", alt: "Daikin" }, { sec: 0.9 });
    await r.step(1, "Sélectionnez le modèle exact de l'unité intérieure.");
    await r.wait(1.3);

    /* 2 - model */
    await r.point({ css: "button", text: "FBA35A" }, { sec: 0.9 });
    await r.wait(0.3);
    await r.point({ css: "button", text: "FBA50A" }, { sec: 0.6 });
    await r.wait(0.3);
    await r.clickOn({ css: "button", text: "FBA60A" }, { sec: 0.7 });
    await r.step(2, "Choisissez le nombre de sorties : une par pièce à desservir.");
    await r.wait(1.6);

    /* 3 - plenum */
    await r.cursorOn(false);
    await r.wait(0.6);
    await r.reveal({ css: "button", text: "4 sorties" }, { sec: 1.4, place: 0.62 });
    await r.cursorOn(true);
    await r.point({ css: "button", text: "4 sorties" }, { sec: 0.9 });
    await r.wait(0.4);
    await r.point({ css: "button", text: "6 sorties" }, { sec: 0.7 });
    await r.wait(0.3);
    await r.clickOn({ css: "button", text: "5 sorties" }, { sec: 0.7 });
    await r.scrollTo(0, 0.8);
    await r.step(3, "Un thermostat sans fil par zone, piloté par l'app SALUS Premium Lite.");
    await r.wait(1.4);

    /* 4 - thermostats: from 1 to 5, one per outlet */
    const plus = { css: "button.stepBtn", index: 1 };
    await r.reveal(plus, { sec: 0.8, place: 0.45 });
    await r.point(plus, { sec: 0.9 });
    for (let i = 0; i < 4; i++) { await r.wait(0.22); await r.click(); await r.wait(0.18); }
    await r.wait(0.7);
    await r.reveal({ css: "button", text: "Voir le récapitulatif" }, { sec: 0.7, place: 0.7 });
    await r.clickOn({ css: "button", text: "Voir le récapitulatif" }, { sec: 0.8 });
    await r.scrollTo(0, 0.6);
    await r.step(4, "Votre solution est prête : PDF, demande de chiffrage, documentation.");
    await r.wait(0.6);
    await r.cursorOn(false);
    await r.wait(2.6);

    /* Summary - one slow pass down to the plenum photo */
    await r.reveal({ css: "button", text: "Demander un chiffrage" }, { sec: 1.6, place: 0.55 });
    await r.cursorOn(true);
    await r.point({ css: "button", text: "Télécharger PDF" }, { sec: 0.9 });
    await r.wait(0.6);
    await r.point({ css: "button", text: "Demander un chiffrage" }, { sec: 0.7 });
    await r.wait(0.9);
    await r.cursorOn(false);
    await r.reveal({ css: "h2", text: "Documentation R-System" }, { sec: 2.2, place: 0 });
    await r.wait(1.8);
    await r.scrollToEnd(4.5);
    await r.wait(2.4);

    /* Outro, then back to the intro card: the loop point */
    await r.card("outro", true);
    await r.wait(5.5);
    await r.card("intro", true);
    await r.card("outro", false);
    await r.wait(1.2);
  },
};
