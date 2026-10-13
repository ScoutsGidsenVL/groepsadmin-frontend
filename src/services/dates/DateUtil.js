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
    return moment(String(datum)).format("YYYY-MM-DD");
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
