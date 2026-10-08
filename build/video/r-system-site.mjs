/* Trade-show video - the public R-System site, https://r-system-by-salus.com/
   (repository MathieuBouSa/rsystem-landing). The installer landing full
   screen, scrolled top to bottom with a pause on each section heading,
   between an intro and an outro card dressed in the site's own charter:
   R-System logo, Bricolage Grotesque, flat navy, no gradient.
   Ends on the intro card, so the video loops without a visible cut.

       node build/video/record.mjs r-system-site                  the live site
       node build/video/record.mjs r-system-site --root ../rsystem-landing --url /
                                                                  a local checkout, offline

   The visit follows the page's headings, so re-recording picks up any
   change of content without touching this file. */

export default {
  lang: "fr",
  layout: "direct",
  url: "https://r-system-by-salus.com/",
  preload: true,                             // lazy images and the embedded configurator, before the camera
  clock: true,                               // counters and scroll effects run on the video clock

  /* The consent banner is answered before the page loads (refused: nothing
     is measured), so it never covers the video. */
  beforeLoad: () => {
    try { localStorage.setItem("rsystem-consentement", JSON.stringify({ accepte: false, t: Date.now() })); } catch (e) { /* storage blocked */ }
  },

  look: {
    logo: "/assets/logo/logo-r-system-navy-en-blanc.png",
    logoHeight: 76,
    flat: true,
    bg: "#1D2858",
    accent: "#00AEEF",
    display: "'Bricolage Grotesque', system-ui, sans-serif",
    displayWeight: 800,
    tracking: "-.03em",
    leading: ".98",
    label: "'JetBrains Mono', ui-monospace, monospace",
    body: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  cards: {
    intro: {
      eyebrow: "SALUS Controls",
      title: "Régulation multizone<br>pour climatisation <span class=\"thin\">gainable.</span>",
      text: "Plénum motorisé, moteurs Belimo, thermostats de zone et application gratuite.",
      chips: ["Garanti 5 ans", "Fabriqué à Bordeaux", "Zigbee"],
    },
    outro: {
      eyebrow: "SALUS Controls",
      title: "Composez votre système<br><span class=\"thin\">en quelques étapes.</span>",
      text: "Configurateur en ligne et contact commercial sur le site.",
      big: "r-system-by-salus.com",
      chips: ["Garanti 5 ans", "Fabriqué à Bordeaux", "Application gratuite"],
    },
  },

  async run(r) {
    /* Intro */
    await r.wait(3.6);
    await r.card("intro", false);
    await r.wait(2.0);

    /* The page, section by section */
    await r.tour({ css: "h1, h2", place: 0.14, pause: 2.6 });
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
