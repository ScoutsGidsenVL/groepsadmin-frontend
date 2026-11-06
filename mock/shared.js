/*
 * Gedeelde sleutels voor alle mockroutes. Gebruik deze id's overal zodat
 * groepen, functies en leden naar elkaar verwijzen.
 */
const GROEPEN = {
  HOOFD: { id: "X9999G", naam: "Scouts en Gidsen Mockdorp" },
  TWEEDE: { id: "X9999M", naam: "Scouts Testegem" },
};

const PROFIEL_ID = "mock-profiel-0001";

// Echte id's uit src/services/functies/SpecialeFuncties.js
const FUNCTIES = {
  VGA: "d5f75b320b812440010b812555970393",
  FV: "d5f75b320b812440010b812553d5032e",
  AVGA: "8a95af9385ad9b880185c035ee740010",
  KAPOENEN: "mock-functie-kapoenen",
  WELPEN: "mock-functie-welpen",
  JONGGIVERS: "mock-functie-jonggivers",
  GIVERS: "mock-functie-givers",
  JINS: "mock-functie-jins",
  LEIDING: "mock-functie-leiding",
  GROEPSEIGEN_KOOKPLOEG: "mock-functie-groepseigen-kookploeg",
};

const voornamen = [
  "Lotte",
  "Mats",
  "Noor",
  "Wout",
  "Fien",
  "Lars",
  "Ella",
  "Jules",
  "Mila",
  "Seppe",
  "Lina",
  "Rune",
  "Hanne",
  "Arthur",
  "Zoë",
  "Tibo",
  "Nina",
  "Warre",
  "Lien",
  "Kobe",
  "Amber",
  "Finn",
  "Jana",
  "Stan",
  "Elise",
  "Mauro",
  "Lore",
  "Ward",
  "Ines",
  "Bram",
];
const achternamen = [
  "Peeters",
  "Janssens",
  "Maes",
  "Jacobs",
  "Mertens",
  "Willems",
  "Claes",
  "Goossens",
  "Wouters",
  "De Smet",
  "Dubois",
  "Lambert",
  "Hermans",
  "Aerts",
  "Desmet",
  "Van den Broeck",
  "Verstraete",
  "Coppens",
  "Michiels",
  "Pauwels",
];

const takken = [
  { functie: FUNCTIES.KAPOENEN, geboortejaar: 2019 },
  { functie: FUNCTIES.WELPEN, geboortejaar: 2016 },
  { functie: FUNCTIES.JONGGIVERS, geboortejaar: 2013 },
  { functie: FUNCTIES.GIVERS, geboortejaar: 2011 },
  { functie: FUNCTIES.JINS, geboortejaar: 2009 },
  { functie: FUNCTIES.LEIDING, geboortejaar: 2003 },
];

// 30 basisleden. Elke route bouwt hier de volledige vorm op die zij nodig heeft.
const LEDEN = voornamen.map((voornaam, i) => {
  const tak = takken[i % takken.length];
  const nr = String(i + 1).padStart(4, "0");
  return {
    id: `mock-lid-${nr}`,
    lidnummer: `100${nr}`,
    voornaam,
    achternaam: achternamen[i % achternamen.length],
    geboortedatum: `${tak.geboortejaar}-0${(i % 9) + 1}-1${i % 9}`,
    geslacht: i % 2 === 0 ? "vrouw" : "man",
    email: `${voornaam.toLowerCase()}@voorbeeld.be`,
    gsm: `+32 470 12 3${String(i).padStart(2, "0")} 0`,
    groep: i % 10 === 9 ? GROEPEN.TWEEDE.id : GROEPEN.HOOFD.id,
    functie: tak.functie,
  };
});

// De ingelogde gebruiker: groepsleiding (VGA) in de hoofdgroep
const PROFIEL = {
  id: PROFIEL_ID,
  lidnummer: "1000000",
  voornaam: "Robin",
  achternaam: "Mock",
  geboortedatum: "1995-04-12",
  geslacht: "andere",
  email: "robin.mock@voorbeeld.be",
  gsm: "+32 470 00 00 00",
  groep: GROEPEN.HOOFD.id,
  functie: FUNCTIES.VGA,
};

module.exports = { GROEPEN, PROFIEL_ID, PROFIEL, FUNCTIES, LEDEN };
