/*
 * Mockroutes voor de ledenlijst, filters, sjablonen (mail en etiket),
 * lidaanvragen en zoeken.
 *
 * De vorm van elke respons volgt uit wat de frontend leest:
 * - src/services/leden/Ledenlijst.js, ledenlijstFilter.js, ledenlijstService.js
 * - src/views/Ledenlijst.vue, Mail.vue, Etiketten.vue, Aanvragen.vue
 * - src/components/global/LidZoekAutoComplete.vue, components/lid/Persoonlijk.vue
 */
const { GROEPEN, PROFIEL, FUNCTIES, LEDEN } = require("../shared");

const K = "be.vvksm.groepsadmin.model.column.";
const VINKJE_AAN = '<input type="checkbox" disabled checked/>';
const VINKJE_UIT = '<input type="checkbox" disabled/>';
// De frontend gaat ervan uit dat een volle pagina 50 leden bevat (selecteerAlleLeden)
const PAGINA = 50;

const FUNCTIE_LABELS = {
  [FUNCTIES.VGA]: "Groepsleiding",
  [FUNCTIES.FV]: "Financieel verantwoordelijke",
  [FUNCTIES.AVGA]: "Adjunct groepsleiding",
  [FUNCTIES.KAPOENEN]: "Kapoen",
  [FUNCTIES.WELPEN]: "Welp",
  [FUNCTIES.JONGGIVERS]: "Jonggiver",
  [FUNCTIES.GIVERS]: "Giver",
  [FUNCTIES.JINS]: "Jin",
  [FUNCTIES.LEIDING]: "Leiding",
  [FUNCTIES.GROEPSEIGEN_KOOKPLOEG]: "Kookploeg",
};
const TAK_LABELS = {
  [FUNCTIES.KAPOENEN]: "Kapoenen",
  [FUNCTIES.WELPEN]: "Welpen",
  [FUNCTIES.JONGGIVERS]: "Jonggivers",
  [FUNCTIES.GIVERS]: "Givers",
  [FUNCTIES.JINS]: "Jins",
  [FUNCTIES.LEIDING]: "Leiding",
};
const GROEP_NAAM = {
  [GROEPEN.HOOFD.id]: GROEPEN.HOOFD.naam,
  [GROEPEN.TWEEDE.id]: GROEPEN.TWEEDE.naam,
};
const STRATEN = [
  "Kerkstraat",
  "Stationsstraat",
  "Dorpsstraat",
  "Molenstraat",
  "Schoolstraat",
];
const GEMEENTEN = [
  ["9000", "Gent"],
  ["2000", "Antwerpen"],
  ["3000", "Leuven"],
  ["8000", "Brugge"],
];

function leeftijd(geboortedatum) {
  const nu = new Date();
  const g = new Date(geboortedatum);
  let l = nu.getFullYear() - g.getFullYear();
  const m = nu.getMonth() - g.getMonth();
  if (m < 0 || (m === 0 && nu.getDate() < g.getDate())) l--;
  return l;
}

function datumBE(iso) {
  return iso.substr(8, 2) + "/" + iso.substr(5, 2) + "/" + iso.substr(0, 4);
}

function vinkje(b) {
  return b ? VINKJE_AAN : VINKJE_UIT;
}

// Kolommen: id, label, type, groepering, verouderd
const KOLOMMEN = [
  ["VoornaamColumn", "Voornaam", "tekst", "Persoonsgegevens"],
  ["AchternaamColumn", "Achternaam", "tekst", "Persoonsgegevens"],
  ["VolledigeNaamColumn", "Volledige naam", "tekst", "Persoonsgegevens"],
  ["GeboorteDatumColumn", "Geboortedatum", "datum", "Persoonsgegevens"],
  ["LeeftijdColumn", "Leeftijd", "getal", "Persoonsgegevens"],
  ["GeslachtColumn", "Gender", "tekst", "Persoonsgegevens"],
  ["LidnummerColumn", "Lidnummer", "tekst", "Persoonsgegevens"],
  ["EmailColumn", "E-mailadres", "tekst", "Contactgegevens"],
  ["GsmColumn", "Gsm", "tekst", "Contactgegevens"],
  ["TelefoonColumn", "Telefoon", "tekst", "Contactgegevens", true],
  ["StraatColumn", "Straat", "tekst", "Adres"],
  ["HuisnummerColumn", "Huisnummer", "tekst", "Adres"],
  ["PostcodeColumn", "Postcode", "tekst", "Adres"],
  ["GemeenteColumn", "Gemeente", "tekst", "Adres"],
  ["TakColumn", "Tak", "tekst", "Functies"],
  ["FunctiesColumn", "Functies", "tekst", "Functies"],
  ["VVKSMGroepenColumn", "Groep", "tekst", "Groepen"],
  ["VVKSMGroepsNamenColumn", "Groepsnaam", "tekst", "Groepen"],
  ["VVKSMGroepsNummersColumn", "Groepsnummer", "tekst", "Groepen"],
  [
    "LidgeldBetaaldColumn",
    "Lidgeld betaald aan SGV",
    "vinkje",
    "Verbondsgegevens",
  ],
  [
    "VerminderdLidgeldColumn",
    "Verminderd lidgeld",
    "vinkje",
    "Verbondsgegevens",
  ],
  ["BeperkingColumn", "Beperking", "vinkje", "Verbondsgegevens"],
  [
    "IndividueleSteekkaartLinkColumn",
    "Link naar individuele steekkaart",
    "tekst",
    "Verbondsgegevens",
  ],
].map(([naam, label, type, groepering, verouderd]) => ({
  id: K + naam,
  label,
  type,
  groepering,
  verouderd: !!verouderd,
}));

