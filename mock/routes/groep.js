/*
 * Mockroutes voor root-links, websites, groepen, functies, ledenaantallen,
 * activiteiten, aanwezigheden en gemeentes.
 *
 * Data in db:
 *   db.groepen        array van groepen (zonder groepseigenFuncties, die
 *                     worden bij elke respons afgeleid uit db.functies)
 *   db.functies       array van verbonds- en groepseigen functies
 *   db.activiteiten   array van betalende activiteiten
 *   db.aanwezigheden  array van aanwezigheden (koppeling activiteit en lid)
 */
const { GROEPEN, PROFIEL, FUNCTIES, LEDEN } = require("../shared");

const BASE = "/groepsadmin/rest-ga";

const link = (rel, href, method = "GET", extra = {}) => ({
  rel,
  href: BASE + href,
  method,
  ...extra,
});

// ---------------------------------------------------------------------------
// Functies
// ---------------------------------------------------------------------------
const ALLE_GROEPEN = [GROEPEN.HOOFD.id, GROEPEN.TWEEDE.id];

const GROEPERINGEN = {
  LEDEN: { id: "mock-groepering-leden", naam: "Leden", volgorde: 1 },
  LEIDING: { id: "mock-groepering-leiding", naam: "Leiding", volgorde: 2 },
  ANDEREN: { id: "mock-groepering-anderen", naam: "Anderen", volgorde: 3 },
  GROEPSEIGEN: {
    id: "mock-groepering-groepseigen",
    naam: "Groepseigen functies",
    volgorde: 4,
  },
};

const functieLinks = (id, groepseigen) => {
  const links = [link("self", "/functie/" + id, "GET")];
  if (groepseigen) {
    links.push(link("self", "/functie/" + id, "PATCH"));
    links.push(link("self", "/functie/" + id, "DELETE"));
  }
  return links;
};

const verbondsFunctie = (id, code, beschrijving, groepering, extra = {}) => ({
  id,
  code,
  beschrijving,
  type: "verbond",
  groepen: [...ALLE_GROEPEN],
  groeperingen: [groepering],
  adjunct: false,
  links: functieLinks(id, false),
  ...extra,
});

const groepseigenFunctie = (id, beschrijving, groepsnummer) => ({
  id,
  code: "",
  beschrijving,
  type: "groep",
  groepen: [groepsnummer],
  groeperingen: [GROEPERINGEN.GROEPSEIGEN],
  adjunct: false,
  links: functieLinks(id, true),
});

const maakFuncties = () => [
  verbondsFunctie(FUNCTIES.VGA, "GRL", "Groepsleiding", GROEPERINGEN.LEIDING),
  verbondsFunctie(
    FUNCTIES.AVGA,
    "AGRL",
    "Adjunct groepsleiding",
    GROEPERINGEN.LEIDING,
    { adjunct: true }
  ),
  verbondsFunctie(
    FUNCTIES.FV,
    "FV",
    "Financieel verantwoordelijke",
    GROEPERINGEN.ANDEREN
  ),
  verbondsFunctie(FUNCTIES.LEIDING, "LEI", "Takleiding", GROEPERINGEN.LEIDING),
  verbondsFunctie(FUNCTIES.KAPOENEN, "KAP", "Kapoen", GROEPERINGEN.LEDEN),
  verbondsFunctie(
    FUNCTIES.WELPEN,
    "WEL",
    "Kabouter of welp",
    GROEPERINGEN.LEDEN
  ),
  verbondsFunctie(
    FUNCTIES.JONGGIVERS,
    "JGV",
    "Jonggids of jongverkenner",
    GROEPERINGEN.LEDEN
  ),
  verbondsFunctie(
    FUNCTIES.GIVERS,
    "GVE",
    "Gids of verkenner",
    GROEPERINGEN.LEDEN
  ),
  verbondsFunctie(FUNCTIES.JINS, "JIN", "Jin", GROEPERINGEN.LEDEN),
  groepseigenFunctie(
    FUNCTIES.GROEPSEIGEN_KOOKPLOEG,
    "Kookploeg",
    GROEPEN.HOOFD.id
  ),
  groepseigenFunctie(
    "mock-functie-groepseigen-materiaalmeester",
    "Materiaalmeester",
    GROEPEN.HOOFD.id
  ),
  groepseigenFunctie(
    "mock-functie-groepseigen-fotograaf",
    "Fotograaf",
    GROEPEN.TWEEDE.id
  ),
];

// ---------------------------------------------------------------------------
// Groepen
// ---------------------------------------------------------------------------
const lidNaam = (lid) => lid.voornaam + " " + lid.achternaam;

const contact = (lid, oidFunctie, adresId, rol) => ({
  lid: lid.id,
  oidFunctie,
  functie: oidFunctie,
  rol,
  voornaam: lid.voornaam,
  achternaam: lid.achternaam,
  naam: lidNaam(lid),
  email: lid.email,
  gsm: lid.gsm,
  adres: adresId,
});

