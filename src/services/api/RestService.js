import apiClient from "@/services/api/ApiClient";
import apiConfig from "@/services/api/ApiConfig";
import apiClientCsv from "@/services/api/ApiClientCsv";
import apiClientPdf from "@/services/api/ApiClientPdf";
import apiClientMail from "@/services/api/ApiClientMail";
import axios from "axios";

const backendUrl = apiConfig().host;
let baseUrl = "";
if (process.env.NODE_ENV === "production") {
  baseUrl = backendUrl + "/groepsadmin/rest-ga/";
} else {
  baseUrl = "/groepsadmin/rest-ga/";
}

export default {
  getWebsites() {
    return apiClient().get(baseUrl + "website");
  },

  zoeken(zoekTerm) {
    return apiClient().get(baseUrl + "zoeken", { params: { query: zoekTerm } });
  },

  async getLid(id) {
    if (id) {
      return apiClient().get(baseUrl + "lid/" + id);
    }
  },

  zoekGemeente(zoekTerm) {
    return apiClient().get(baseUrl + "gis/gemeente", {
      params: { term: zoekTerm },
    });
  },

  zoekStraat(zoekTerm, postcode) {
    return apiClient().get(baseUrl + "gis/straat", {
      params: { term: zoekTerm, postcode: postcode },
    });
  },

  getGroepen() {
    return apiClient().get(baseUrl + "groep");
  },

  getGroepOpId(id) {
    return apiClient().get(baseUrl + "groep/" + id);
  },

  getGroepOpNummer(nummer) {
    return apiClient().get(baseUrl + "groep/" + nummer);
  },

  getFuncties() {
    return apiClient().get(baseUrl + "functie");
  },

  getAanvragen() {
    return apiClient().get(baseUrl + "lid/aanvraag");
  },

  getLeden(offset) {
    return apiClient().get(baseUrl + "ledenlijst?offset=" + offset);
  },

  getLedenCsv(offset, lidIds) {
    return apiClientCsv().post(baseUrl + "ledenlijst?offset=" + offset, lidIds);
  },

  getLedenPdf(offset, lidIds) {
    return apiClientPdf().post(baseUrl + "ledenlijst?offset=" + offset, lidIds);
  },

  getLedenSteekkaartPdf(lidIds) {
    return apiClientPdf().post(baseUrl + "ledenlijst/steekkaart", lidIds);
  },

  getHuidigeFilter() {
    return apiClient().get(baseUrl + "ledenlijst/filter/huidige");
  },

  patchHuidigeFilter(filter) {
    return apiClient().patch(baseUrl + "ledenlijst/filter/huidige", filter);
  },

  saveFilter(filter) {
    return apiClient().post(baseUrl + "ledenlijst/filter", filter)
  },

  getFilters() {
    return apiClient().get(baseUrl + "ledenlijst/filter");
  },

  getFilterOpId(id) {
    return apiClient().get(baseUrl + "ledenlijst/filter/" + id);
  },

  patchFilterOpId(filter, id) {
    return apiClient().patch(baseUrl + "ledenlijst/filter/" + id, filter);
  },

  getSjablonen(type) {
    return apiClient().get(baseUrl + "sjabloon/" + type);
  },

  getSjabloonOpId(type, id) {
    return apiClient().get(baseUrl + "sjabloon/" + type + "/" + id);
  },

  verwijderSjabloon(type, id) {
    return apiClient().delete(baseUrl + "sjabloon/" + type + "/" + id);
  },

  updateSjabloon(type, id, sjabloon) {
    return apiClient().patch(baseUrl + "sjabloon/" + type + "/" + id, sjabloon);
  },

  saveSjabloon(type, sjabloon) {
    return apiClient().post(baseUrl + "sjabloon/" + type, sjabloon);
  },

  printEtiketten(offset, data) {
    return apiClientPdf().post(
      baseUrl + "ledenlijst/etiket?offset=" + offset,
      data
    );
  },

  verstuurMail(bevestiging, formData) {
    return apiClientMail().post(
      baseUrl + "ledenlijst/mail?bevestig=" + bevestiging,
      formData
    );
  },

  saveEtiketSjabloon(sjabloon) {
    return apiClient().post(baseUrl + "sjabloon/etiket/dummyid", sjabloon);
  },

  saveNieuwLid(lid) {
    return apiClient().post(baseUrl + "lid", lid + "?bevestig=" + true);
  },

  getKolomType() {
    return apiClient().get(baseUrl + "ledenlijst/kolom-type");
  },

  postFuncties(data) {
    return apiClient().post(baseUrl + "functie", data);
  },

  getFunctieOpId(id) {
    return apiClient().get(baseUrl + "functie/" + id);
  },

  verwijderFunctie(id) {
    return apiClient().delete(baseUrl + "functie/" + id + "?bevestig=" + true);
  },

  getLedenAantallen(groep) {
    return apiClient().get(baseUrl + "groep/" + groep + "/ledenaantallen");
  },

  pasFunctieAan(id) {
    return apiClient().patch(baseUrl + "functie/" + id);
  },

  updateGroep(groep) {
    return apiClient().patch(baseUrl + "groep/" + groep.groepsnummer + "?bevestig=true&groepsnummer=" + groep.groepsnummer, groep);
  },

  getIndividueleSteekkaart(id) {
    return apiClient().get(baseUrl + "lid/" + id + "/steekkaart");
  },

  saveIndividueleSteekkaart(id, gegevens) {
    return apiClient().patch(baseUrl + "lid/" + id + "/steekkaart", gegevens);
  },

  verwijderAanvraag(link) {
    return axios.delete(link.href);
  },

  root() {
    return apiClient().get(baseUrl);
  },

  updateLid(id, lid) {
    return apiClient().patch(baseUrl + "lid/" + id + "?bevestig=" + true, lid)
  },

  getCommunicatieProducten() {
    return apiClient().get(baseUrl + "communicatieproduct")
  },

  getCommunicatieProductAbonnementen() {
    return apiClient().get(baseUrl + "/communicatieproduct/abonnementen")
  },

  saveCommunicatieProductAbonnement(payload) {
    return apiClient().post(baseUrl + "communicatieproduct/abonnementen", payload)
  },

  getGroepseigenGegevens(groepsnummer) {
    return apiClient().get(baseUrl + "groep/groepseigengegevens/" + groepsnummer);
  },

  saveAanvraag(aanvraag) {
    return apiClient().post(baseUrl + "lid/aanvraag", aanvraag);
  },
};