// Alle kolomwaarden per lid, eenmalig opgebouwd uit de gedeelde LEDEN
const RIJEN = LEDEN.map((lid, i) => {
  const [postcode, gemeente] = GEMEENTEN[i % GEMEENTEN.length];
  const lidgeldBetaald = i % 4 !== 3;
  return {
    lid,
    waarden: {
      [K + "VoornaamColumn"]: lid.voornaam,
      [K + "AchternaamColumn"]: lid.achternaam,
      [K + "VolledigeNaamColumn"]: lid.voornaam + " " + lid.achternaam,
      [K + "GeboorteDatumColumn"]: datumBE(lid.geboortedatum),
      [K + "LeeftijdColumn"]: String(leeftijd(lid.geboortedatum)),
      [K + "GeslachtColumn"]: lid.geslacht,
      [K + "LidnummerColumn"]: lid.lidnummer,
      [K + "EmailColumn"]: lid.email,
      [K + "GsmColumn"]: lid.gsm,
      [K + "TelefoonColumn"]: "",
      [K + "StraatColumn"]: STRATEN[i % STRATEN.length],
      [K + "HuisnummerColumn"]: String(((i * 7) % 120) + 1),
      [K + "PostcodeColumn"]: postcode,
      [K + "GemeenteColumn"]: gemeente,
      [K + "TakColumn"]: TAK_LABELS[lid.functie] || "",
      [K + "FunctiesColumn"]: FUNCTIE_LABELS[lid.functie] || "",
      [K + "VVKSMGroepenColumn"]:
        GROEP_NAAM[lid.groep] + " [" + lid.groep + "]",
      [K + "VVKSMGroepsNamenColumn"]: GROEP_NAAM[lid.groep],
      [K + "VVKSMGroepsNummersColumn"]: lid.groep,
      [K + "LidgeldBetaaldColumn"]: vinkje(lidgeldBetaald),
      [K + "VerminderdLidgeldColumn"]: vinkje(i % 7 === 2),
      [K + "BeperkingColumn"]: vinkje(i % 11 === 5),
      [K + "IndividueleSteekkaartLinkColumn"]: "",
    },
    emailgeblokkeerd: i === 13,
    adresgeblokkeerd: i === 17,
    verminderdLidgeld: i % 7 === 2,
  };
});

const ALLE_FUNCTIES = [
  FUNCTIES.KAPOENEN,
  FUNCTIES.WELPEN,
  FUNCTIES.JONGGIVERS,
  FUNCTIES.GIVERS,
  FUNCTIES.JINS,
  FUNCTIES.LEIDING,
  FUNCTIES.VGA,
  FUNCTIES.FV,
  FUNCTIES.AVGA,
];

const STANDAARD_KOLOMMEN = [
  K + "VoornaamColumn",
  K + "AchternaamColumn",
  K + "GeboorteDatumColumn",
  K + "TakColumn",
  K + "EmailColumn",
  K + "GsmColumn",
  K + "LidgeldBetaaldColumn",
];

function filterLinks(id) {
  return [
    {
      rel: "self",
      href: "/groepsadmin/rest-ga/ledenlijst/filter/" + id,
      method: "GET",
    },
    {
      rel: "update",
      href: "/groepsadmin/rest-ga/ledenlijst/filter/" + id,
      method: "PATCH",
    },
    {
      rel: "delete",
      href: "/groepsadmin/rest-ga/ledenlijst/filter/" + id,
      method: "DELETE",
    },
  ];
}

