import apiClient from "@/services/api/ApiClient";

const baseUrl = "/groepsadmin/rest-ga/";

export default {

    getWebsites() {
        return apiClient().get(baseUrl + "website");
    },

    zoeken(zoekTerm) {
        return apiClient().get(baseUrl + "zoeken", {params: {query: zoekTerm}});
    },

    async getLid(id) {
        return apiClient().get(baseUrl + "lid/" + id,);
    },

    zoekGemeente(zoekTerm) {
        return apiClient().get(baseUrl + "gis/gemeente", {params: {term: zoekTerm}});
    },

    zoekStraat(zoekTerm, postcode) {
        return apiClient().get(baseUrl + "gis/straat", {params: {term: zoekTerm, postcode: postcode}});
    },

    getGroepen() {
        return apiClient().get(baseUrl + "groep");
    },

    getGroepOpId(id) {
        return apiClient().get(baseUrl + "groep/" + id,);
    },

    getFuncties() {
        return apiClient().get(baseUrl + "functie");
    },

    getMailSjablonen() {
        return apiClient().get(baseUrl + "sjabloon/mail");
    },

    getMailSjabloonOpId(id) {
        return apiClient().get(baseUrl + "sjabloon/mail/" +id);
    },

    verwijderSjabloon(id) {
        return apiClient().delete(baseUrl + "sjabloon/mail/" +id)
    },

    updateSjabloon(id, sjabloon) {
        return apiClient().patch(baseUrl + "sjabloon/mail/" +id, sjabloon)
    },

    saveSjabloon(sjabloon) {
        return apiClient().post(baseUrl + "sjabloon/mail", sjabloon)
    },
    getKolomType() {
        return apiClient().get(baseUrl + "ledenlijst/kolom-type");
    },

    postFuncties(data) {
        return apiClient().post(baseUrl + "functie", data);
    },

    getFunctieOpId(id) {
        return apiClient().get(baseUrl + "functie/" + id,);
    },

    verwijderFunctie(id) {
        return apiClient().delete(baseUrl + "functie/" + id,);
    },

    pasFunctieAan(id) {
        return apiClient().patch(baseUrl + "functie/" + id,);
    },

    getIndividueleSteekkaart(id) {
        return apiClient().get(baseUrl + "lid/" + id + "/steekkaart")
    },

    saveIndividueleSteekkaart(id, gegevens) {
        return apiClient().patch(baseUrl + "lid/" + id + "/steekkaart", gegevens)
    }

};
