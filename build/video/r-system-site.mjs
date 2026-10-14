/* Trade-show video - the public R-System site, https://r-system-by-salus.com/
   (repository MathieuBouSa/rsystem-landing). The installer landing full
   screen, scrolled top to bottom, one section per stop, framed between
   the site's sticky header and its bottom contact bar,
   between an intro and an outro card dressed like the site: white
   R-System logo, Open Sans 800 / 300 (the SALUS charter the landing
   uses), flat navy, no gradient.
   Ends on the intro card, so the video loops without a visible cut.

       node build/video/record.mjs r-system-site                  the live site
       node build/video/record.mjs r-system-site --root ../rsystem-landing --url /
                                                                  a local checkout, offline
       --lang en   the English landing (en/), --url /en/ with --root
       --lang de   the English landing translated to German as it is served
                   (build/video/de/), from a local checkout only: the site
                   has no German page

   The stops are computed from the page's sections, so re-recording picks
   up any change of content without touching this file. Add --stills <dir>
   to get one image per stop and check the framing. */

import * as de from "./de/index.mjs";

/* What changes from one language to the other: the page and the cards. */
const LANGS = {
  fr: {
    url: "https://r-system-by-salus.com/",
    intro: {
      title: "Régulation multizone<br>pour climatisation <span class=\"thin\">gainable.</span>",
      text: "Plénum motorisé, moteurs Belimo, thermostats de zone et application gratuite.",
      chips: ["Garanti 5 ans", "Assemblé à Bordeaux", "Zigbee"],
    },
    outro: {
      title: "Composez votre système<br><span class=\"thin\">en quelques étapes.</span>",
      text: "Configurateur en ligne et contact commercial sur le site.",
      big: "r-system-by-salus.com",
      chips: ["Garanti 5 ans", "Assemblé à Bordeaux", "Application gratuite"],
    },
  },
  en: {
    url: "https://r-system-by-salus.com/en/",
    intro: {
      title: "Multizone control<br>for ducted <span class=\"thin\">air conditioning.</span>",
      text: "Motorised plenum, Belimo actuators, zone thermostats and a free app.",
      chips: ["Five-year warranty", "Assembled in Bordeaux", "Zigbee"],
    },
    outro: {
      title: "Build your system<br><span class=\"thin\">in a few steps.</span>",
      text: "Online configurator and sales contact on the website.",
      big: "r-system-by-salus.com/en",
      chips: ["Five-year warranty", "Assembled in Bordeaux", "Free app"],
    },
  },
  de: {
    url: "/de/",
    translate: { from: "/en/", at: "/de/", lang: "de", texts: de.landing, replace: [["configurateur/?lang=en", "configurateur/?lang=de"]] },
    patch: { "/configurateur/index.html": de.configurateur },
    intro: {
      title: "Mehrzonenregelung<br>für <span class=\"thin\">Kanalklimaanlagen.</span>",
      text: "Motorisiertes Plenum, Belimo Stellantriebe, Zonenthermostate und kostenlose App.",
      chips: ["Fünf Jahre Garantie", "Montiert in Bordeaux", "Zigbee"],
    },
    outro: {
      title: "Stellen Sie Ihr System<br><span class=\"thin\">in wenigen Schritten zusammen.</span>",
      text: "Online-Konfigurator und Kontakt zum Vertrieb auf der Website.",
      big: "r-system-by-salus.com/en",
      chips: ["Fünf Jahre Garantie", "Montiert in Bordeaux", "Kostenlose App"],
    },
  },
};

export default (lang) => {
  const L = LANGS[lang];
  if (!L) throw new Error(`r-system-site: no "${lang}" version (fr, en, de)`);
  return {
    lang,
    layout: "direct",
    url: L.url,
    translate: L.translate,
    patch: L.patch,
    preload: true,                             // lazy images and the embedded configurator, before the camera
    clock: true,                               // counters and scroll effects run on the video clock

    /* The consent banner is answered before the page loads (refused: nothing
       is measured), so it never covers the video. */
    beforeLoad: () => {
      try { localStorage.setItem("rsystem-consentement", JSON.stringify({ accepte: false, t: Date.now() })); } catch (e) { /* storage blocked */ }
    },

    /* The sticky "Être contacté" bar is for a visitor who can click: on a stand
       screen it would only take 70 px off every view. */
    css: ".cta-bar{display:none !important}",

    /* The two YouTube thumbnails play instead of standing still: an excerpt of
       each film, muted, looping from the moment it comes on screen. The files
       are given at recording time:
         --clip presentation=<Découvrez R-System en 2 minutes, youtu.be/U4zsIexkAy8>
         --clip usine=<La réalisation du plénum à Bordeaux, youtu.be/tJVTvYfFSmQ>
       Without them, each thumbnail stays, without its play button, in a slow zoom. */
    clips: [
      { key: "presentation", replace: '.video-poster[data-video="U4zsIexkAy8"]', start: 0, length: 20 },
      { key: "usine", replace: '.video-poster[data-video="tJVTvYfFSmQ"]', start: 0, length: 20 },
    ],

    look: {
      logo: "/assets/logo/logo-r-system-navy-en-blanc.png",
      logoHeight: 76,
      flat: true,
      bg: "#1D2858",
      accent: "#00AEEF",
      display: "'Open Sans', system-ui, sans-serif",
      displayWeight: 800,
      thinWeight: 300,
      tracking: "-.02em",
      leading: "1.05",
      label: "'Open Sans', system-ui, sans-serif",
      body: "'Open Sans', system-ui, sans-serif",
    },
    cards: {
      intro: { eyebrow: "SALUS Controls", ...L.intro },
      outro: { eyebrow: "SALUS Controls", ...L.outro },
    },

    async run(r) {
      /* Intro */
      await r.wait(3.6);
      await r.card("intro", false);
      await r.wait(2.0);

      /* The page, section by section */
      await r.tour({ sections: "main > section, body > footer", header: "body > header", pause: 2.6, pass: 2.0 });
      await r.wait(1.0);

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