// Opmerking: laat "individuelesteekkaart" en "leeftijd" weg in plaats van null,
// want getActieveCriteria leest dan value.referentie en crasht.
function maakFilters() {
  return [
    {
      id: "mock-filter-standaard",
      naam: "Alle leden",
      type: "verbond",
      delen: false,
      criteria: {
        functies: ALLE_FUNCTIES.slice(),
        groepen: [GROEPEN.HOOFD.id, GROEPEN.TWEEDE.id],
        oudleden: false,
      },
      groepen: [GROEPEN.HOOFD.id, GROEPEN.TWEEDE.id],
      kolommen: STANDAARD_KOLOMMEN.slice(),
      sortering: [K + "AchternaamColumn"],
      links: filterLinks("mock-filter-standaard"),
    },
    {
      id: "mock-filter-leiding",
      naam: "Leiding",
      type: "verbond",
      delen: false,
      criteria: {
        functies: [FUNCTIES.LEIDING, FUNCTIES.VGA, FUNCTIES.AVGA, FUNCTIES.FV],
        groepen: [GROEPEN.HOOFD.id],
        oudleden: false,
      },
      groepen: [GROEPEN.HOOFD.id],
      kolommen: [
        K + "VolledigeNaamColumn",
        K + "FunctiesColumn",
        K + "EmailColumn",
        K + "GsmColumn",
      ],
      sortering: [K + "VolledigeNaamColumn"],
      links: filterLinks("mock-filter-leiding"),
    },
    {
      id: "mock-filter-eigen-kapoenen",
      naam: "Kapoenen met adres",
      type: "lid",
      delen: false,
      criteria: {
        functies: [FUNCTIES.KAPOENEN],
        groepen: [GROEPEN.HOOFD.id],
        geslacht: "vrouw",
      },
      groepen: [GROEPEN.HOOFD.id],
      kolommen: [
        K + "VoornaamColumn",
        K + "AchternaamColumn",
        K + "StraatColumn",
        K + "HuisnummerColumn",
        K + "PostcodeColumn",
        K + "GemeenteColumn",
      ],
      sortering: [K + "VoornaamColumn"],
      links: filterLinks("mock-filter-eigen-kapoenen"),
    },
    {
      id: "mock-filter-eigen-lidgeld",
      naam: "Lidgeld opvolgen",
      type: "lid",
      delen: true,
      criteria: {
        functies: ALLE_FUNCTIES.slice(),
        groepen: [GROEPEN.HOOFD.id],
        verminderdLidgeld: true,
        oudleden: false,
      },
      groepen: [GROEPEN.HOOFD.id],
      kolommen: [
        K + "VolledigeNaamColumn",
        K + "TakColumn",
        K + "LidgeldBetaaldColumn",
        K + "VerminderdLidgeldColumn",
      ],
      sortering: [K + "VolledigeNaamColumn"],
      links: filterLinks("mock-filter-eigen-lidgeld"),
    },
    {
      id: "mock-filter-gedeeld-groep",
      naam: "Givers en jins",
      type: "groep",
      delen: true,
      gedeeldvanuit: [GROEPEN.HOOFD.id],
      criteria: {
        functies: [FUNCTIES.GIVERS, FUNCTIES.JINS],
        groepen: [GROEPEN.HOOFD.id],
        oudleden: false,
      },
      groepen: [GROEPEN.HOOFD.id],
      kolommen: [
        K + "VoornaamColumn",
        K + "AchternaamColumn",
        K + "LeeftijdColumn",
        K + "TakColumn",
      ],
      sortering: [K + "LeeftijdColumn"],
      links: filterLinks("mock-filter-gedeeld-groep"),
    },
  ];
}

function normaliseerFilter(f) {
  const filter = Object.assign({}, f || {});
  filter.criteria = Object.assign({}, filter.criteria || {});
  // null-waarden voor deze sleutels laten getActieveCriteria crashen
  ["individuelesteekkaart", "leeftijd"].forEach((k) => {
    if (filter.criteria[k] == null) delete filter.criteria[k];
  });
  if (!Array.isArray(filter.kolommen) || filter.kolommen.length === 0) {
    filter.kolommen = STANDAARD_KOLOMMEN.slice();
  }
  if (!Array.isArray(filter.sortering)) filter.sortering = [];
  if (!Array.isArray(filter.groepen)) filter.groepen = [GROEPEN.HOOFD.id];
  if (!Array.isArray(filter.links)) filter.links = [];
  if (!filter.naam) filter.naam = "Huidige lijst";
  return filter;
}

