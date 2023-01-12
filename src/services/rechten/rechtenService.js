import store from "@/store";

let _ = require('lodash');


export default {
    hasAccess: function (type) {
        let result = false;
        if (!store.getters.links) {
            return result;
        }
        store.getters.links.forEach(link => {
            if (link.rel === type) {
                result = true;
            }
        })
        return result;
    },

    hasAccessToGroepen: function () {
        return _.some(store.getters.groepen, 'contacten');
    },

    hasPermission: function (sectie) {
        if (store.getters.profiel) {
            let patchObject = store.getters.profiel.links.find(obj => {
                return obj.method === "PATCH"
            });
            if (patchObject) {
                return patchObject.secties.includes(sectie);
            }
            return false;
        }
    },

    kanWijzigen: function (obj) {
        return _.find(obj.links, {method: 'PATCH'}) !== undefined;
    },

    kanGeFunctieWijzigen: function (obj) {
        return _.find(obj.links, {rel: 'nieuwe groepseigen functie'}) !== undefined;
    },

    canBeShowed: function (lid, type) {
        let patchObject = lid.links.find(obj => {
            return obj.method === "PATCH"
        });
        if (patchObject) {
            return patchObject.secties.find(element => {
                if (element.includes(type)) {
                    return true;
                }
            });
        }
        return false;
    },

    kanSchrappen: function (lid) {
        let patchObject = lid.links.find(obj => {
            return obj.method === "PATCH"
        });
        if (patchObject) {
            let someSect = _.some(patchObject.secties, function (value) {
                return value.indexOf('functies.') !== -1;
            });

            let canSave = _.has(patchObject, 'secties');
            return canSave && someSect;
        }
    },

    heeftSteekkaartLeesrecht: function (lid, type) {
        let result = false;

        if (lid && lid.links) {
            lid.links.forEach(link => {
                if (link.rel === type) {
                    result = true;
                }
            })
        }
        return result;
    },

    magAlleFunctiesStoppen(lid) {
        let result = false;
        if (lid && lid.functies) {
            let patchObject = lid.links.find(obj => {
                return obj.method === "PATCH"
            });
            if (patchObject) {
                lid.functies.forEach(functie => {
                    if (!result) {
                        result = patchObject.secties.indexOf('functies.' + functie.groep) > -1;
                    }
                })
            }
            return result;
        }

    },

    kanOpslaan(lid) {
        if (lid && lid.links) {
            let patchObject = lid.links.find(obj => {
                return obj.method === "PATCH"
            });
            if (patchObject) {
                return patchObject.secties.length > 0;
            }
        }
    }

};
