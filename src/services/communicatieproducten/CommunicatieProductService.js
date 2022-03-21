let _ = require('lodash');

export default {

    checkValue(selectedCommunicatieProducten, cp, type) {
        let result = true;
        _.each(selectedCommunicatieProducten, function (communicatieproductAbonnement) {
            if (cp.id === communicatieproductAbonnement.communicatieproduct && type === communicatieproductAbonnement.type) {
                result = false;
            }
        })
        return result;
    },

    checkBijlages(selectedCommunicatieProducten, type) {
        let result = true;
        _.each(selectedCommunicatieProducten, function (communicatieproductAbonnement) {
            if (communicatieproductAbonnement.type === type && communicatieproductAbonnement.communicatieproduct.bijlage) {
                result = false;
            }
        })
        return result;
    },

    checkAantalBijlage(selectedCommunicatieProducten, type, communicatieProducten) {
        let counter = 0;
        _.each(selectedCommunicatieProducten, function (communicatieproductAbonnement) {
            if (communicatieproductAbonnement.type === type) {
                _.each(communicatieProducten, function (communicatieProduct) {
                    if (communicatieProduct.id === communicatieproductAbonnement.communicatieproduct) {
                        counter++;
                    }
                })
            }
        })
        return (counter >= 3);
    },

    getAantalBijlagesVanType(selectedCommunicatieProducten, type) {
        let counter = 0;
        _.each(selectedCommunicatieProducten, function (communicatieproductAbonnement) {
            if (communicatieproductAbonnement.type === type) {
                counter++;
            }
        })
        return counter;
    }
}