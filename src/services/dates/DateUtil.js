import moment from "moment";

export default {
  formatGeboortedatum(geboortedatum) {
    return (
      geboortedatum.substr(8, 2) +
      "/" +
      geboortedatum.substr(5, 2) +
      "/" +
      geboortedatum.substr(0, 4)
    );
  },

  formatteerDatum(datum) {
    return moment(String(datum)).format("DD/MM/YYYY");
  },

  formatteerDatumVolgensDatetime(datum) {
    return moment(String(datum)).toISOString(true);
  },

  formatteerDatumVoorApi(datum) {
    return this.parseDatum(datum).format("YYYY-MM-DD");
  },

  isGeldigeDatum(datum) {
    return this.parseDatum(datum).isValid();
  },

  // datum is hier soms een Date-object (bv. van een kalender), soms een
  // "DD/MM/YYYY"-string (bv. een opgeslagen filterwaarde); beide vormen
  // moeten correct geparsed worden, i.p.v. via het onbetrouwbare
  // moment(String(datum)) dat enkel ISO/RFC2822-strings herkent
  parseDatum(datum) {
    return moment(datum, ["DD/MM/YYYY", moment.ISO_8601], true);
  },
};