function maakSjablonen() {
  return {
    mail: [
      {
        id: "mock-sjabloon-mail-blanco",
        naam: "blanco sjabloon",
        onderwerp: "",
        inhoud: "",
        van: PROFIEL.email,
        replyTo: "",
        bcc: "",
        bestemming: { lid: true, contacten: false, groepseigenGegevens: [] },
        lidIds: [],
        links: [],
      },
      {
        id: "mock-sjabloon-mail-weekend",
        naam: "Uitnodiging weekend",
        onderwerp: "Kom mee op weekend!",
        inhoud:
          "<p>Dag [Voornaam],</p><p>Dit weekend trekken we er samen op uit. Vergeet je slaapzak niet!</p><p>Stevige linker,<br/>De leiding</p>",
        van: PROFIEL.email,
        replyTo: "leiding@voorbeeld.be",
        bcc: "",
        bestemming: { lid: true, contacten: true, groepseigenGegevens: [] },
        lidIds: [],
        links: [
          {
            rel: "self",
            href:
              "/groepsadmin/rest-ga/sjabloon/mail/mock-sjabloon-mail-weekend",
            method: "GET",
          },
        ],
      },
      {
        id: "mock-sjabloon-mail-lidgeld",
        naam: "Herinnering lidgeld",
        onderwerp: "Herinnering: lidgeld",
        inhoud:
          "<p>Dag [Volledige naam],</p><p>We ontvingen jouw lidgeld nog niet. Betaal je het deze week?</p>",
        van: PROFIEL.email,
        replyTo: "",
        bcc: "",
        bestemming: { lid: true, contacten: true, groepseigenGegevens: [] },
        lidIds: [],
        links: [
          {
            rel: "self",
            href:
              "/groepsadmin/rest-ga/sjabloon/mail/mock-sjabloon-mail-lidgeld",
            method: "GET",
          },
        ],
      },
    ],
    etiket: [
      {
        id: "mock-sjabloon-etiket-standaard",
        naam: "standaard formaat",
        inhoud:
          "<p>[Volledige naam]<br/>[Straat] [Huisnummer]<br/>[Postcode] [Gemeente]</p>",
        blanco: 0,
        alleAdressen: false,
        familie: false,
        aantalEtikettenPerRij: 3,
        aantalRijenPerPagina: 8,
        grootte: { horizontaal: 70, verticaal: 36 },
        marge: { horizontaal: 0, verticaal: 4 },
        tussenruimte: { horizontaal: 0, verticaal: 0 },
        lidIds: [],
        links: [],
      },
      {
        id: "mock-sjabloon-etiket-familie",
        naam: "Families 2x7",
        inhoud:
          "<p>Familie [Achternaam]<br/>[Straat] [Huisnummer]<br/>[Postcode] [Gemeente]</p>",
        blanco: 1,
        alleAdressen: true,
        familie: true,
        aantalEtikettenPerRij: 2,
        aantalRijenPerPagina: 7,
        grootte: { horizontaal: 99, verticaal: 38 },
        marge: { horizontaal: 5, verticaal: 15 },
        tussenruimte: { horizontaal: 2, verticaal: 0 },
        lidIds: [],
        links: [
          {
            rel: "self",
            href:
              "/groepsadmin/rest-ga/sjabloon/etiket/mock-sjabloon-etiket-familie",
            method: "GET",
          },
        ],
      },
    ],
  };
}