const maakGroepen = () => {
  const hoofdAdressen = [
    {
      id: "mock-adres-groep-0001",
      omschrijving: "Hoofdlokaal",
      land: "BE",
      postcode: "9000",
      gemeente: "Gent",
      straat: "Kortrijksesteenweg",
      nummer: "12",
      bus: "",
      telefoon: "+32 9 123 45 67",
      postadres: true,
      positie: { latitude: 51.0393, longitude: 3.7148 },
    },
    {
      id: "mock-adres-groep-0002",
      omschrijving: "Kapoenenlokaal",
      land: "BE",
      postcode: "9050",
      gemeente: "Gentbrugge",
      straat: "Bosstraat",
      nummer: "3",
      bus: "A",
      telefoon: "",
      postadres: false,
      positie: { latitude: 51.0391, longitude: 3.7612 },
    },
  ];
  const tweedeAdressen = [
    {
      id: "mock-adres-groep-0003",
      omschrijving: "Lokaal Testegem",
      land: "BE",
      postcode: "2000",
      gemeente: "Antwerpen",
      straat: "Meir",
      nummer: "50",
      bus: "",
      telefoon: "",
      postadres: true,
      positie: { latitude: 51.2185, longitude: 4.4085 },
    },
  ];

  const hoofd = {
    id: GROEPEN.HOOFD.id,
    groepsnummer: GROEPEN.HOOFD.id,
    naam: GROEPEN.HOOFD.naam,
    email: "info@mockdorp.be",
    website: "https://www.mockdorp.be",
    vrijeInfo: "Elke zondag van 14u tot 17u. Kamp in de tweede helft van juli.",
    opgericht: "1952-09-01T00:00:00.000Z",
    rekeningnummer: "BE68 5390 0754 7034",
    facturatieLeiding: "2026-08-28T10:00:00.000Z",
    facturatieLeden: null,
    ledenVerbeterdTonen: true,
    "publiek-inschrijven": true,
    beeindigd: false,
    verantwoordelijkheden: ["leiding", "groepsleiding"],
    adressen: hoofdAdressen,
    contacten: [
      contact(PROFIEL, FUNCTIES.VGA, "mock-adres-groep-0001", "Groepsleiding"),
      contact(LEDEN[5], FUNCTIES.FV, "mock-adres-groep-0001", "Financieel"),
      contact(LEDEN[11], FUNCTIES.AVGA, null, "Adjunct groepsleiding"),
      contact(LEDEN[17], FUNCTIES.AVGA, null, "Adjunct groepsleiding"),
    ],
    instantie: {
      naam: "Stad Gent, dienst Jeugd",
      kbo: "0207.451.227",
      adres: {
        land: "BE",
        postcode: "9000",
        gemeente: "Gent",
        straat: "Botermarkt",
        nummer: "1",
        bus: "",
      },
    },
    groepseigenGegevens: [
      {
        id: "mock-geg-0001",
        label: "Totem",
        beschrijving: "Totem van het lid, als die er al een heeft",
        type: "tekst",
        kanLidWijzigen: false,
        kanLeidingWijzigen: true,
        sort: 0,
        keuzes: [],
      },
      {
        id: "mock-geg-0002",
        label: "T-shirtmaat",
        beschrijving: "Voor de groepstrui",
        type: "lijst",
        kanLidWijzigen: true,
        kanLeidingWijzigen: true,
        sort: 1,
        keuzes: ["XS", "S", "M", "L", "XL"],
      },
      {
        id: "mock-geg-0003",
        label: "Foto's toegestaan",
        beschrijving: "Mag de groep foto's van dit lid publiceren?",
        type: "vinkje",
        kanLidWijzigen: true,
        kanLeidingWijzigen: true,
        sort: 2,
        keuzes: [],
      },
      {
        id: "mock-geg-0004",
        label: "Opmerkingen",
        beschrijving: "Vrije opmerkingen van de leiding",
        type: "tekst_meerdere_lijnen",
        kanLidWijzigen: false,
        kanLeidingWijzigen: true,
        sort: 3,
        keuzes: [],
      },
    ],
  };

  const tweede = {
    id: GROEPEN.TWEEDE.id,
    groepsnummer: GROEPEN.TWEEDE.id,
    naam: GROEPEN.TWEEDE.naam,
    email: "groepsleiding@testegem.be",
    website: "",
    vrijeInfo: "",
    opgericht: "1978-10-01T00:00:00.000Z",
    rekeningnummer: "BE71 0961 2345 6769",
    facturatieLeiding: null,
    facturatieLeden: null,
    ledenVerbeterdTonen: false,
    "publiek-inschrijven": false,
    beeindigd: false,
    verantwoordelijkheden: ["leiding"],
    adressen: tweedeAdressen,
    contacten: [
      contact(LEDEN[9], FUNCTIES.VGA, "mock-adres-groep-0003", "Groepsleiding"),
      contact(LEDEN[19], FUNCTIES.FV, null, "Financieel"),
    ],
    instantie: null,
    groepseigenGegevens: [],
  };

  return [hoofd, tweede];
};

