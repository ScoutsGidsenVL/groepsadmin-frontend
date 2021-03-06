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
};
