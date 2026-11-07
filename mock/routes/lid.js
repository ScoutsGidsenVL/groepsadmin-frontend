/* global BigInt */
/*
 * Mockroutes voor een individueel lid: profiel, lid ophalen en bewaren,
 * nieuw lid, individuele steekkaart, fiscaal attest, lidkaart en PDF's.
 *
 * Bij opstart bouwen we de volledige lidobjecten op en bewaren we ze in
 * db.leden (object op id), zodat andere routes ze kunnen lezen.
 */
const { GROEPEN, PROFIEL_ID, PROFIEL, FUNCTIES, LEDEN } = require("../shared");

const BASE = "/groepsadmin/rest-ga";

// Leesbare namen als fallback wanneer de store de functie niet kent
const FUNCTIE_NAMEN = {
  [FUNCTIES.VGA]: "Verantwoordelijke groepsleiding",
  [FUNCTIES.FV]: "Financieel verantwoordelijke",
  [FUNCTIES.AVGA]: "Adjunct verantwoordelijke groepsleiding",
  [FUNCTIES.KAPOENEN]: "Kapoen",
  [FUNCTIES.WELPEN]: "Welp",
  [FUNCTIES.JONGGIVERS]: "Jonggiver",
  [FUNCTIES.GIVERS]: "Giver",
  [FUNCTIES.JINS]: "Jin",
  [FUNCTIES.LEIDING]: "Leiding",
  [FUNCTIES.GROEPSEIGEN_KOOKPLOEG]: "Kookploeg",
};

const GEMEENTEN = [
  { postcode: "9000", gemeente: "Gent", straat: "Kortrijksesteenweg" },
  { postcode: "3000", gemeente: "Leuven", straat: "Naamsestraat" },
  { postcode: "2800", gemeente: "Mechelen", straat: "Bruul" },
  { postcode: "8000", gemeente: "Brugge", straat: "Langestraat" },
  { postcode: "3500", gemeente: "Hasselt", straat: "Kuringersteenweg" },
  { postcode: "9300", gemeente: "Aalst", straat: "Gentsesteenweg" },
  { postcode: "8500", gemeente: "Kortrijk", straat: "Doorniksestraat" },
  { postcode: "2300", gemeente: "Turnhout", straat: "Gasthuisstraat" },
  { postcode: "2018", gemeente: "Antwerpen", straat: "Lange Kievitstraat" },
  { postcode: "9100", gemeente: "Sint-Niklaas", straat: "Parklaan" },
];

const OUDER_VOORNAMEN = [
  ["Sofie", "Pieter"],
  ["Katrien", "Tom"],
  ["Els", "Bart"],
  ["An", "Koen"],
  ["Veerle", "Steven"],
  ["Griet", "Joris"],
  ["Inge", "Wim"],
  ["Liesbeth", "Dirk"],
];

// ---------- hulpfuncties ----------

const clone = (o) => JSON.parse(JSON.stringify(o));
const datum = (d) => `${d}T00:00:00.000+02:00`;

// "+32 470 12 305 0" wordt "+32 470 12 30 50"
function formatGsm(ruw) {
  const cijfers = String(ruw).replace(/\D/g, "").replace(/^32/, "");
  return `+32 ${cijfers.slice(0, 3)} ${cijfers.slice(3, 5)} ${cijfers.slice(
    5,
    7
  )} ${cijfers.slice(7, 9)}`;
}