function maakAanvragen() {
  const basis = [
    {
      voornaam: "Oona",
      achternaam: "Vermeulen",
      geboortedatum: "2018-05-14",
      geslacht: "vrouw",
      email: "ouders.vermeulen@voorbeeld.be",
      gsm: "+32 471 11 22 33",
      straat: "Lindelaan",
      nummer: "12",
      postcode: "9000",
      gemeente: "Gent",
      opmerkingen:
        "Oona wil graag samen met haar vriendin Fien bij de kapoenen.",
      aangepast: "2026-10-28T09:15:00.000+01:00",
      ouder: ["Sofie", "Vermeulen", "moeder"],
    },
    {
      voornaam: "Daan",
      achternaam: "Lemmens",
      geboortedatum: "2015-11-02",
      geslacht: "man",
      email: "daan.lemmens@voorbeeld.be",
      gsm: "+32 472 44 55 66",
      straat: "Veldweg",
      nummer: "3",
      postcode: "3000",
      gemeente: "Leuven",
      opmerkingen: "",
      aangepast: "2026-11-02T18:40:00.000+01:00",
      ouder: ["Pieter", "Lemmens", "vader"],
    },
    {
      voornaam: "Yara",
      achternaam: "El Amrani",
      geboortedatum: "2012-02-21",
      geslacht: "andere",
      email: "yara.elamrani@voorbeeld.be",
      gsm: "+32 473 77 88 99",
      straat: "Kerkstraat",
      nummer: "45",
      postcode: "2000",
      gemeente: "Antwerpen",
      opmerkingen: "Heeft een glutenallergie.",
      aangepast: "2026-11-05T12:05:00.000+01:00",
      ouder: ["Nadia", "El Amrani", "moeder"],
    },
  ];
  return basis.map((a, i) => {
    const id = "mock-aanvraag-000" + (i + 1);
    const adresId = "mock-aanvraag-adres-000" + (i + 1);
    const adres = {
      id: adresId,
      straat: a.straat,
      nummer: a.nummer,
      bus: "",
      postcode: a.postcode,
      gemeente: a.gemeente,
      land: "BE",
      postadres: true,
      omschrijving: "",
      telefoon: "",
    };
    return {
      id,
      aangepast: a.aangepast,
      groepsnummer: GROEPEN.HOOFD.id,
      voornaam: a.voornaam,
      achternaam: a.achternaam,
      geboortedatum: a.geboortedatum,
      email: a.email,
      gsmnummer: a.gsm,
      opmerkingen: a.opmerkingen,
      verminderdlidgeld: i === 1,
      beperking: false,
      persoonsgegevens: {
        geslacht: a.geslacht,
        gsm: a.gsm,
        rekeningnummer: "",
        rijksregisternummer: "",
      },
      adres,
      adressen: [adres],
      contacten: [
        {
          id: "mock-aanvraag-contact-000" + (i + 1),
          rol: a.ouder[2],
          voornaam: a.ouder[0],
          achternaam: a.ouder[1],
          email: a.email,
          gsm: a.gsm,
          adres,
          adresId,
          zelfdeAdres: true,
        },
      ],
      groepsEigenGegevens: [],
      links: [
        {
          rel: "self",
          href: "/groepsadmin/rest-ga/lid/aanvraag/" + id,
          method: "GET",
        },
        {
          rel: "goedkeuren",
          href: "/groepsadmin/rest-ga/lid/aanvraag/" + id + "?aanvaard=ja",
          method: "DELETE",
        },
      ],
    };
  });
}

function minimalePdf(titel) {
  const tekst = String(titel).replace(/[()\\]/g, "");
  const stream = "BT /F1 18 Tf 72 760 Td (" + tekst + ") Tj ET";
  const objecten = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objecten.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += i + 1 + " 0 obj\n" + o + "\nendobj\n";
  });
  const xref = pdf.length;
  pdf += "xref\n0 " + (objecten.length + 1) + "\n0000000000 65535 f \n";
  offsets.forEach((o) => {
    pdf += String(o).padStart(10, "0") + " 00000 n \n";
  });
  pdf +=
    "trailer\n<< /Size " +
    (objecten.length + 1) +
    " /Root 1 0 R >>\nstartxref\n" +
    xref +
    "\n%%EOF\n";
  return Buffer.from(pdf, "latin1");
}

function stuurPdf(res, naam, titel) {
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", 'attachment; filename="' + naam + '"');
  res.send(minimalePdf(titel));
}

let teller = 1;
function nieuwId(prefix) {
  return prefix + "-" + Date.now().toString(36) + "-" + teller++;
}