// Afgeleide velden die de frontend zelf toevoegt en die we niet bewaren
const AFGELEIDE_VELDEN = [
  "vga",
  "fv",
  "groepsleiding",
  "groepseigenFunctie",
  "groepseigenFuncties",
  "functies",
  "leidingVerbeterdBeschrijving",
  "leidingVerbeterdEnabled",
  "ledenVerbeterdBeschrijving",
  "ledenVerbeterdEnabled",
  "publiekInschrijven",
  "links",
];

// ---------------------------------------------------------------------------
// Ledenaantallen
// ---------------------------------------------------------------------------
const HUIDIG_WERKJAAR = (() => {
  const nu = new Date();
  return nu.getMonth() >= 8 ? nu.getFullYear() : nu.getFullYear() - 1;
})();

// Deterministische pseudo-random zodat elke groep stabiele cijfers krijgt
const seeded = (seedTekst) => {
  let seed = 0;
  for (const c of seedTekst) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
};

const reeks = (rnd, basis, spreiding) => {
  const result = {};
  for (let i = 5; i >= 1; i--) {
    result[String(HUIDIG_WERKJAAR - i)] = Math.max(
      0,
      Math.round(basis + (rnd() - 0.5) * spreiding)
    );
  }
  result.Nu = Math.max(0, Math.round(basis + (rnd() - 0.3) * spreiding));
  return result;
};

const reeksKomma = (rnd, basis, spreiding) => {
  const result = {};
  for (let i = 5; i >= 1; i--) {
    result[String(HUIDIG_WERKJAAR - i)] =
      Math.round((basis + (rnd() - 0.5) * spreiding) * 100) / 100;
  }
  result.Nu = Math.round((basis + (rnd() - 0.5) * spreiding) * 100) / 100;
  return result;
};

const maakLedenaantallen = (groepsnummer) => {
  const rnd = seeded(groepsnummer);
  const schaal = groepsnummer === GROEPEN.HOOFD.id ? 1 : 0.5;

  const takken = [
    {
      takNaam: "Kapoenen",
      soort: "60",
      leden: 24,
      leiding: 6,
      jaren: [2019, 2020],
    },
    {
      takNaam: "Kabouters en welpen",
      soort: "50",
      leden: 32,
      leiding: 7,
      jaren: [2016, 2017, 2018],
    },
    {
      takNaam: "Jonggivers",
      soort: "40",
      leden: 28,
      leiding: 6,
      jaren: [2013, 2014, 2015],
    },
    {
      takNaam: "Givers",
      soort: "30",
      leden: 26,
      leiding: 5,
      jaren: [2010, 2011, 2012],
    },
    { takNaam: "Jins", soort: "20", leden: 12, leiding: 3, jaren: [2009] },
  ];

  const takStatistieken = takken.map((tak) => {
    const aantalLeden = reeks(rnd, tak.leden * schaal, 8 * schaal);
    const aantalLeiding = reeks(rnd, tak.leiding * schaal, 3);
    return {
      takNaam: tak.takNaam,
      aantalLeden,
      aantalLeiding,
      percentageVrouwelijkeLeden: 40 + rnd() * 20,
      omkaderingscijfer: aantalLeiding.Nu
        ? aantalLeden.Nu / aantalLeiding.Nu
        : 0,
    };
  });

  const ledenPerLeeftijd = {};
  takken.forEach((tak) => {
    ledenPerLeeftijd[tak.soort] = {};
    tak.jaren.forEach((jaar) => {
      ledenPerLeeftijd[tak.soort][String(jaar)] = Math.round(
        ((tak.leden * schaal) / tak.jaren.length) * (0.7 + rnd() * 0.6)
      );
    });
  });
  ledenPerLeeftijd["10"] = {};
  for (let jaar = 1996; jaar <= 2008; jaar++) {
    ledenPerLeeftijd["10"][String(jaar)] = Math.round(rnd() * 5 * schaal);
  }

  const totaalLeden = reeks(rnd, 122 * schaal, 20 * schaal);
  const totaalLeiding = reeks(rnd, 27 * schaal, 6);
  const totaal = {};
  Object.keys(totaalLeden).forEach((k) => {
    totaal[k] = totaalLeden[k] + totaalLeiding[k];
  });

  const leidingservaring = {};
  [1, 2, 3, 4, 5, 6, 7, 8].forEach((jaar) => {
    leidingservaring[String(jaar)] = Math.max(
      1,
      Math.round((9 - jaar) * schaal * (0.5 + rnd()))
    );
  });

  const perLeeftijd = (basis) => {
    const result = {};
    for (let leeftijd = 6; leeftijd <= 25; leeftijd++) {
      result[String(leeftijd)] = Math.round(rnd() * basis * schaal);
    }
    return result;
  };
  const werkjaarLabel = (jaar) => jaar + "-" + (jaar + 1);
  const uitstroom = [3, 2, 1].map((i) => ({
    werkjaar: werkjaarLabel(HUIDIG_WERKJAAR - i),
    aantalPerLeeftijd: perLeeftijd(4),
  }));
  const instroom = [3, 2, 1, 0].map((i) => ({
    werkjaar: werkjaarLabel(HUIDIG_WERKJAAR - i),
    aantalPerLeeftijd: perLeeftijd(6),
  }));

  return {
    groepsnummer,
    takStatistieken,
    criteria: [
      { naam: "Aantal leden", waarden: totaalLeden, formaat: "%.0f" },
      { naam: "Aantal leiding", waarden: totaalLeiding, formaat: "%.0f" },
      {
        naam: "Percentage vrouwelijke leden",
        waarden: reeksKomma(rnd, 48, 10),
        formaat: "%.1f%%",
      },
      {
        naam: "Gemiddelde leeftijd leiding",
        waarden: reeksKomma(rnd, 20.5, 2),
        formaat: "%.1f",
      },
      {
        naam: "Gemiddelde leidingservaring (jaren)",
        waarden: reeksKomma(rnd, 3.2, 1.5),
        formaat: "%.2f",
      },
      {
        naam: "Omkaderingscijfer",
        waarden: reeksKomma(rnd, 4.5, 1),
        formaat: "%.1f",
      },
    ],
    groepsevolutie: [
      { naam: "Leden", aantalPersonen: totaalLeden },
      { naam: "Leiding", aantalPersonen: totaalLeiding },
      { naam: "Totaal", aantalPersonen: totaal },
    ],
    ledenPerLeeftijd,
    leidingservaring,
    uitstroom,
    instroom,
  };
};

