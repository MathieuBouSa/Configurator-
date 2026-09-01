/* ============================================================
   SALUS Configurator BETA - Zoho CRM simulation (P25 / P26)
   ------------------------------------------------------------
   NO real connection. This module builds exactly what WOULD go
   to Zoho CRM in production: JSON payloads, target service,
   records created, notifications triggered and what follows for
   the sales rep and the installer. The "backstage" panel in the
   interface displays this data.
   ============================================================ */

(function () {
  const CAT = globalThis.SALUS_CATALOG;
  const COPY = globalThis.SALUS_COPY;

  /* Log of the simulated CRM events for this session */
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
        Lead_Source: "Web Configurator",
        Layout: "Configurator",
        Company: answers.profile === "installer" ? "(installer company)" : "Homeowner",
        Last_Name: "(name entered at the contact step)",
        Email: "(email entered - also used for the resume link)",
        Zip_Code: answers.postalCode || "(postcode)",
        Country: "France",
        Profile: answers.profile === "installer" ? "Installer" : "Homeowner",
        Project_Type: describeProject(answers),
        Heat_Source: answers.generator || null,
        Number_of_zones: rooms.length,
        Level_chosen: meta.level || "(not chosen)",
        Estimated_amount: meta.total || null,
        Drop_off_step: meta.abandonStep || null,
        Project_code: meta.projectCode || null,
        Configuration_JSON: "(full configuration serialised - resume & after-sales)"
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
        Subject: "Configurator quote " + (meta.projectCode || ""),
        Quote_Number: "(single national numbering - single template)",
        Quote_Stage: "Draft",
        Valid_Till: "(date + 30 days)",
        Billing_Code: answers.postalCode || null,
        Adjusted_By: "Configurator",
        Level: meta.level,
        Price_shown: "Recommended retail price (never a net price in the tool)",
        Installer_message: answers.profile === "installer"
          ? "Present this quote to your Salus distributor (" + COPY.distributors.join(", ") + ") to get your trade discount."
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
        Deal_Name: "Project to validate - " + describeProject(answers),
        Stage: "Technical validation",
        Lead_Source: "Web Configurator",
        Zip_Code: answers.postalCode || "(postcode)",
        Exit_reasons: reasons,
        Configurator_recommendation: "(partial recommendation + assumptions + points to check)",
        Assigned_to: "(area sales rep - postcode assignment rule)",
        SLA: "Call back within 48 h"
      }]
    };
  }

  /* ---------- "What would happen for real" explanations ---------- */

  const flows = {
    lead: {
      title: "Lead creation / update",
      what: "From the very first answer, a Lead record is created in Zoho CRM, then updated at every step (Leads module, \"Configurator\" layout).",
      dataSent: "Profile, postcode, project type, heat source, number of zones, level chosen, estimated amount, drop-off step, project code, full configuration as JSON.",
      record: "1 Lead per configuration (deduplicated by email + project code).",
      notifications: [
        "Zoho assignment rule: the lead is assigned to the area sales rep (by postcode).",
        "\"Drop-off\" workflow: after 48 h with no activity, an automatic email goes out with the project resume link.",
        "Zoho Analytics dashboard: volumes, levels chosen, drop-off steps - what the market is really asking for."
      ],
      next: "The sales rep receives qualified leads with the full configuration; the area Club Pro installer gets the contact requests first."
    },
    quote: {
      title: "Quote generation",
      what: "The configuration goes to Zoho CRM, which produces the quote (Quotes module) with a single template and a national numbering.",
      dataSent: "Product lines (exact codes, quantities, recommended retail prices), total, postcode, level chosen.",
      record: "1 Quote attached to the Lead / Contact.",
      notifications: [
        "Homeowner: the quote goes out by email, the record enters the CRM.",
        "Installer: quote at retail price + the message \"present this quote to your Salus distributor for your trade discount\" - no net price in the tool, the distributor's role is protected.",
        "The distributor prices it without retyping: the exact product codes are on the quote."
      ],
      next: "The project comes back into the distribution network (Espace Aubade, Algorel, Richardson...)."
    },
    qualified: {
      title: "Qualified file - human takeover",
      what: "When a project leaves the automatic journey (commercial building, >12 zones, uncovered heat source, BMS), the configurator does not block: it prepares the file with its partial recommendation and sends it to the area sales rep (Deals module, \"Technical validation\" stage).",
      dataSent: "Full configuration, exit reasons, the configurator's recommendation, assumptions, points to check, contact and postcode.",
      record: "1 Deal assigned to the area sales rep.",
      notifications: [
        "Immediate notification to the sales rep (postcode assignment rule).",
        "SLA: customer called back within 48 h.",
        "Every correction made by the sales rep becomes a rule to add to the configurator - this is how the tool improves."
      ],
      next: "The sales rep directs the project to the distributor able to supply everything; the customer has seen a clear message: \"your project needs a validation, a Salus technician will call you back within 48 h\"."
    },
    previsit: {
      title: "Pre-visit questionnaire (installer)",
      what: "The \"prepare a visit\" button creates a unique link sent to the customer. Their answers and 3 photos pre-fill the configuration.",
      dataSent: "Answers to the homeowner questionnaire + 3 photos asked for explicitly: the heat source, one radiator with its valve, the electrical panel.",
      record: "The configuration linked to the Lead moves to \"pre-visit completed\".",
      notifications: ["The installer gets a notification: configuration pre-filled, to validate or correct before travelling."],
      next: "The installer arrives on site with the material already priced."
    },
    resume: {
      title: "Resume link (email)",
      what: "The project code is created at the first answer and kept in the browser. The email entered to receive the resume link also feeds the CRM (P23 + P26 answered together).",
      dataSent: "Email + project code + current step.",
      record: "The existing Lead is completed with the email.",
      notifications: ["Immediate email \"continue your configuration where you left it\"", "Automatic reminder after 48 h if the customer has not come back."],
      next: "The customer reopens the journey exactly at the step they left, with every answer kept."
    }
  };

  function describeProject(a) {
    const rooms = a.rooms || [];
    const emitters = [...new Set(rooms.map(r => r.emitter).filter(Boolean))];
    const labels = { water_radiators: "water radiators", ufh_water: "underfloor heating", ufh_electric: "electric underfloor", electric_radiators: "electric radiators", ducted_ac: "ducted AC", fan_coils: "fan coils" };
    return [
      a.homeType === "house" ? "House" : a.homeType === "flat" ? "Flat" : "Building",
      a.surface ? a.surface + " m2" : null,
      rooms.length ? rooms.length + " rooms" : null,
      emitters.map(e => labels[e] || e).join(" + ") || null
    ].filter(Boolean).join(" · ");
  }

  const CRM = { leadPayload, quotePayload, qualifiedFilePayload, flows, logEvent, getLog, describeProject };
  if (typeof window !== "undefined") window.SalusCRM = CRM;
  if (typeof module !== "undefined" && module.exports) module.exports = CRM;
})();
