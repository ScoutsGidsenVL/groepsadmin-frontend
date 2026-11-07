import { ref } from "vue";

/*
 * Licht of donker thema.
 *
 * - De keuze van de gebruiker staat in localStorage onder `ga-thema`
 *   ("licht" of "donker"). Zonder keuze volgt de app het systeem.
 * - Het actieve thema staat als `data-theme` op <html>. Onze eigen SCSS
 *   leest dat attribuut via de CSS-variabelen in _thema.scss.
 * - Het PrimeVue-thema wisselt mee via <link id="primevue-thema"> in
 *   public/index.html. Een inline script daar zet het juiste thema al voor
 *   de eerste render, zodat de pagina niet eerst wit oplicht.
 */
const OPSLAG_SLEUTEL = "ga-thema";
const PRIMEVUE_THEMAS = {
  licht: "saga-blue",
  donker: "arya-green",
};

const systeemDonker = window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

function leesKeuze() {
  try {
    const keuze = localStorage.getItem(OPSLAG_SLEUTEL);
    return keuze === "licht" || keuze === "donker" ? keuze : null;
  } catch (e) {
    return null;
  }
}

function bepaalThema() {
  return (
    leesKeuze() || (systeemDonker && systeemDonker.matches ? "donker" : "licht")
  );
}

const thema = ref(bepaalThema());

function pasToe(nieuwThema) {
  thema.value = nieuwThema;
  document.documentElement.setAttribute("data-theme", nieuwThema);
  const link = document.getElementById("primevue-thema");
  if (link) {
    const href = link
      .getAttribute("href")
      .replace(
        /themes\/[^/]+\/theme\.css/,
        `themes/${PRIMEVUE_THEMAS[nieuwThema]}/theme.css`
      );
    if (href !== link.getAttribute("href")) {
      link.setAttribute("href", href);
    }
  }
}

// Volg het systeem zolang de gebruiker zelf niets koos
if (systeemDonker) {
  const opSysteemWijziging = (e) => {
    if (!leesKeuze()) pasToe(e.matches ? "donker" : "licht");
  };
  if (systeemDonker.addEventListener) {
    systeemDonker.addEventListener("change", opSysteemWijziging);
  } else if (systeemDonker.addListener) {
    systeemDonker.addListener(opSysteemWijziging);
  }
}

pasToe(thema.value);

export default {
  thema,

  isDonker() {
    return thema.value === "donker";
  },

  wissel() {
    const nieuwThema = thema.value === "donker" ? "licht" : "donker";
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, nieuwThema);
    } catch (e) {
      // Zonder opslag werkt de wissel enkel voor deze sessie
    }
    pasToe(nieuwThema);
  },
};
