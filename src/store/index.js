import {createStore} from "vuex";
import createPersistedState from "vuex-persistedstate";
import RestService from "@/services/api/RestService";
import DateUtil from "@/services/dates/DateUtil";

export default createStore({
    plugins: [createPersistedState()],
    state: {
        naam: "",
        gebruikersnaam: "",
        token: "",
        profiel: null,
            indexedGroepen: {},
        groepen: {},
        groepenLaden: false,
        functiesLaden: false,
        functies: [],
        kolommen: [],
        mailSjabloon: null,
    },
    mutations: {
        setNaam(state, naam) {
            state.naam = naam;
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
        setFunctiesLaden(state, functiesLaden) {
            state.functiesLaden = functiesLaden;
        },
        setKolommen(state, kolommen) {
            state.kolommen = kolommen;
        },
        setMailSjabloon(state, mailSjabloon) {
            if (mailSjabloon){
                state.mailSjabloon = {};
                state.mailSjabloon = Object.assign({}, mailSjabloon);
                state.mailSjabloon.naam = mailSjabloon.naam + " gewijzigd maar nog niet opgeslagen op " + DateUtil.formatteerDatum(new Date());
            } else {
                state.mailSjabloon = null;
            }
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
            return state.functies.find(functie => functie.id === id);
        },
        groepByNummer: (state) => (index) => {
            return state.groepen.find(groep => groep.id === index);
        },
        kolommen(state) {
            return state.kolommen;
        },
        mailSjabloon(state) {
            return state.mailSjabloon;
        }
    },
    actions: {
        getGroepen({commit}) {
            let groepen = [];
            commit("setGroepenLaden", true)
            return RestService.getGroepen()
                .then(response => {
                    commit("setGroepen", response.data.groepen);
                    response.data.groepen.forEach(groep => {
                        groepen[groep.id] = groep;
                    })
                    commit("setIndexedGroepen", groepen);
                    commit("setGroepenLaden", false);
                })
        },
        getFuncties({commit}){
            commit("setFunctiesLaden", true)
            return RestService.getFuncties()
                .then(response => {
                    commit("setFuncties", response.data.functies);
                    commit("setFunctiesLaden", false)

                })
        },
        getKolommen({commit}){
            return RestService.getKolomType()
                .then(response => {
                    commit("setKolommen", response.data.kolommen)
                })
        }
    },
    modules: {},
});