// ---------------------------------------------------------------------------
// Activiteiten en aanwezigheden
// ---------------------------------------------------------------------------
const aantalDagen = (van, tot) =>
  Math.max(
    1,
    Math.round((new Date(tot).getTime() - new Date(van).getTime()) / 86400000) +
      1
  );

const datumVoorApi = (waarde) => {
  if (!waarde) return waarde;
  const d = new Date(waarde);
  if (isNaN(d.getTime())) return String(waarde);
  return d.toISOString().substring(0, 10);
};

const werkjaarVan = (datum) => {
  const d = new Date(datum);
  return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
};

const maakActiviteiten = () =>
  [
    {
      id: "mock-activiteit-0001",
      groep: GROEPEN.HOOFD.id,
      omschrijving: "Groepsweekend Hertogenwald",
      van: HUIDIG_WERKJAAR + "-10-17",
      tot: HUIDIG_WERKJAAR + "-10-19",
      prijs: 45,
    },
    {
      id: "mock-activiteit-0002",
      groep: GROEPEN.HOOFD.id,
      omschrijving: "Zomerkamp kapoenen",
      van: HUIDIG_WERKJAAR + 1 + "-07-21",
      tot: HUIDIG_WERKJAAR + 1 + "-07-26",
      prijs: 120,
    },
    {
      id: "mock-activiteit-0003",
      groep: GROEPEN.HOOFD.id,
      omschrijving: "Groot kamp givers",
      van: HUIDIG_WERKJAAR + "-07-15",
      tot: HUIDIG_WERKJAAR + "-07-25",
      prijs: 210.5,
    },
    {
      id: "mock-activiteit-0004",
      groep: GROEPEN.TWEEDE.id,
      omschrijving: "Paasweekend",
      van: HUIDIG_WERKJAAR + 1 + "-04-10",
      tot: HUIDIG_WERKJAAR + 1 + "-04-12",
      prijs: 35,
    },
  ].map((a) => ({ ...a, werkjaar: werkjaarVan(a.van) }));

const maakAanwezigheid = (activiteit, lid) => ({
  id: "mock-aanwezigheid-" + activiteit.id.slice(-4) + "-" + lid.id.slice(-4),
  activiteit: activiteit.id,
  lid: lid.id,
  lidId: lid.id,
  voornaam: lid.voornaam,
  naam: lid.achternaam,
  achternaam: lid.achternaam,
  prijs: activiteit.prijs,
  aantaldagen: aantalDagen(activiteit.van, activiteit.tot),
});

const maakAanwezigheden = (activiteiten) => {
  const result = [];
  activiteiten.forEach((activiteit, ai) => {
    LEDEN.filter((lid) => lid.groep === activiteit.groep)
      .filter((lid, li) => (li + ai) % 3 !== 0)
      .slice(0, 12)
      .forEach((lid) => result.push(maakAanwezigheid(activiteit, lid)));
  });
  return result;
};

// ---------------------------------------------------------------------------
// Gemeentes en websites
// ---------------------------------------------------------------------------
const GEMEENTES = [
  "1000 Brussel",
  "1020 Laken",
  "1500 Halle",
  "1700 Dilbeek",
  "1800 Vilvoorde",
  "2000 Antwerpen",
  "2018 Antwerpen",
  "2060 Antwerpen",
  "2100 Deurne",
  "2140 Borgerhout",
  "2200 Herentals",
  "2300 Turnhout",
  "2400 Mol",
  "2500 Lier",
  "2800 Mechelen",
  "2900 Schoten",
  "3000 Leuven",
  "3001 Heverlee",
  "3200 Aarschot",
  "3500 Hasselt",
  "3600 Genk",
  "3700 Tongeren",
  "3800 Sint-Truiden",
  "3900 Pelt",
  "8000 Brugge",
  "8200 Sint-Andries",
  "8400 Oostende",
  "8500 Kortrijk",
  "8800 Roeselare",
  "8900 Ieper",
  "9000 Gent",
  "9030 Mariakerke",
  "9050 Gentbrugge",
  "9100 Sint-Niklaas",
  "9200 Dendermonde",
  "9300 Aalst",
  "9400 Ninove",
  "9600 Ronse",
  "9700 Oudenaarde",
  "9800 Deinze",
  "9900 Eeklo",
];

