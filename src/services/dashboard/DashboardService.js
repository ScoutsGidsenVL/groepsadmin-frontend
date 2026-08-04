import { reactive } from "@vue/reactivity";
import { computed, onMounted } from "vue";
import RestService from "@/services/api/RestService";
import rechtenService from "@/services/rechten/rechtenService";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  dashboardSpace() {
    const store = useStore();
    const state = reactive({
      showLoader: false,
      gebruiker: null,
      snelNaarItems: [],
      menuItems: [
        {
          label: "Mijn gegevens",
          condition: true,
          icon: "far fa-user",
          link: "Profiel",
          internal: true,
        },
        {
          label: "Mijn individuele steekkaart",
          condition: true,
          icon: "far fa-notes-medical",
          link: "IndividueleSteekkaart",
          internal: true,
        },
        {
          label: "Ledenlijst",
          condition: "ledenlijst",
          icon: "far fa-users",
          link: "Ledenlijst",
          internal: true,
        },
        {
          label: "Groep",
          condition: "groepen",
          icon: "far fa-cogs",
          link: "Groepsinstellingen",
          internal: true,
        },
        {
          label: "Ledenaantallen",
          condition: "groepen",
          icon: "far fa-chart-area",
          link: "Ledenaantallen",
          internal: true,
        },
        {
          label: "Lidaanvragen",
          condition: "aanvragen",
          icon: "far fa-address-book",
          link: "Aanvragen",
          internal: true,
        },
        {
          label: "Betalende activiteiten",
          condition: "ledenlijst",
          icon: "fas fa-campground",
          link: "Activiteiten",
          internal: true,
        },
      ],
    });

    onMounted(() => {
      RestService.getWebsites().then((res) => {
        state.snelNaarItems = res.data.websites;
      });
    });

    const dashboardItems = computed(() => {
      return state.menuItems.filter((obj) => {
        if (obj.condition === "groepen") {
          return rechtenService.hasAccessToGroepen();
        }
        return (
          obj.condition === true ||
          rechtenService.hasPermission(obj.condition) ||
          rechtenService.hasAccess(obj.condition)
        );
      });
    });

    const naam = computed(() => {
      if (store.getters.profiel) {
        return store.getters.profiel.vgagegevens.voornaam;
      } else {
        return "";
      }
    });

    const toonWelkomstpopup = computed(() => store.getters.justRegistered);

    const welkomstheader = computed(() => {
      const profiel = store.getters.profiel;
      return profiel ? `Welkom ${profiel.vgagegevens.voornaam}!` : "Welkom!";
    });

    const welkomstboodschap = computed(() => {
      const profiel = store.getters.profiel;
      if (!profiel) {
        return "";
      }
      const gsmRuw = profiel.persoonsgegevens && profiel.persoonsgegevens.gsm;
      const gsm = gsmRuw || "-";
      const heeftGeenContactgegevens = !profiel.email && !gsmRuw;
      const waarschuwing = heeftGeenContactgegevens
        ? `<p class="welkom-dialog-waarschuwing"><i class="fas fa-exclamation-triangle"></i>Opgelet: er is geen e-mailadres en geen gsm-nummer gekend. Vul minstens één van beide aan.</p>`
        : "";
      return (
        `<p>Je bent nu geregistreerd op de Groepsadministratie van Scouts & gidsen Vlaanderen. Hier kan je jouw <span class="welkom-dialog-nowrap"><i class="far fa-user welkom-dialog-tekst-icoon"></i><span class="welkom-dialog-link">persoonlijke gegevens</span></span> en
          <span class="welkom-dialog-nowrap"><i class="fal fa-notes-medical welkom-dialog-tekst-icoon"></i><a href="https://www.scoutsengidsenvlaanderen.be/ouders/praktisch/inschrijven/individuele-steekkaart" target="_blank" class="welkom-dialog-link">individuele steekkaart</a></span> bekijken en aanpassen.</p>` +
        `<p>Je account is aangemaakt met volgende gegevens:</p>` +
        `<ul>` +
        `<li>Gebruikersnaam: <b>${store.getters.gebruikersnaam}</b></li>` +
        `<li>E-mail: <b>${profiel.email || "-"}</b></li>` +
        `<li>GSM: <b>${gsm}</b></li>` +
        `</ul>` +
        waarschuwing +
        `<p>Controleer zeker je E-mail (en GSM-nummer) zodat we je kunnen bereiken en je de toegang tot jouw account niet verliest. ` +
        `Meer informatie vind je <a href="https://scoutsgidsenvl.sharepoint.com/:w:/s/Ledenadministratie-site/IQCKJiayJKfqVZsugQ6YZ-wAAc7w2s7BZppO09b9u9kiS-w" target="_blank">hier</a>.</p>`
      );
    });

    const sluitWelkomstpopup = () => {
      store.commit("setJustRegistered", false);
    };

    return {
      state,
      dashboardItems,
      naam,
      toonWelkomstpopup,
      welkomstheader,
      welkomstboodschap,
      sluitWelkomstpopup,
    };
  },

  dashBoardBlockSpace(props) {
    const router = useRouter();
    const store = useStore();

    const goto = (link) => {
      top.window.onbeforeunload = null;
      if (!props.internal) {
        window.location.href = link;
      } else if (link === "Profiel") {
        router.push({ name: "Lid", params: { id: "profiel" } });
      } else if (link === "IndividueleSteekkaart") {
        router.push({ name: link, params: { id: store.getters.profiel.id } });
      } else {
        router.push({ name: link });
      }
    };

    return {
      goto,
    };
  },
};
