/* Trade-show video - the unified Salus configurator (index.html).
   The first questions of "My home" answered on screen (a house, 120 m2,
   one upper floor, five rooms), a chapter card for "My heating" and
   "My habits", then the result of the built-in demo scenario - the same
   house - shown section by section. The cut happens behind the card, so
   what is on screen stays one coherent home.
   Ends on the intro card, so the video loops without a visible cut. */

export default {
  lang: "en",
  ready: "#root > *",
  url: "/index.html",
  windowUrl: "configurator-salus-test.netlify.app",

  panel: {
    eyebrow: "Salus Controls",
    title: "The Salus configurator",
    steps: ["My home", "My heating", "My habits", "My solution"],
    chips: ["Room by room", "Three levels", "Documents & quote"],
  },
  cards: {
    intro: {
      eyebrow: "Salus configurator",
      title: "From need to solution,<br>in under ten questions",
      text: "Describe your home and your habits: the configurator builds the complete Salus system - products, price, diagram, documents.",
      chips: ["My home", "My heating", "My habits", "My solution"],
    },
    chapter: {
      eyebrow: "A few questions later",
      title: "My heating, my habits",
      text: "Gas boiler · underfloor heating downstairs, radiators upstairs<br>Out during the day · control from the phone",
    },
    outro: {
      eyebrow: "Salus configurator",
      title: "One journey,<br>one complete Salus system",
      text: "Products, system diagram, savings estimate, documents and quote - built from the answers, never from a catalogue.",
      chips: ["Room by room", "Three levels", "Documents & quote"],
    },
  },

  async run(r) {
    /* Intro */
    await r.wait(3.6);
    await r.card("intro", false);
    await r.step(-1, "Describe your home and your habits - never a catalogue.");
    await r.wait(1.8);

    /* Landing - who are you? */
    await r.reveal({ css: "h2", text: "Who are you?" }, { sec: 1.4, place: 0, margin: 56 });
    await r.cursorOn(true);
    await r.point({ css: "button", text: "I am an installer" }, { sec: 1.0 });
    await r.wait(0.7);
    await r.clickOn({ css: "button", text: "I am a homeowner" }, { sec: 0.9 });
    await r.scrollTo(0, 0.5);
    await r.step(0, "One question per screen, with pictures.");
    await r.wait(1.2);

    /* My home */
    await r.clickOn({ css: "button", text: "A house" }, { sec: 0.9 });
    await r.wait(1.0);
    await r.clickOn({ css: "button", text: "120 m2" }, { sec: 0.9 });
    await r.wait(0.3);
    await r.clickOn({ css: "button", text: "Next" }, { sec: 0.8 });
    await r.wait(1.0);
    await r.clickOn({ css: "button", text: "One upper floor" }, { sec: 0.9 });
    await r.wait(1.0);
    await r.clickOn({ css: "button", text: "Standard" }, { sec: 0.9 });
    await r.step(0, "Room by room: the solution is calculated for every room.");
    await r.wait(1.2);
    for (const room of ["+ Living room", "+ Kitchen", "+ Bedroom", "+ Bedroom", "+ Bathroom"]) {
      await r.clickOn({ css: "button", text: room }, { sec: 0.55, pause: 0.1 });
      await r.wait(0.25);
    }
    for (const i of [2, 3, 4]) {                       // the bedrooms and the bathroom go upstairs
      await r.choose({ css: "select", index: i }, "1", { sec: 0.6 });
      await r.wait(0.3);
    }
    await r.wait(0.6);
    await r.clickOn({ css: "button", text: "Next" }, { sec: 0.9 });

    /* My heating, my habits - behind the chapter card, the demo scenario (the same house) is loaded */
    await r.card("chapter", true);
    await r.cursorOn(false);
    await r.wait(0.8);
    await r.reloadSite();
    await r.clickNow({ css: "button", text: "Demo scenario" });
    await r.wait(2.6);
    await r.card("chapter", false);
    await r.step(3, "Your complete Salus system, in three levels.");
    await r.wait(2.0);

    /* My solution */
    await r.cursorOn(true);
    await r.point({ css: "button", text: "Essential" }, { sec: 1.0 });
    await r.wait(0.6);
    await r.clickOn({ css: "button", text: "Premium" }, { sec: 0.9 });
    await r.wait(1.6);
    await r.cursorOn(false);

    await r.step(3, "Room by room: what each device changes, day to day.");
    await r.reveal({ css: "h2", text: "Your home, room by room" }, { sec: 1.8, place: 0, margin: 56 });
    await r.wait(3.0);

    await r.step(3, "Every product explains what it is for.");
    await r.reveal({ css: "h2", text: "Your solution in detail" }, { sec: 1.8, place: 0, margin: 56 });
    await r.wait(1.6);
    await r.scrollBy(760, 4.5);
    await r.wait(1.2);

    await r.step(3, "The system diagram, drawn from the answers.");
    await r.reveal({ css: "h2", text: "Your system diagram" }, { sec: 2.2, place: 0, margin: 56 });
    await r.wait(3.4);

    await r.step(3, "Savings estimate, documents and quote, ready to share.");
    await r.reveal({ css: "div.uppercase", text: "Estimated savings" }, { sec: 1.8, place: 0, margin: 76 });
    await r.wait(2.6);
    await r.scrollToEnd(4.0);
    await r.cursorOn(true);
    await r.point({ css: "button", text: "Generate the PDF" }, { sec: 1.0 });
    await r.wait(2.0);
    await r.cursorOn(false);

    /* Outro, then back to the intro card: the loop point */
    await r.card("outro", true);
    await r.wait(5.5);
    await r.card("intro", true);             // under the outro: it shows only as the outro fades away
    await r.wait(0.8);
    await r.card("outro", false);
    await r.wait(1.2);
  },
};
