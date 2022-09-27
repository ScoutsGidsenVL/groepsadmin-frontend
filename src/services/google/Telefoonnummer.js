const PhoneNumber = require('awesome-phonenumber');

export default {

    formatNumber(value) {

        // Geen waarde gewoon terug
        if (value === undefined) return value;

        if (value.match(/[A-Za-z]/i)) {
            return value;
        } else if (value) {
            let regex = /[-./ ]/gi;
            value = value.replace(regex, '');
        }

        let regioCode = PhoneNumber(value).getRegionCode();
        let countryCode = PhoneNumber(value).getCountryCode(value);

        if (!countryCode || countryCode === 0) {
            countryCode = this.getCountryCode(value);
        }

        if (!regioCode) {
            regioCode = PhoneNumber.getRegionCodeForCountryCode(countryCode);
        }

        let phoneNumber = value;

        if (!regioCode && !countryCode) {
            phoneNumber = this.getPhoneNumber(value);
        }

        let pn = new PhoneNumber(phoneNumber, regioCode);
        return pn.getNumber('input')
    },

    validateNumber(value) {
        if (!value || value.isEmpty) {
            return true;
        }

        let regioCode = PhoneNumber(value).getRegionCode();
        let countryCode = PhoneNumber(value).getCountryCode(value);

        if (!countryCode || countryCode === 0) {
            countryCode = this.getCountryCode(value);
        }

        if (!regioCode) {
            regioCode = PhoneNumber.getRegionCodeForCountryCode(countryCode);
        }

        let phoneNumber = value;

        if (!regioCode && !countryCode) {
            phoneNumber = this.getPhoneNumber(value);
        }

        let pn = new PhoneNumber(phoneNumber, regioCode);
        return pn.isValid();
    },

    getCountryCode(value) {
        if (value.substring(0, 1) === "+") {
            return value.substring(1, 3);
        } else if (value.substring(0, 2) === "00") {
            return value.substring(2, 4);
        } else {
            return "32"
        }
    },

    getPhoneNumber(value) {
        if (value.substring(0, 1) === "+") {
            return value.substring(3, value.length)
        } else if (value.substring(0, 2) === "00") {
            return value.substring(4, value.length)
        } else {
            return value
        }
    }

}
