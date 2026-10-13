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

  // Het werkjaar loopt van 1 september tot en met 31 augustus.
  // Het jaartal hieronder is het jaartal van de septembermaand waarin het huidige werkjaar start.
  huidigWerkjaarStartjaar() {
    const nu = moment();
    return nu.month() >= 8 ? nu.year() : nu.year() - 1;
  },

  isMinstensXJarigInHuidigWerkjaar(geboortedatum, leeftijd) {
    if (!geboortedatum) {
      return false;
    }
    const geboortejaar = moment(geboortedatum, "DD/MM/YYYY").year();
    return this.huidigWerkjaarStartjaar() - geboortejaar >= leeftijd;
  },
};