const WEBSITES = [
  {
    naam: "Scouts en Gidsen Vlaanderen",
    url: "https://www.scoutsengidsenvlaanderen.be",
  },
  { naam: "Hopper", url: "https://www.hopper.be" },
  {
    naam: "Groepsadministratie",
    url: "https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin",
  },
  {
    naam: "Ledenadministratie wiki",
    url: "https://wiki.scoutsengidsenvlaanderen.be",
  },
];

// ---------------------------------------------------------------------------
// Minimaal geldig zip-bestand (stored, zonder compressie) zonder dependencies
// ---------------------------------------------------------------------------
const CRC_TABEL = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABEL[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const maakZip = (bestandsnaam, inhoud) => {
  const naam = Buffer.from(bestandsnaam, "utf8");
  const data = Buffer.from(inhoud, "utf8");
  const crc = crc32(data);

  const lokaal = Buffer.alloc(30);
  lokaal.writeUInt32LE(0x04034b50, 0);
  lokaal.writeUInt16LE(20, 4);
  lokaal.writeUInt16LE(0x0800, 6); // utf8-namen
  lokaal.writeUInt16LE(0, 8);
  lokaal.writeUInt32LE(0, 10);
  lokaal.writeUInt32LE(crc, 14);
  lokaal.writeUInt32LE(data.length, 18);
  lokaal.writeUInt32LE(data.length, 22);
  lokaal.writeUInt16LE(naam.length, 26);
  lokaal.writeUInt16LE(0, 28);

  const centraal = Buffer.alloc(46);
  centraal.writeUInt32LE(0x02014b50, 0);
  centraal.writeUInt16LE(20, 4);
  centraal.writeUInt16LE(20, 6);
  centraal.writeUInt16LE(0x0800, 8);
  centraal.writeUInt16LE(0, 10);
  centraal.writeUInt32LE(0, 12);
  centraal.writeUInt32LE(crc, 16);
  centraal.writeUInt32LE(data.length, 20);
  centraal.writeUInt32LE(data.length, 24);
  centraal.writeUInt16LE(naam.length, 28);
  centraal.writeUInt32LE(0, 30); // extra, comment
  centraal.writeUInt32LE(0, 34); // disk, intern attr
  centraal.writeUInt32LE(0, 38); // extern attr
  centraal.writeUInt32LE(0, 42); // offset lokale header

  const centraalOffset = lokaal.length + naam.length + data.length;
  const centraalGrootte = centraal.length + naam.length;
  const einde = Buffer.alloc(22);
  einde.writeUInt32LE(0x06054b50, 0);
  einde.writeUInt16LE(1, 8);
  einde.writeUInt16LE(1, 10);
  einde.writeUInt32LE(centraalGrootte, 12);
  einde.writeUInt32LE(centraalOffset, 16);

  return Buffer.concat([lokaal, naam, data, centraal, naam, einde]);
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
module.exports = function (router, db) {
  if (!db.functies) db.functies = maakFuncties();
  if (!db.groepen) db.groepen = maakGroepen();
  if (!db.activiteiten) db.activiteiten = maakActiviteiten();
  if (!db.aanwezigheden) db.aanwezigheden = maakAanwezigheden(db.activiteiten);

  let teller = 1000;
  const nieuwId = (prefix) => prefix + "-" + teller++;

  const fout = (res, status, titel, beschrijving) =>
    res.status(status).json({ titel, beschrijving: beschrijving || titel });

  const vindGroep = (nr) =>
    db.groepen.find((g) => g.groepsnummer === nr || g.id === nr);

  const groepseigenFunctiesVan = (nr) =>
    db.functies.filter((f) => f.type === "groep" && f.groepen.includes(nr));

  // De ingelogde VGA mag alleen de hoofdgroep aanpassen; de tweede groep is
  // leesbaar zodat je de uitgeschakelde velden in darkmode kan bekijken.
  const magWijzigen = (groep) => groep.groepsnummer === GROEPEN.HOOFD.id;

  const groepRespons = (groep) => {
    const nr = groep.groepsnummer;
    const links = [link("self", "/groep/" + nr, "GET")];
    if (magWijzigen(groep)) {
      links.push(link("self", "/groep/" + nr, "PATCH"));
      links.push(link("nieuwe groepseigen functie", "/functie", "POST"));
    }
    links.push(link("ledenaantallen", "/groep/" + nr + "/ledenaantallen"));
    return {
      ...JSON.parse(JSON.stringify(groep)),
      groepseigenFuncties: JSON.parse(
        JSON.stringify(groepseigenFunctiesVan(nr))
      ),
      links,
    };
  };

  // ---- Root ---------------------------------------------------------------
  router.get("/", (req, res) => {
    res.json({
      links: [
        link("self", "/", "GET"),
        link("profiel", "/lid/profiel", "GET"),
        link("groepen", "/groep", "GET"),
        link("functies", "/functie", "GET"),
        link("ledenlijst", "/ledenlijst", "GET"),
        link("zoeken", "/zoeken", "GET"),
        link("nieuw lid", "/lid", "POST"),
        link("aanvragen", "/lid/aanvraag", "GET"),
        link("filter delen", "/ledenlijst/filter", "POST"),
        link("activiteiten", "/activiteit", "GET"),
        link("websites", "/website", "GET"),
      ],
    });
  });

  // ---- Websites -----------------------------------------------------------
  router.get("/website", (req, res) => {
    res.json({ websites: WEBSITES });
  });

  // ---- GIS ----------------------------------------------------------------
  router.get("/gis/gemeente", (req, res) => {
    const term = String(req.query.term || "")
      .toLowerCase()
      .trim();
    const resultaat = term
      ? GEMEENTES.filter((g) => g.toLowerCase().includes(term))
      : GEMEENTES;
    res.json(resultaat.slice(0, 20));
  });

  // ---- Groepen ------------------------------------------------------------
  router.get("/groep", (req, res) => {
    res.json({
      groepen: db.groepen.map(groepRespons),
      links: [link("self", "/groep", "GET")],
    });
  });

  // Moet voor /groep/:id staan
  router.get("/groep/groepseigengegevens/:nummer", (req, res) => {
    const groep = vindGroep(req.params.nummer);
    if (!groep) return fout(res, 404, "Groep niet gevonden");
    res.json(JSON.parse(JSON.stringify(groep.groepseigenGegevens || [])));
  });

  router.get("/groep/:nr/ledenaantallen", (req, res) => {
    const groep = vindGroep(req.params.nr);
    if (!groep) return fout(res, 404, "Groep niet gevonden");
    res.json(maakLedenaantallen(groep.groepsnummer));
  });

  router.get("/groep/:nr/fiscaalattest", (req, res) => {
    const groep = vindGroep(req.params.nr);
    if (!groep) return fout(res, 404, "Groep niet gevonden");
    const bestandsnaam = "fiscaalattest-" + groep.groepsnummer + ".zip";
    const inhoud =
      "Mock fiscaal attest voor " +
      groep.naam +
      "\nParameters: " +
      JSON.stringify(req.query, null, 2) +
      "\n";
    res.set("Content-Type", "application/zip");
    res.set(
      "Content-Disposition",
      'attachment; filename="' + bestandsnaam + '"'
    );
    res.set("Access-Control-Expose-Headers", "Content-Disposition");
    res.send(maakZip("fiscaalattest-" + groep.groepsnummer + ".txt", inhoud));
  });

  router.get("/groep/:id", (req, res) => {
    const groep = vindGroep(req.params.id);
    if (!groep) return fout(res, 404, "Groep niet gevonden");
    res.json(groepRespons(groep));
  });

  const updateGroep = (req, res) => {
    const groep = vindGroep(req.params.id);
    if (!groep) return fout(res, 404, "Groep niet gevonden");
    if (!magWijzigen(groep)) {
      return fout(
        res,
        403,
        "Geen rechten",
        "Je hebt geen rechten om deze groep aan te passen."
      );
    }
    const body = { ...(req.body || {}) };
    AFGELEIDE_VELDEN.forEach((veld) => delete body[veld]);
    delete body.id;
    delete body.groepsnummer;
    if (
      "publiekInschrijven" in (req.body || {}) &&
      !("publiek-inschrijven" in body)
    ) {
      body["publiek-inschrijven"] = req.body.publiekInschrijven;
    }
    if (Array.isArray(body.groepseigenGegevens)) {
      body.groepseigenGegevens = body.groepseigenGegevens.map((geg, i) => {
        const kopie = { ...geg, sort: i };
        if (!kopie.id) kopie.id = nieuwId("mock-geg");
        delete kopie.status;
        if (kopie.type !== "lijst") kopie.keuzes = [];
        else kopie.keuzes = (kopie.keuzes || []).filter((k) => k);
        return kopie;
      });
    }
    // De frontend verwijdert instantie uit de body als die leeg is
    if (!("instantie" in body)) body.instantie = null;
    Object.assign(groep, body);
    res.status(200).json(groepRespons(groep));
  };
  router.patch("/groep/:id", updateGroep);
  router.put("/groep/:id", updateGroep);

  // ---- Functies -----------------------------------------------------------
  router.get("/functie", (req, res) => {
    const nr = req.query.groep;
    const functies = nr
      ? db.functies.filter((f) => f.groepen.includes(nr))
      : db.functies;
    res.json({
      functies: JSON.parse(JSON.stringify(functies)),
      links: [link("self", "/functie", "GET")],
    });
  });

  router.get("/functie/:id", (req, res) => {
    const functie = db.functies.find((f) => f.id === req.params.id);
    if (!functie) return fout(res, 404, "Functie niet gevonden");
    res.json(functie);
  });

  router.post("/functie", (req, res) => {
    const body = req.body || {};
    const beschrijving = (body.beschrijving || "").trim();
    const groepen = Array.isArray(body.groepen) ? body.groepen : [];
    if (!beschrijving) {
      return fout(res, 400, "Functie", "Geef de functie een beschrijving.");
    }
    if (!groepen.length || !vindGroep(groepen[0])) {
      return fout(res, 400, "Functie", "Onbekende groep voor deze functie.");
    }
    const bestaat = db.functies.some(
      (f) =>
        f.type === "groep" &&
        f.groepen[0] === groepen[0] &&
        f.beschrijving.toLowerCase() === beschrijving.toLowerCase()
    );
    if (bestaat) {
      return fout(
        res,
        400,
        "Functie bestaat al",
        "Er bestaat al een groepseigen functie met de naam " +
          beschrijving +
          "."
      );
    }
    const functie = groepseigenFunctie(
      nieuwId("mock-functie-groepseigen"),
      beschrijving,
      groepen[0]
    );
    db.functies.push(functie);
    res.status(201).json(functie);
  });

  router.patch("/functie/:id", (req, res) => {
    const functie = db.functies.find((f) => f.id === req.params.id);
    if (!functie) return fout(res, 404, "Functie niet gevonden");
    if (functie.type !== "groep") {
      return fout(
        res,
        403,
        "Functie",
        "Verbondsfuncties kan je niet aanpassen."
      );
    }
    const body = req.body || {};
    if (typeof body.beschrijving === "string" && body.beschrijving.trim()) {
      functie.beschrijving = body.beschrijving.trim();
    }
    res.status(200).json(functie);
  });

  router.delete("/functie/:id", (req, res) => {
    const index = db.functies.findIndex((f) => f.id === req.params.id);
    if (index === -1) return fout(res, 404, "Functie niet gevonden");
    if (db.functies[index].type !== "groep") {
      return fout(
        res,
        403,
        "Functie",
        "Verbondsfuncties kan je niet verwijderen."
      );
    }
    db.functies.splice(index, 1);
    res.status(204).end();
  });

  // ---- Activiteiten -------------------------------------------------------
  const aanwezighedenVan = (activiteitId) =>
    db.aanwezigheden.filter((a) => a.activiteit === activiteitId);

  const activiteitRespons = (a) => ({
    ...a,
    aantalAanwezigheden: aanwezighedenVan(a.id).length,
    links: [
      link("self", "/activiteit/" + a.id, "GET"),
      link("self", "/activiteit", "PATCH"),
      link("self", "/activiteit/" + a.id, "DELETE"),
    ],
  });

  const normaliseerActiviteit = (body) => {
    const a = {};
    if (body.omschrijving !== undefined) a.omschrijving = body.omschrijving;
    if (body.van !== undefined) a.van = datumVoorApi(body.van);
    if (body.tot !== undefined) a.tot = datumVoorApi(body.tot);
    if (body.prijs !== undefined) a.prijs = Number(body.prijs) || 0;
    if (body.groep !== undefined) {
      a.groep =
        typeof body.groep === "object" && body.groep
          ? body.groep.groepsnummer || body.groep.id
          : body.groep;
    }
    return a;
  };

  router.get("/activiteit", (req, res) => {
    const nr = req.query.groep;
    const lijst = db.activiteiten
      .filter((a) => !nr || a.groep === nr)
      .sort((a, b) => (a.van < b.van ? 1 : -1))
      .map(activiteitRespons);
    res.json({ activiteiten: lijst });
  });

  router.get("/activiteit/:id", (req, res) => {
    const a = db.activiteiten.find((x) => x.id === req.params.id);
    if (!a) return fout(res, 404, "Activiteit niet gevonden");
    res.json(activiteitRespons(a));
  });

  router.post("/activiteit", (req, res) => {
    const a = normaliseerActiviteit(req.body || {});
    if (!a.van || !a.tot) {
      return fout(
        res,
        400,
        "Activiteit",
        "Start- en einddatum zijn verplicht."
      );
    }
    if (!a.prijs || a.prijs <= 0) {
      return fout(res, 400, "Activiteit", "De prijs moet groter dan 0 zijn.");
    }
    a.id = nieuwId("mock-activiteit");
    a.groep = a.groep || GROEPEN.HOOFD.id;
    a.omschrijving = a.omschrijving || "";
    a.werkjaar = werkjaarVan(a.van);
    db.activiteiten.push(a);
    res.status(200).json(activiteitRespons(a));
  });

  const pasActiviteitAan = (req, res) => {
    const body = req.body || {};
    const id = req.params.id || body.id;
    const a = db.activiteiten.find((x) => x.id === id);
    if (!a) return fout(res, 404, "Activiteit niet gevonden");
    Object.assign(a, normaliseerActiviteit(body));
    a.werkjaar = werkjaarVan(a.van);
    res.status(200).json(activiteitRespons(a));
  };
  router.patch("/activiteit", pasActiviteitAan);
  router.patch("/activiteit/:id", pasActiviteitAan);

  router.delete("/activiteit/:id", (req, res) => {
    const index = db.activiteiten.findIndex((x) => x.id === req.params.id);
    if (index === -1) return fout(res, 404, "Activiteit niet gevonden");
    db.activiteiten.splice(index, 1);
    db.aanwezigheden = db.aanwezigheden.filter(
      (a) => a.activiteit !== req.params.id
    );
    res.status(204).end();
  });

  const voegLidToe = (activiteit, lidId, extra = {}) => {
    const bestaand = db.aanwezigheden.find(
      (a) => a.activiteit === activiteit.id && a.lid === lidId
    );
    if (bestaand) return { status: "bestaand", aanwezigheid: bestaand };
    const lid =
      LEDEN.find((l) => l.id === lidId) ||
      (PROFIEL.id === lidId ? PROFIEL : null);
    if (!lid) return { status: "onbekend" };
    const aanwezigheid = {
      ...maakAanwezigheid(activiteit, lid),
      id: nieuwId("mock-aanwezigheid"),
    };
    if (extra.prijs !== undefined) aanwezigheid.prijs = Number(extra.prijs);
    if (extra.aantaldagen !== undefined)
      aanwezigheid.aantaldagen = Number(extra.aantaldagen);
    db.aanwezigheden.push(aanwezigheid);
    return { status: "nieuw", aanwezigheid };
  };

  router.post("/activiteit/:id/lijst", (req, res) => {
    const a = db.activiteiten.find((x) => x.id === req.params.id);
    if (!a) return fout(res, 404, "Activiteit niet gevonden");
    const ids = Array.isArray(req.body) ? req.body : req.body?.leden || [];
    const resultaten = ids.map((id) =>
      voegLidToe(a, typeof id === "object" ? id.id : id)
    );
    res.status(200).json({
      gelukt: resultaten.filter((r) => r.status === "nieuw").length,
      mislukt: resultaten.filter((r) => r.status === "onbekend").length,
      aanwezigen: aanwezighedenVan(a.id),
    });
  });

  router.post("/activiteit/:id", (req, res) => {
    const a = db.activiteiten.find((x) => x.id === req.params.id);
    if (!a) return fout(res, 404, "Activiteit niet gevonden");
    const body = req.body || {};
    const lidId = body.lid || body.lidId || body.id;
    const r = voegLidToe(a, lidId, body);
    if (r.status === "onbekend") return fout(res, 404, "Lid niet gevonden");
    res.status(200).json(r.aanwezigheid);
  });

  // ---- Aanwezigheden ------------------------------------------------------
  const aanwezighedenRespons = (activiteitId) => {
    const aanwezigen = aanwezighedenVan(activiteitId).map((a) => ({ ...a }));
    return {
      aanwezigen,
      leden: aanwezigen,
      aantal: aanwezigen.length,
      totaal: aanwezigen.length,
    };
  };

  router.get("/aanwezigheid/geregistreerdeleden/:activiteitId", (req, res) => {
    if (!db.activiteiten.some((a) => a.id === req.params.activiteitId)) {
      return fout(res, 404, "Activiteit niet gevonden");
    }
    res.json(aanwezighedenRespons(req.params.activiteitId));
  });

  router.get(
    "/aanwezigheid/ledenOphalenVoorActiviteit/:activiteitId",
    (req, res) => {
      const a = db.activiteiten.find((x) => x.id === req.params.activiteitId);
      if (!a) return fout(res, 404, "Activiteit niet gevonden");
      const geregistreerd = aanwezighedenVan(a.id).map((x) => x.lid);
      const kandidaten = LEDEN.filter((l) => l.groep === a.groep).map((l) => ({
        id: l.id,
        lid: l.id,
        voornaam: l.voornaam,
        naam: l.achternaam,
        achternaam: l.achternaam,
        geregistreerd: geregistreerd.includes(l.id),
      }));
      res.json({ ...aanwezighedenRespons(a.id), leden: kandidaten });
    }
  );

  router.get("/aanwezigheid/:activiteitId", (req, res) => {
    if (!db.activiteiten.some((a) => a.id === req.params.activiteitId)) {
      return fout(res, 404, "Activiteit niet gevonden");
    }
    res.json(aanwezighedenRespons(req.params.activiteitId));
  });

  router.patch("/aanwezigheid/:id", (req, res) => {
    const a = db.aanwezigheden.find((x) => x.id === req.params.id);
    if (!a) return fout(res, 404, "Aanwezigheid niet gevonden");
    const body = req.body || {};
    if (body.prijs !== undefined && body.prijs !== null)
      a.prijs = Number(body.prijs);
    if (body.aantaldagen !== undefined && body.aantaldagen !== null)
      a.aantaldagen = Number(body.aantaldagen);
    res.status(200).json(a);
  });

  router.delete("/aanwezigheid/:id", (req, res) => {
    const index = db.aanwezigheden.findIndex((x) => x.id === req.params.id);
    if (index === -1) return fout(res, 404, "Aanwezigheid niet gevonden");
    db.aanwezigheden.splice(index, 1);
    res.status(204).end();
  });
};