// Geldig Belgisch IBAN op basis van een volgnummer
function iban(nr) {
  const basis = BigInt(735000000 + nr) * 10n; // 10 cijfers
  let controle = Number(basis % 97n);
  if (controle === 0) controle = 97;
  const bban =
    basis.toString().padStart(10, "0") + String(controle).padStart(2, "0");
  // BE = 11 14, plus 00
  const check = 98 - Number(BigInt(bban + "111400") % 97n);
  const iban = "BE" + String(check).padStart(2, "0") + bban;
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

// Geldig rijksregisternummer (modulo 97) voor een geboortedatum
function rijksregisternummer(geboortedatum, volgnr) {
  const [j, m, d] = geboortedatum.split("-");
  const basisStr = j.slice(2) + m + d + String(volgnr).padStart(3, "0");
  let basis = parseInt(basisStr, 10);
  if (parseInt(j, 10) >= 2000) basis += 2000000000;
  const controle = String(97 - (basis % 97)).padStart(2, "0");
  return `${basisStr.slice(0, 2)}.${basisStr.slice(2, 4)}.${basisStr.slice(
    4,
    6
  )}-${basisStr.slice(6, 9)}.${controle}`;
}

function functie(functieId, groep, begin, einde) {
  return {
    functie: functieId,
    groep,
    begin: datum(begin),
    einde: einde ? datum(einde) : null,
    omschrijving: FUNCTIE_NAMEN[functieId] || "Functie",
    code: "",
    links: [],
  };
}

function links(id) {
  const href = `${BASE}/lid/${id}`;
  return [
    { rel: "self", href, method: "GET" },
    {
      rel: "self",
      href,
      method: "PATCH",
      secties: [
        "vgagegevens",
        "persoonsgegevens",
        "adressen",
        "contacten",
        "groepseigen",
        "functies." + GROEPEN.HOOFD.id,
        "functies." + GROEPEN.TWEEDE.id,
        // hasPermission() op het profiel zoekt ook deze secties
        "ledenlijst",
        "groepen",
        "aanvragen",
      ],
    },
    { rel: "steekkaart", href: `${href}/steekkaart`, method: "GET" },
    { rel: "steekkaart", href: `${href}/steekkaart`, method: "PATCH" },
  ];
}

// ---------- groepseigen gegevens ----------

function groepseigenSchema(groep) {
  const p = groep === GROEPEN.HOOFD.id ? "mock-geg-hoofd" : "mock-geg-tweede";
  if (groep === GROEPEN.HOOFD.id) {
    return [
      {
        id: `${p}-totem`,
        type: "tekst",
        label: "Totem",
        beschrijving: "Totem en voortotem, als je die al hebt",
        kanLidWijzigen: true,
        kanGebruikerWijzigen: true,
        sort: 0,
      },
      {
        id: `${p}-foto`,
        type: "vinkje",
        label: "Toestemming foto's",
        beschrijving: "Foto's van activiteiten mogen op onze website",
        kanLidWijzigen: true,
        kanGebruikerWijzigen: true,
        sort: 1,
      },
      {
        id: `${p}-tshirt`,
        type: "lijst",
        label: "Maat T-shirt",
        beschrijving: "Voor het groeps-T-shirt",
        keuzes: ["XS", "S", "M", "L", "XL"],
        kanLidWijzigen: true,
        kanGebruikerWijzigen: true,
        sort: 2,
      },
      {
        id: `${p}-opmerking`,
        type: "tekst_meerdere_lijnen",
        label: "Opmerkingen leiding",
        beschrijving: "Enkel zichtbaar voor de leiding",
        kanLidWijzigen: false,
        kanGebruikerWijzigen: false,
        sort: 3,
      },
    ];
  }
  return [
    {
      id: `${p}-fiets`,
      type: "vinkje",
      label: "Komt met de fiets",
      beschrijving: "",
      kanLidWijzigen: true,
      kanGebruikerWijzigen: true,
      sort: 0,
    },
  ];
}

function groepseigenWaarden(groep, i) {
  if (groep === GROEPEN.HOOFD.id) {
    const totems = [
      "Bevlogen Bever",
      "Gulle Gems",
      "Speelse Otter",
      "Trouwe Das",
      "",
    ];
    return {
      "mock-geg-hoofd-totem": totems[i % totems.length],
      "mock-geg-hoofd-foto": i % 3 === 0 ? "false" : "true",
      "mock-geg-hoofd-tshirt": ["S", "M", "L"][i % 3],
      "mock-geg-hoofd-opmerking":
        i % 4 === 0 ? "Komt soms later toe op zaterdag." : "",
    };
  }
  return { "mock-geg-tweede-fiets": i % 2 === 0 ? "true" : "false" };
}

function groepseigenVelden(groepen, i) {
  const res = {};
  groepen.forEach((g) => {
    res[g] = {
      schema: groepseigenSchema(g),
      waarden: groepseigenWaarden(g, i),
    };
  });
  return res;
}

// ---------- individuele steekkaart ----------

const STEEKKAART_SCHEMA = [
  {
    id: "sk-groep-contact",
    type: "groep",
    label: "Contactpersonen bij noodgevallen",
    beschrijving:
      "Wie mogen we bellen als we jou of je ouders <b>niet</b> bereiken?",
    sort: 0,
  },
  {
    id: "sk-contact-naam",
    type: "tekst",
    label: "Naam:",
    beschrijving: "",
    verplicht: true,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 1,
  },
  {
    id: "sk-contact-tel",
    type: "tekst",
    label: "Telefoon/gsm:",
    beschrijving: "",
    verplicht: true,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 2,
  },
  {
    id: "sk-groep-medisch",
    type: "groep",
    label: "Medische gegevens",
    beschrijving:
      "Deze gegevens blijven vertrouwelijk en zijn enkel bedoeld voor de leiding.",
    sort: 3,
  },
  {
    id: "sk-huisarts",
    type: "tekst",
    label: "Huisarts (naam en telefoon):",
    beschrijving: "",
    verplicht: false,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 4,
  },
  {
    id: "sk-bloedgroep",
    type: "lijst",
    label: "Bloedgroep:",
    beschrijving: "Laat leeg als je het niet weet",
    keuzes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Onbekend"],
    verplicht: false,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 5,
  },
  {
    id: "sk-tetanus",
    type: "vinkje",
    label: "Ingeënt tegen tetanus",
    beschrijving: "",
    verplicht: false,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 6,
  },
  {
    id: "sk-allergie",
    type: "tekst_meerdere_lijnen",
    label: "Allergieën en aandoeningen:",
    beschrijving: "Bijvoorbeeld astma, hooikoorts, notenallergie",
    verplicht: false,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 7,
  },
  {
    id: "sk-groep-toestemming",
    type: "groep",
    label: "Toestemming",
    beschrijving: "Geef aan waarvoor de leiding toestemming heeft.",
    sort: 8,
  },
  {
    id: "sk-medicatie",
    type: "vinkje",
    label: "De leiding mag pijnstillers geven bij hoofdpijn of koorts",
    beschrijving: "",
    verplicht: false,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 9,
  },
  {
    id: "sk-zwemmen",
    type: "lijst",
    label: "Kan zwemmen:",
    beschrijving: "",
    keuzes: ["Ja", "Een beetje", "Nee"],
    verplicht: true,
    kanLidWijzigen: true,
    kanGebruikerWijzigen: true,
    sort: 10,
  },
];

function steekkaartWaarden(lid, i) {
  const ouder = (lid.contacten && lid.contacten[0]) || null;
  return {
    "sk-contact-naam": ouder
      ? `${ouder.voornaam} ${ouder.achternaam}`
      : "Mieke Mock",
    "sk-contact-tel": ouder && ouder.gsm ? ouder.gsm : "+32 478 55 66 77",
    "sk-huisarts": "Dr. Vermeulen, 09 222 33 44",
    "sk-bloedgroep": ["A+", "O+", "B-", "Onbekend"][i % 4],
    "sk-tetanus": "true",
    "sk-allergie": i % 3 === 0 ? "Hooikoorts in de lente." : "",
    "sk-medicatie": i % 2 === 0 ? "true" : "false",
    "sk-zwemmen": ["Ja", "Een beetje", "Ja"][i % 3],
  };
}

// ---------- minimale PDF ----------

function maakPdf(titel, regels) {
  const esc = (s) => String(s).replace(/[\\()]/g, (c) => "\\" + c);
  const tekst = [titel].concat(regels || []);
  let stream = "BT /F1 18 Tf 72 770 Td (" + esc(tekst[0]) + ") Tj /F1 11 Tf";
  tekst.slice(1).forEach((r) => {
    stream += " 0 -18 Td (" + esc(r) + ") Tj";
  });
  stream += " ET";
  const objecten = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(
      stream,
      "latin1"
    )} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objecten.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objecten.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += String(o).padStart(10, "0") + " 00000 n \n";
  });
  pdf += `trailer\n<< /Size ${
    objecten.length + 1
  } /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

function stuurPdf(res, bestandsnaam, titel, regels) {
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `attachment; filename="${bestandsnaam}"`);
  res.send(maakPdf(titel, regels));
}

// ---------- lidobjecten opbouwen ----------

function adres(id, i, postadres) {
  const g = GEMEENTEN[i % GEMEENTEN.length];
  return {
    id,
    land: "BE",
    postcode: g.postcode,
    gemeente: g.gemeente,
    straat: g.straat,
    nummer: String(10 + ((i * 7) % 180)),
    bus: i % 5 === 0 ? "B" : "",
    telefoon: "",
    postadres,
    omschrijving: "",
    status: "normaal",
    positie: { latitude: 51.05, longitude: 3.72 },
  };
}

function bouwLid(basis, i, opties) {
  const eigen = !!opties.eigenProfiel;
  const geboortejaar = parseInt(basis.geboortedatum.slice(0, 4), 10);
  const minderjarig = 2026 - geboortejaar < 18;
  const adresId = `${basis.id}-adres-1`;
  const adressen = [adres(adresId, i, true)];
  if (i % 7 === 3) {
    // Kot- of tweede verblijfsadres
    adressen.push(adres(`${basis.id}-adres-2`, i + 4, false));
  }

  const contacten = [];
  if (minderjarig) {
    const [moeder, vader] = OUDER_VOORNAMEN[i % OUDER_VOORNAMEN.length];
    [
      { rol: "moeder", voornaam: moeder },
      { rol: "vader", voornaam: vader },
    ].forEach((c, ci) => {
      const contact = {
        id: `${basis.id}-contact-${ci + 1}`,
        rol: c.rol,
        voornaam: c.voornaam,
        achternaam: basis.achternaam,
        email: `${c.voornaam.toLowerCase()}.${basis.achternaam
          .toLowerCase()
          .replace(/\s/g, "")}@voorbeeld.be`,
        gsm: `+32 475 ${String(10 + i).padStart(2, "0")} ${ci}${i % 10} 1${ci}`,
        adres: adresId,
        lidtenlaste: ci === 0,
        rijksregisternummeringevuld: ci === 0,
      };
      if (eigen) contact.rijksregisternummer = "";
      contacten.push(contact);
    });
  }

  const geboortedatum = basis.geboortedatum;
  const lid = {
    id: basis.id,
    gebruikersnaam: eigen
      ? "robinmock"
      : i % 4 === 0
      ? ""
      : `${basis.voornaam.toLowerCase()}${basis.achternaam
          .toLowerCase()
          .replace(/\s/g, "")}`,
    email: basis.email,
    // Ook bovenaan, voor schermen die een lid uit de store lezen (mail, etiketten)
    voornaam: basis.voornaam,
    achternaam: basis.achternaam,
    volledigenaam: `${basis.voornaam} ${basis.achternaam}`,
    vgagegevens: {
      voornaam: basis.voornaam,
      achternaam: basis.achternaam,
      geboortedatum,
      beperking: i % 11 === 4,
      verhoogdekinderbijslag: i % 6 === 2,
      verminderdlidgeld: i % 8 === 5,
      individueleSteekkaartDatumAangepast:
        i % 3 === 0 ? null : datum("2026-0" + ((i % 9) + 1) + "-15"),
    },
    persoonsgegevens: {
      geslacht: basis.geslacht,
      gsm: formatGsm(basis.gsm),
      rekeningnummer: i % 3 === 1 ? "" : iban(i),
      geboortedatum,
      rijksregisternummeringevuld: i % 2 === 0,
    },
    verbondsgegevens: {
      lidnummer: basis.lidnummer,
      klantnummer: "K" + basis.lidnummer,
      lidgeldbetaald: i % 9 !== 7,
      lidkaartafgedrukt: i % 5 !== 1,
    },
    // Toont de waarschuwingsbalk "niet verzekerd" op het lidscherm
    isActiefVvksmLid: i % 9 !== 7,
    nietVerzekerdReden:
      i % 9 !== 7
        ? ""
        : "Dit lid is niet verzekerd: het lidgeld is nog niet betaald aan Scouts en Gidsen Vlaanderen.",
    adressen,
    contacten,
    functies: opties.functies,
    groepseigenVelden: groepseigenVelden(opties.groepen, i),
    links: links(basis.id),
  };
  if (eigen) {
    lid.persoonsgegevens.rijksregisternummer = rijksregisternummer(
      geboortedatum,
      123
    );
  }
  return lid;
}

function bouwAlleLeden() {
  const leden = {};

  // Profiel: VGA in de hoofdgroep, vroeger leiding en lid in een andere groep
  leden[PROFIEL_ID] = bouwLid(PROFIEL, 0, {
    eigenProfiel: true,
    groepen: [GROEPEN.HOOFD.id],
    functies: [
      functie(FUNCTIES.VGA, GROEPEN.HOOFD.id, "2021-09-01"),
      functie(FUNCTIES.LEIDING, GROEPEN.HOOFD.id, "2015-09-01", "2021-08-31"),
      functie(FUNCTIES.GIVERS, GROEPEN.TWEEDE.id, "2009-09-01", "2012-08-31"),
    ],
  });
  leden[PROFIEL_ID].persoonsgegevens.rekeningnummer = iban(99);
  leden[PROFIEL_ID].persoonsgegevens.rijksregisternummeringevuld = true;

  LEDEN.forEach((basis, i) => {
    const functies = [functie(basis.functie, basis.groep, "2025-09-01")];
    if (basis.functie === FUNCTIES.LEIDING) {
      functies[0].begin = datum("2022-09-01");
      functies.push(
        functie(FUNCTIES.JINS, basis.groep, "2021-09-01", "2022-08-31")
      );
      if (i % 12 === 11 && basis.groep === GROEPEN.HOOFD.id) {
        functies.push(
          functie(FUNCTIES.GROEPSEIGEN_KOOKPLOEG, basis.groep, "2024-09-01")
        );
      }
    } else if (basis.functie !== FUNCTIES.KAPOENEN) {
      // Vorige tak als historiek
      functies.push(
        functie(FUNCTIES.KAPOENEN, basis.groep, "2020-09-01", "2022-08-31")
      );
    }
    leden[basis.id] = bouwLid(basis, i + 1, {
      groepen: [basis.groep],
      functies,
    });
  });
  return leden;
}

// ---------- bewaren (PATCH / POST) ----------

let teller = 0;
const nieuwId = (prefix) => `${prefix}-${Date.now().toString(36)}-${++teller}`;

function normaliseerDatum(d) {
  if (!d) return d;
  if (typeof d === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [dd, mm, jjjj] = d.split("/");
    return `${jjjj}-${mm}-${dd}`;
  }
  return String(d).slice(0, 10);
}

function zetAdressen(lid, adressen) {
  const idMap = {};
  lid.adressen = adressen.map((a) => {
    const kopie = Object.assign(
      { land: "BE", bus: "", telefoon: "", omschrijving: "", postadres: false },
      a
    );
    if (!kopie.id || String(kopie.id).startsWith("tempadres")) {
      const id = nieuwId(`${lid.id}-adres`);
      if (kopie.id) idMap[kopie.id] = id;
      kopie.id = id;
    }
    return kopie;
  });
  if (lid.adressen.length && !lid.adressen.some((a) => a.postadres)) {
    lid.adressen[0].postadres = true;
  }
  return idMap;
}

function zetContacten(lid, contacten, idMap) {
  lid.contacten = contacten.map((c) => {
    const kopie = Object.assign(
      { voornaam: "", achternaam: "", email: "", gsm: "", lidtenlaste: false },
      c
    );
    if (kopie.adres && typeof kopie.adres === "object")
      kopie.adres = kopie.adres.id;
    if (idMap[kopie.adres]) kopie.adres = idMap[kopie.adres];
    if (!kopie.adres && lid.adressen[0]) kopie.adres = lid.adressen[0].id;
    if (!kopie.id || /^\d+$/.test(String(kopie.id)))
      kopie.id = nieuwId(`${lid.id}-contact`);
    kopie.rijksregisternummeringevuld =
      !!kopie.rijksregisternummer || !!kopie.rijksregisternummeringevuld;
    delete kopie.adressen;
    return kopie;
  });
}

function zetFuncties(lid, functies) {
  functies.forEach((f) => {
    const begin = f.begin
      ? new Date(f.begin).toISOString()
      : new Date().toISOString();
    const zelfde = (b) => b.functie === f.functie && b.groep === f.groep;
    const tijd = (d) => new Date(d).getTime();
    // Eerst exact op begindatum, anders de lopende functie
    const bestaand =
      lid.functies.find(
        (b) => zelfde(b) && f.begin && tijd(b.begin) === tijd(f.begin)
      ) ||
      (f.temp === "tijdelijk"
        ? lid.functies.find((b) => zelfde(b) && !b.einde)
        : null);
    if (bestaand) {
      if (f.einde) bestaand.einde = new Date(f.einde).toISOString();
    } else if (f.temp === "tijdelijk" || !f.einde) {
      lid.functies.push({
        functie: f.functie,
        groep: f.groep,
        begin,
        einde: f.einde ? new Date(f.einde).toISOString() : null,
        omschrijving: FUNCTIE_NAMEN[f.functie] || "Functie",
        code: "",
        links: [],
      });
    }
  });
}

function zetGroepseigen(lid, velden) {
  Object.keys(velden || {}).forEach((groep) => {
    if (!lid.groepseigenVelden[groep]) {
      lid.groepseigenVelden[groep] = {
        schema: groepseigenSchema(groep),
        waarden: {},
      };
    }
    Object.assign(
      lid.groepseigenVelden[groep].waarden,
      (velden[groep] && velden[groep].waarden) || {}
    );
  });
}

function pasToe(lid, body) {
  if (body.vgagegevens) {
    Object.assign(lid.vgagegevens, body.vgagegevens);
    lid.vgagegevens.geboortedatum = normaliseerDatum(
      lid.vgagegevens.geboortedatum
    );
    lid.voornaam = lid.vgagegevens.voornaam;
    lid.achternaam = lid.vgagegevens.achternaam;
    lid.volledigenaam = `${lid.voornaam} ${lid.achternaam}`;
    lid.persoonsgegevens.geboortedatum = lid.vgagegevens.geboortedatum;
  }
  if (body.persoonsgegevens) {
    Object.assign(lid.persoonsgegevens, body.persoonsgegevens);
    lid.persoonsgegevens.rijksregisternummeringevuld =
      !!lid.persoonsgegevens.rijksregisternummer ||
      !!lid.persoonsgegevens.rijksregisternummeringevuld;
  }
  if (body.email !== undefined) lid.email = body.email;
  let idMap = {};
  if (Array.isArray(body.adressen)) idMap = zetAdressen(lid, body.adressen);
  if (Array.isArray(body.contacten)) zetContacten(lid, body.contacten, idMap);
  if (Array.isArray(body.functies)) zetFuncties(lid, body.functies);
  if (body.groepseigenVelden) zetGroepseigen(lid, body.groepseigenVelden);
}

function fout(res, status, titel, beschrijving) {
  res.status(status).json({ titel, beschrijving, status });
}

// ---------- routes ----------

module.exports = function (router, db) {
  db.leden = db.leden || {};
  Object.assign(db.leden, bouwAlleLeden());
  db.profielId = PROFIEL_ID;

  db.steekkaarten = db.steekkaarten || {};
  Object.keys(db.leden).forEach((id, i) => {
    db.steekkaarten[id] = steekkaartWaarden(db.leden[id], i);
  });

  const zoekLid = (id) => db.leden[id === "profiel" ? PROFIEL_ID : id];

  router.get("/lid/profiel", (req, res) => {
    res.json(db.leden[PROFIEL_ID]);
  });

  router.get("/lid/:id/steekkaart", (req, res) => {
    const lid = zoekLid(req.params.id);
    if (!lid) return fout(res, 404, "Niet gevonden", "Dit lid bestaat niet.");
    res.json({
      gegevens: {
        schema: clone(STEEKKAART_SCHEMA),
        waarden: db.steekkaarten[lid.id] || {},
      },
      links: [
        {
          rel: "self",
          href: `${BASE}/lid/${lid.id}/steekkaart`,
          method: "PATCH",
        },
      ],
    });
  });

  router.patch("/lid/:id/steekkaart", (req, res) => {
    const lid = zoekLid(req.params.id);
    if (!lid) return fout(res, 404, "Niet gevonden", "Dit lid bestaat niet.");
    const waarden =
      (req.body && req.body.gegevens && req.body.gegevens.waarden) || {};
    db.steekkaarten[lid.id] = Object.assign(
      {},
      db.steekkaarten[lid.id],
      waarden
    );
    lid.vgagegevens.individueleSteekkaartDatumAangepast = new Date().toISOString();
    res.json({
      gegevens: {
        schema: clone(STEEKKAART_SCHEMA),
        waarden: db.steekkaarten[lid.id],
      },
    });
  });

  router.get("/lid/:id", (req, res, next) => {
    if (req.params.id === "aanvraag") return next();
    const lid = zoekLid(req.params.id);
    if (!lid)
      return fout(
        res,
        404,
        "Niet gevonden",
        "Dit lid bestaat niet of je hebt er geen toegang toe."
      );
    res.json(lid);
  });

  router.patch("/lid/:id", (req, res, next) => {
    if (req.params.id === "aanvraag") return next();
    const lid = zoekLid(req.params.id);
    if (!lid) return fout(res, 404, "Niet gevonden", "Dit lid bestaat niet.");
    pasToe(lid, req.body || {});
    res.json(lid);
  });

  router.post("/lid", (req, res) => {
    const body = req.body || {};
    const vga = body.vgagegevens || {};
    if (!vga.voornaam || !vga.achternaam) {
      return fout(
        res,
        400,
        "Validatie",
        "Voornaam en achternaam zijn verplicht."
      );
    }
    const nr = Object.keys(db.leden).length + 1;
    const id = nieuwId("mock-lid-nieuw");
    const groep =
      (body.functies && body.functies[0] && body.functies[0].groep) ||
      GROEPEN.HOOFD.id;
    const lid = bouwLid(
      {
        id,
        lidnummer: `200${String(nr).padStart(4, "0")}`,
        voornaam: vga.voornaam,
        achternaam: vga.achternaam,
        geboortedatum: normaliseerDatum(vga.geboortedatum) || "2018-01-01",
        geslacht:
          (body.persoonsgegevens && body.persoonsgegevens.geslacht) || "vrouw",
        email: body.email || "",
        gsm: "",
        groep,
      },
      nr,
      { groepen: [groep], functies: [] }
    );
    lid.gebruikersnaam = "";
    lid.persoonsgegevens.gsm = "";
    lid.persoonsgegevens.rekeningnummer = "";
    lid.adressen = [];
    lid.contacten = [];
    lid.vgagegevens.individueleSteekkaartDatumAangepast = null;
    lid.isActiefVvksmLid = true;
    lid.nietVerzekerdReden = "";
    Object.keys(lid.groepseigenVelden).forEach(
      (g) => (lid.groepseigenVelden[g].waarden = {})
    );
    db.leden[id] = lid;
    pasToe(lid, body);
    if (body.opmerkingen) lid.opmerkingen = body.opmerkingen;
    db.steekkaarten[id] = {};
    res.status(201).json(lid);
  });

  // Fiscaal attest kinderopvang
  router.get("/attest/beschikbaar", (req, res) => {
    res.json(true);
  });

  router.get("/attest/download", (req, res) => {
    const lid = zoekLid(req.query.lidId) || db.leden[PROFIEL_ID];
    stuurPdf(res, "FA_kinderopvang.pdf", "Fiscaal attest kinderopvang", [
      `${lid.vgagegevens.voornaam} ${lid.vgagegevens.achternaam}`,
      "Mockdocument voor lokale ontwikkeling",
    ]);
  });

  // Lijst met namen van leden waarvoor geen lidkaart beschikbaar is. Leeg = alles ok.
  router.post("/lidkaart/beschikbaarheid", (req, res) => {
    res.json([]);
  });

  const namen = (body) => {
    const ids = (body && (body.lidIds || body)) || [];
    return (Array.isArray(ids) ? ids : [])
      .map((id) => db.leden[id])
      .filter(Boolean)
      .map(
        (l) =>
          `${l.vgagegevens.voornaam} ${l.vgagegevens.achternaam} (${l.verbondsgegevens.lidnummer})`
      );
  };

  router.post("/lidkaart", (req, res) => {
    stuurPdf(
      res,
      "lidkaart.pdf",
      "Lidkaart Scouts en Gidsen Vlaanderen",
      namen(req.body)
    );
  });

  router.post("/ledenlijst/steekkaart", (req, res) => {
    stuurPdf(
      res,
      "steekkaarten.pdf",
      "Individuele steekkaarten",
      namen(req.body)
    );
  });
};
