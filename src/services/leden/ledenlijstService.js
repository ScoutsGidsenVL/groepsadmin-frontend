let _ = require('lodash');


export default {

    activeerKolommen(currentFilter, kolommen) {
        let counter = 1000; // meer dan het aantal kolommen
        let counter2 = 0;
        _.forEach(kolommen, function (kolom) {
            kolom.activated = false;
            kolom.isLoaded = false;
            kolom.kolomIndexOrig = counter;
            counter++;
        });

        _.forEach(currentFilter.kolommen, function (value) {
            let kolom = _.find(kolommen, {'id': value});

            if (kolom) {
                kolom.isLoaded = true;
                kolom.activated = true;
                kolom.kolomIndex = counter2++;
                kolom.sorteringsIndex = currentFilter.sortering.indexOf(value)
            }
        });

        currentFilter.sortering = _.filter(currentFilter.sortering, function (value) {
            return _.find(kolommen, {'id': value});
        });

        kolommen = this.indexeerEnGroepeerKolommen(kolommen);
        return  kolommen;
    },

    indexeerEnGroepeerNonActieveKolommen(kolommen) {
        let nonActieveKolommen = _.filter(kolommen, function (o) {
            return !o.activated
        });
        _.forEach(nonActieveKolommen, function (kolom) {
            kolom.kolomIndex = kolom.kolomIndexOrig;
        });

        // groepering
        _.forEach(kolommen, function (kolom) {
            kolom.groepering = kolom.groeperingOrig || kolom.groepering; // reset
            if (kolom.activated) {
                kolom.groeperingOrig = kolom.groepering; // backup
                kolom.groepering = undefined; // override
            }
        });

        return nonActieveKolommen;
    },

    indexeerEnGroepeerKolommen(kolommen) {

        let counter = 0;
        let actieveKolommen = _.filter(kolommen, function (o) {
            return o.activated
        });
        actieveKolommen = _.sortBy(actieveKolommen, ['kolomIndex']);
        _.forEach(actieveKolommen, function (kolom) {
            kolom.kolomIndex = counter;
            counter++;
        });

        let nonActieveKolommen = _.filter(kolommen, function (o) {
            return !o.activated
        });
        _.forEach(nonActieveKolommen, function (kolom) {
            kolom.kolomIndex = kolom.kolomIndexOrig;
        });

        // groepering
        _.forEach(kolommen, function (kolom) {
            kolom.groepering = kolom.groeperingOrig || kolom.groepering; // reset
            if (kolom.activated) {
                kolom.groeperingOrig = kolom.groepering; // backup
                kolom.groepering = undefined; // override
            }
        });

        return actieveKolommen;
    },

    groeperingGefilterdeKolommen(nonActieveKolommen, groepering) {
        return _.filter(nonActieveKolommen, function (kolom) {
            if (kolom && kolom.label !== 'Link naar individuele steekkaart') {
                return kolom.groepering === groepering;
            }
        });
    },

    getGroepering(nonActieveKolommen) {
        let groepering = new Set();
        _.forEach(nonActieveKolommen, function (kolom) {
            groepering.add(kolom.groepering);
        })
        return groepering;
    },

    activeerKolom(kolommen, geselecteerdeKolom) {
        kolommen.forEach((kolom) => {
            if (kolom.id === geselecteerdeKolom.id) {
                kolom.isLoaded = true;
            }
        })
    }
    
}

