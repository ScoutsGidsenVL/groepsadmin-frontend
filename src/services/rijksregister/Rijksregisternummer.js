export default {
  // Houdt enkel de cijfers over (verwijdert punten, streepjes, spaties, ...)
  cleanNumber(value) {
    if (value === undefined || value === null) {
      return "";
    }
    return ("" + value).replace(/\D/g, "");
  },

  // Formatteert naar xx.xx.xx-xxx.xx wanneer er 11 cijfers zijn,
  // anders blijft de ingave ongewijzigd.
  formatNumber(value) {
    const digits = this.cleanNumber(value);
    if (digits.length !== 11) {
      return value;
    }
    return (
      digits.substring(0, 2) +
      "." +
      digits.substring(2, 4) +
      "." +
      digits.substring(4, 6) +
      "-" +
      digits.substring(6, 9) +
      "." +
      digits.substring(9, 11)
    );
  },

  // Geldigheidscontrole via de modulo 97 controle (elfproef).
  // Een leeg veld is geldig, net zoals bij het gsm nummer.
  validateNumber(value) {
    if (value === undefined || value === null) {
      return true;
    }
    if (("" + value).trim().length === 0) {
      return true;
    }
    const digits = this.cleanNumber(value);
    if (digits.length !== 11) {
      return false;
    }

    const basis = parseInt(digits.substring(0, 9), 10);
    const controle = parseInt(digits.substring(9, 11), 10);

    // Geboren voor 2000
    if (97 - (basis % 97) === controle) {
      return true;
    }
    // Geboren vanaf 2000: het cijfer 2 wordt vooraan toegevoegd
    if (97 - ((2000000000 + basis) % 97) === controle) {
      return true;
    }
    return false;
  },
};
