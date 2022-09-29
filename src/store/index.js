import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import RestService from "@/services/api/RestService";
import DateUtil from "@/services/dates/DateUtil";

export default createStore({
  plugins: [createPersistedState()],
  state: {
    naam: "",
    gebruikersnaam: "",
    kandidaatLid: "",
    token: "",
    profiel: null,
    indexedGroepen: {},
    groepen: {},
    broerZusLid: {},
    inactieveGroepen: {},
    groepenLaden: false,
    functiesLaden: false,
    functies: [],
    kolommen: [],
    mailSjabloon: null,
    etiketSjabloon: null,
    huidigeFilter: null,
    goedTeKeurenLid: null,
    geselecteerdeLeden: [],
    lidIds: [],
    links: [],
  },
  mutations: {
    setNaam(state, naam) {
      state.naam = naam;
    },
    setNaamKandidaatLid(state, naam) {
      state.kandidaatLid = naam;
    },
    setGebruikersnaam(state, gebruikersnaam) {
      state.gebruikersnaam = gebruikersnaam;
    },
    setToken(state, token) {
      state.token = token;
    },
    setProfiel(state, profiel) {
      state.profiel = profiel;
    },
    setGroepen(state, groepen) {
      state.groepen = groepen;
    },
    setIndexedGroepen(state, indexedGroepen) {
      state.indexedGroepen = indexedGroepen;
    },
    setGroepenLaden(state, groepenLaden) {
      state.groepenLaden = groepenLaden;
    },
    setFuncties(state, functies) {
      state.functies = functies;
    },
    setBroerZusLid(state, lid) {
      state.broerZusLid = lid;
    },
    setFunctiesLaden(state, functiesLaden) {
      state.functiesLaden = functiesLaden;
    },
    setKolommen(state, kolommen) {
      state.kolommen = kolommen;
    },
    setHuidigeFilter(state, huidigeFilter) {
      state.huidigeFilter = huidigeFilter;
    },
    setLidIds(state, lidIds) {
      state.lidIds = lidIds;
    },
    setGoedTeKeurenLid(state, lid) {
      state.goedTeKeurenLid = lid;
    },
    setMailSjabloon(state, mailSjabloon) {
      if (mailSjabloon) {
        state.mailSjabloon = {};
        state.mailSjabloon = Object.assign({}, mailSjabloon);
        state.mailSjabloon.naam =
          mailSjabloon.naam +
          " gewijzigd maar nog niet opgeslagen op " +
          DateUtil.formatteerDatum(new Date());
      } else {
        state.mailSjabloon = null;
      }
    },
    setEtiketSjabloon(state, etiketSjabloon) {
      if (etiketSjabloon) {
        state.etiketSjabloon = {};
        state.etiketSjabloon = Object.assign({}, etiketSjabloon);
        if (!state.etiketSjabloon.naam.includes("gewijzigd maar nog niet opgeslagen")) {
          state.etiketSjabloon.naam =
              etiketSjabloon.naam +
              " gewijzigd maar nog niet opgeslagen op " +
              DateUtil.formatteerDatum(new Date());
        } else {
          state.etiketSjabloon.naam = state.etiketSjabloon.naam.substring(0 , state.etiketSjabloon.naam.length - 10) + DateUtil.formatteerDatum(new Date());
        }
      } else {
        state.etiketSjabloon = null;
      }
    },
    setGeselecteerdeLeden(state, geselecteerdeLeden) {
      state.geselecteerdeLeden = geselecteerdeLeden;
    },
    setLinks(state, links) {
      state.links = links;
    }
  },
  getters: {
    naam(state) {
      return state.naam;
    },
    token(state) {
      return state.token;
    },
    profiel(state) {
      return state.profiel;
    },
    groepenLaden(state) {
      return state.groepenLaden;
    },
    groepen(state) {
      return state.groepen;
    },
    indexedGroepen(state) {
      return state.indexedGroepen;
    },
    functies(state) {
      return state.functies;
    },
    functiesLaden(state) {
      return state.functiesLaden;
    },
    functieById: (state) => (id) => {
      return state.functies.find((functie) => functie.id === id);
    },
    groepByNummer: (state) => (index) => {
      return state.groepen.find((groep) => groep.id === index);
    },
    inactieveGroepByNummer: (state) => (index) => {
      return state.inactieveGroepen[index];
    },
    kolommen(state) {
      return state.kolommen;
    },
    mailSjabloon(state) {
      return state.mailSjabloon;
    },
    etiketSjabloon(state) {
      return state.etiketSjabloon;
    },
    huidigeFilter(state) {
      return state.huidigeFilter;
    },
    geselecteerdeLeden(state) {
      return state.geselecteerdeLeden;
    },
    broerZusLid(state) {
      return state.broerZusLid;
    },
    lidIds(state) {
      return state.lidIds;
    },
    goedTeKeurenLid(state) {
      return state.goedTeKeurenLid;
    },
    links(state) {
      return state.links;
    },
    inactieveGroepen(state) {
      return state.inactieveGroepen;
    },
    kandidaatLid(state) {
      return state.kandidaatLid;
    }
  },
  actions: {
    getGroepen({ commit }) {
      let groepen = [];
      commit("setGroepenLaden", true);
      return RestService.getGroepen().then((response) => {
        if (response.data.groepen) {
          commit("setGroepen", response.data.groepen);
          response.data.groepen.forEach((groep) => {
            groepen[groep.id] = groep;
          });
          commit("setIndexedGroepen", groepen);
          commit("setGroepenLaden", false);
        }
      });
    },
    getFuncties({ commit }) {
      commit("setFunctiesLaden", true);
      return RestService.getFuncties().then((response) => {
        if (response.data.functies) {
          commit("setFuncties", response.data.functies);
          commit("setFunctiesLaden", false);
        }
      });
    },
    getKolommen({ commit }) {
      return RestService.getKolomType().then((response) => {
        if (response.data.kolommen) {
          commit("setKolommen", response.data.kolommen);
        }
      });
    },
    getLinks({ commit }) {
      return RestService.root().then((response) => {
        if (response.data.links) {
          commit("setLinks", response.data.links);
        }
      })
    },
    getProfiel({ commit }) {
      return RestService.getLid("profiel").then((response) => {
        commit("setProfiel", response.data);
      })
    },
    addGroep({commit, getters}, nummer) {
      RestService.getGroepOpNummer(nummer)
          .then(res => {
            getters.inactieveGroepen[nummer] = res.data;
            commit("setGroepenLaden", false);
          })
    }
  },
  modules: {},
});
