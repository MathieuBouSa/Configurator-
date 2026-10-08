/* Trade-show video - the public R-System site, https://r-system-by-salus.com/
   The site full screen, scrolled top to bottom with a pause on each
   section heading, between an intro and an outro card.
   Ends on the intro card, so the video loops without a visible cut.

   The visit is generic (it follows the page's headings), so it keeps
   working when the site's content changes: re-record to refresh it. */

export default {
  lang: "fr",
  layout: "direct",
  url: "https://r-system-by-salus.com/",

  cards: {
    intro: {
      eyebrow: "R-System by SALUS",
      title: "Le confort pièce par pièce,<br>sur votre gainable",
      text: "Plénum motorisé, thermostats sans fil et application : la régulation zone par zone pour pompe à chaleur gainable.",
      chips: ["Daikin", "Mitsubishi", "Toshiba", "Panasonic"],
    },
    outro: {
      eyebrow: "R-System by SALUS",
      title: "Découvrez R-System",
      text: "Configuration en ligne, documentation et demande de chiffrage sur le site.",
      big: "r-system-by-salus.com",
      chips: ["Garantie 5 ans", "Assemblé en France", "Avec ou sans internet"],
    },
  },

  async run(r) {
    await r.preload();                       // behind the intro card

    /* Intro */
    await r.wait(3.6);
    await r.card("intro", false);
    await r.wait(1.8);

    /* The page, section by section */
    await r.tour({ css: "h1, h2", place: 0.16, pause: 2.4 });
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