module.exports = function (router, db) {
  db.ledenlijst = db.ledenlijst || {};
  const st = db.ledenlijst;
  st.filters = st.filters || maakFilters();
  st.huidigeFilter =
    st.huidigeFilter ||
    normaliseerFilter(
      Object.assign({}, st.filters[0], {
        id: null,
        naam: "Huidige lijst",
        type: "lid",
      })
    );
  st.sjablonen = st.sjablonen || maakSjablonen();
  st.aanvragen = st.aanvragen || maakAanvragen();

  // Rijen die door de huidige filter komen, gesorteerd volgens de sortering
  function gefilterdeRijen() {
    const c = st.huidigeFilter.criteria || {};
    let rijen = RIJEN.slice();
    if (Array.isArray(c.functies) && c.functies.length > 0) {
      rijen = rijen.filter((r) => c.functies.includes(r.lid.functie));
    }
    if (Array.isArray(c.groepen) && c.groepen.length > 0) {
      rijen = rijen.filter((r) => c.groepen.includes(r.lid.groep));
    }
    if (typeof c.geslacht === "string" && c.geslacht) {
      rijen = rijen.filter((r) => r.lid.geslacht === c.geslacht);
    }
    if (c.oudleden === true) rijen = [];
    if (c.geweigerdLid === true) rijen = [];
    if (c.emailleeg === true) rijen = [];
    if (c.verminderdLidgeld === true)
      rijen = rijen.filter((r) => r.verminderdLidgeld);
    if (c.emailgeblokkeerd === true)
      rijen = rijen.filter((r) => r.emailgeblokkeerd);
    if (c.adresgeblokkeerd === true)
      rijen = rijen.filter((r) => r.adresgeblokkeerd);
    if (c.leeftijd) {
      const { jongerdan, ouderdan } = c.leeftijd;
      rijen = rijen.filter((r) => {
        const l = leeftijd(r.lid.geboortedatum);
        if (jongerdan > 0 && l >= jongerdan) return false;
        if (ouderdan > 0 && l <= ouderdan) return false;
        return true;
      });
    }
    const sortKolom = (st.huidigeFilter.sortering || [])[0];
    if (sortKolom) {
      const sleutel =
        sortKolom === K + "GeboorteDatumColumn" ||
        sortKolom === K + "LeeftijdColumn"
          ? (r) => r.lid.geboortedatum
          : (r) => String(r.waarden[sortKolom] || "").toLowerCase();
      rijen.sort((a, b) =>
        sleutel(a) > sleutel(b) ? 1 : sleutel(a) < sleutel(b) ? -1 : 0
      );
      if (sortKolom === K + "LeeftijdColumn") rijen.reverse();
    }
    return rijen;
  }

  function naarLid(rij) {
    const waarden = {};
    // De backend stuurt de kolommen van de huidige filter mee; Mail en
    // Etiketten lezen altijd voornaam, achternaam en volledige naam.
    const kolommen = new Set(
      (st.huidigeFilter.kolommen || []).concat([
        K + "VoornaamColumn",
        K + "AchternaamColumn",
        K + "VolledigeNaamColumn",
      ])
    );
    kolommen.forEach((k) => {
      if (k in rij.waarden) waarden[k] = rij.waarden[k];
    });
    return {
      id: rij.lid.id,
      waarden,
      links: [
        {
          rel: "self",
          href: "/groepsadmin/rest-ga/lid/" + rij.lid.id,
          method: "GET",
        },
      ],
    };
  }

  function geselecteerdeRijen(body) {
    const ids = body && Array.isArray(body.lidIds) ? body.lidIds : null;
    const rijen = gefilterdeRijen();
    return ids ? RIJEN.filter((r) => ids.includes(r.lid.id)) : rijen;
  }

  // ---------- Ledenlijst ----------

  router.get("/ledenlijst", (req, res) => {
    const offset = parseInt(req.query.offset, 10) || 0;
    const rijen = gefilterdeRijen();
    const pagina = rijen.slice(offset, offset + PAGINA);
    res.json({
      aantal: pagina.length,
      totaal: rijen.length,
      offset,
      leden: pagina.map(naarLid),
      links: [],
    });
  });

  // CSV of PDF, afhankelijk van de Accept-header (ApiClientCsv / ApiClientPdf)
  router.post("/ledenlijst", (req, res) => {
    const rijen = geselecteerdeRijen(req.body);
    const accept = req.get("Accept") || "";
    if (accept.includes("text/csv")) {
      const kolomIds = st.huidigeFilter.kolommen;
      const kop = kolomIds.map(
        (id) => (KOLOMMEN.find((k) => k.id === id) || { label: id }).label
      );
      const schoon = (v) => {
        const s = String(v == null ? "" : v)
          .replace(VINKJE_AAN, "ja")
          .replace(VINKJE_UIT, "nee");
        return '"' + s.replace(/"/g, '""') + '"';
      };
      const lijnen = [kop.map(schoon).join(";")].concat(
        rijen.map((r) => kolomIds.map((id) => schoon(r.waarden[id])).join(";"))
      );
      res.set("Content-Type", "text/csv; charset=utf-8");
      res.set("Content-Disposition", 'attachment; filename="ledenlijst.csv"');
      return res.send("﻿" + lijnen.join("\r\n") + "\r\n");
    }
    stuurPdf(
      res,
      "ledenlijst.pdf",
      "Mock ledenlijst: " + rijen.length + " leden"
    );
  });

  router.get("/ledenlijst/kolom-type", (req, res) => {
    // Kopie per request: de frontend muteert kolommen (activated, kolomIndex, ...)
    res.json({ kolommen: KOLOMMEN.map((k) => Object.assign({}, k)) });
  });

  // ---------- Filters ----------
  // "huidige" eerst registreren, anders matcht /filter/:id

  router.get("/ledenlijst/filter/huidige", (req, res) => {
    res.json(st.huidigeFilter);
  });

  router.patch("/ledenlijst/filter/huidige", (req, res) => {
    st.huidigeFilter = normaliseerFilter(
      Object.assign({}, req.body, {
        naam: (req.body && req.body.naam) || "Huidige lijst",
      })
    );
    res.json(st.huidigeFilter);
  });

  router.get("/ledenlijst/filter", (req, res) => {
    res.json({ filters: st.filters });
  });

  router.post("/ledenlijst/filter", (req, res) => {
    const id = nieuwId("mock-filter");
    const filter = normaliseerFilter(
      Object.assign({}, req.body, { id, type: "lid", links: filterLinks(id) })
    );
    st.filters.push(filter);
    res.status(201).json(filter);
  });

  router.get("/ledenlijst/filter/:id", (req, res) => {
    const filter = st.filters.find((f) => f.id === req.params.id);
    if (!filter)
      return res.status(404).json({
        titel: "Niet gevonden",
        beschrijving: "Deze filter bestaat niet.",
      });
    res.json(filter);
  });

  router.patch("/ledenlijst/filter/:id", (req, res) => {
    const i = st.filters.findIndex((f) => f.id === req.params.id);
    if (i === -1)
      return res.status(404).json({
        titel: "Niet gevonden",
        beschrijving: "Deze filter bestaat niet.",
      });
    if (st.filters[i].type === "verbond") {
      return res.status(403).json({
        titel: "Geen toegang",
        beschrijving:
          "Een standaardfilter kan je niet aanpassen. Sla hem op onder een nieuwe naam.",
      });
    }
    st.filters[i] = normaliseerFilter(
      Object.assign({}, st.filters[i], req.body, {
        id: req.params.id,
        links: filterLinks(req.params.id),
      })
    );
    res.json(st.filters[i]);
  });

  router.delete("/ledenlijst/filter/:id", (req, res) => {
    st.filters = st.filters.filter((f) => f.id !== req.params.id);
    res.status(204).end();
  });

  // ---------- Mail en etiketten ----------

  router.post("/ledenlijst/mail", (req, res) => {
    // multipart/form-data: geen parser actief, dus lidIds uit de ruwe body vissen
    let ruw = "";
    req.setEncoding("utf8");
    req.on("data", (d) => {
      ruw += d;
    });
    req.on("end", () => {
      let lidIds = [];
      const m = ruw.match(/"lidIds"\s*:\s*\[([^\]]*)\]/);
      if (m) {
        try {
          lidIds = JSON.parse("[" + m[1] + "]");
        } catch (e) {
          lidIds = [];
        }
      }
      if (req.query.bevestig !== "true") {
        return res.status(400).json({
          titel: "Bevestiging nodig",
          beschrijving: "Bevestig het versturen.",
          boodschap:
            "Je staat op het punt een e-mail te versturen naar " +
            lidIds.length +
            " leden.",
          vraag: "Wil je de e-mail versturen?",
          infoLink:
            "https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:e-mail",
        });
      }
      const gelukt = [];
      const mislukt = [];
      lidIds.forEach((id) => {
        const rij = RIJEN.find((r) => r.lid.id === id);
        if (!rij) return;
        (rij.emailgeblokkeerd ? mislukt : gelukt).push(rij.lid.email);
      });
      res.json({ gelukt, mislukt });
    });
  });

  router.post("/ledenlijst/etiket", (req, res) => {
    const n =
      req.body && Array.isArray(req.body.lidIds) ? req.body.lidIds.length : 0;
    stuurPdf(res, "etiketten.pdf", "Mock etiketten: " + n + " leden");
  });

  // ---------- Sjablonen ----------

  function sjabloonLijst(type) {
    if (!st.sjablonen[type]) st.sjablonen[type] = [];
    return st.sjablonen[type];
  }

  router.get("/sjabloon/:type", (req, res) => {
    res.json({ sjablonen: sjabloonLijst(req.params.type) });
  });

  router.post("/sjabloon/:type", (req, res) => {
    const type = req.params.type;
    const id = nieuwId("mock-sjabloon-" + type);
    const sjabloon = Object.assign({}, req.body, {
      id,
      links: [
        {
          rel: "self",
          href: "/groepsadmin/rest-ga/sjabloon/" + type + "/" + id,
          method: "GET",
        },
      ],
    });
    if (type === "mail" && !sjabloon.bestemming) {
      sjabloon.bestemming = {
        lid: true,
        contacten: false,
        groepseigenGegevens: [],
      };
    }
    sjabloonLijst(type).push(sjabloon);
    res.status(201).json(sjabloon);
  });

  router.get("/sjabloon/:type/:id", (req, res) => {
    const s = sjabloonLijst(req.params.type).find(
      (x) => x.id === req.params.id
    );
    if (!s)
      return res.status(404).json({
        titel: "Niet gevonden",
        beschrijving: "Dit sjabloon bestaat niet.",
      });
    res.json(s);
  });

  router.patch("/sjabloon/:type/:id", (req, res) => {
    const lijst = sjabloonLijst(req.params.type);
    const i = lijst.findIndex((x) => x.id === req.params.id);
    if (i === -1)
      return res.status(404).json({
        titel: "Niet gevonden",
        beschrijving: "Dit sjabloon bestaat niet.",
      });
    lijst[i] = Object.assign({}, lijst[i], req.body, {
      id: req.params.id,
      links: lijst[i].links || [],
    });
    res.json(lijst[i]);
  });

  router.delete("/sjabloon/:type/:id", (req, res) => {
    st.sjablonen[req.params.type] = sjabloonLijst(req.params.type).filter(
      (x) => x.id !== req.params.id
    );
    res.status(204).end();
  });

  // ---------- Lidaanvragen ----------
  // Let op: lid.js registreert /lid/:id en wordt eerder geladen.

  router.get("/lid/aanvraag", (req, res) => {
    res.json({ aanvragen: st.aanvragen });
  });

  router.post("/lid/aanvraag", (req, res) => {
    const b = req.body || {};
    const id = nieuwId("mock-aanvraag");
    const adres = (b.adressen && b.adressen[0]) || {};
    st.aanvragen.push(
      Object.assign(
        {
          adressen: [],
          contacten: [],
          groepsEigenGegevens: [],
          persoonsgegevens: {},
          opmerkingen: "",
        },
        b,
        {
          id,
          aangepast: new Date().toISOString(),
          groepsnummer: b.groepsnummer || GROEPEN.HOOFD.id,
          adres: b.adres || {
            straat: adres.straat || "",
            nummer: adres.nummer || "",
            land: adres.land || "BE",
            postcode: adres.postcode || "",
            gemeente: adres.gemeente || "",
          },
          gsmnummer:
            b.gsmnummer || (b.persoonsgegevens && b.persoonsgegevens.gsm) || "",
          groepsEigenGegevens: Array.isArray(b.groepsEigenGegevens)
            ? b.groepsEigenGegevens
            : [],
          links: [
            {
              rel: "self",
              href: "/groepsadmin/rest-ga/lid/aanvraag/" + id,
              method: "GET",
            },
            {
              rel: "goedkeuren",
              href: "/groepsadmin/rest-ga/lid/aanvraag/" + id + "?aanvaard=ja",
              method: "DELETE",
            },
          ],
        }
      )
    );
    // InschrijvingsService verwacht 204
    res.status(204).end();
  });

  router.delete("/lid/aanvraag/:id", (req, res) => {
    st.aanvragen = st.aanvragen.filter((a) => a.id !== req.params.id);
    res.status(204).end();
  });

  // ---------- Zoeken ----------

  function zoekLid(l) {
    return {
      id: l.id,
      voornaam: l.voornaam,
      achternaam: l.achternaam,
      geboortedatum: l.geboortedatum,
      links: [
        {
          rel: "self",
          href: "/groepsadmin/rest-ga/lid/" + l.id,
          method: "GET",
        },
      ],
    };
  }

  router.get("/zoeken/gelijkaardig", (req, res) => {
    const vn = String(req.query.voornaam || "")
      .toLowerCase()
      .trim();
    const an = String(req.query.achternaam || "")
      .toLowerCase()
      .trim();
    const leden = LEDEN.concat([PROFIEL]).filter(
      (l) =>
        an &&
        l.achternaam.toLowerCase() === an &&
        (!vn || l.voornaam.toLowerCase()[0] === vn[0])
    );
    res.json({ leden: leden.map(zoekLid) });
  });

  router.get("/zoeken", (req, res) => {
    const q = String(req.query.query || "")
      .toLowerCase()
      .trim();
    if (q.length < 2) return res.json({ leden: [] });
    const delen = q.split(/\s+/);
    const leden = LEDEN.concat([PROFIEL]).filter((l) => {
      const hooiberg = [
        l.voornaam,
        l.achternaam,
        l.email,
        l.gsm.replace(/\s/g, ""),
        l.lidnummer,
      ]
        .join(" ")
        .toLowerCase();
      return delen.every((d) => hooiberg.includes(d.replace(/\s/g, "")));
    });
    res.json({ leden: leden.slice(0, 15).map(zoekLid) });
  });
};
