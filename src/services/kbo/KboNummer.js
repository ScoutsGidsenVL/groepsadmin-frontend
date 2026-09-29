export default {
  // Houdt enkel de cijfers over (verwijdert punten, streepjes, spaties, ...)
  cleanNumber(value) {
    if (value === undefined || value === null) {
      return "";
    }
    return ("" + value).replace(/\D/g, "");
  },

  // Formatteert naar xxxx.xxx.xxx wanneer er 10 cijfers zijn,
  // anders blijft de ingave ongewijzigd.
  formatNumber(value) {
    const digits = this.cleanNumber(value);
    if (digits.length !== 10) {
      return value;
    }
    return (
      digits.substring(0, 4) +
      "." +
      digits.substring(4, 7) +
      "." +
      digits.substring(7, 10)
    );
  },

  // Geldigheidscontrole van een Belgisch ondernemingsnummer: 10 cijfers,
  // begint met 0 of 1, en de laatste twee cijfers zijn het controlegetal
  // (97 - (eerste 8 cijfers modulo 97)). Een leeg veld is geldig.
  validateNumber(value) {
    if (value === undefined || value === null) {
      return true;
    }
    if (("" + value).trim().length === 0) {
      return true;
    }
    const digits = this.cleanNumber(value);
    if (digits.length !== 10) {
      return false;
    }
    if (digits[0] !== "0" && digits[0] !== "1") {
      return false;
    }

    const basis = parseInt(digits.substring(0, 8), 10);
    const controle = parseInt(digits.substring(8, 10), 10);

    return 97 - (basis % 97) === controle;
  },
};
