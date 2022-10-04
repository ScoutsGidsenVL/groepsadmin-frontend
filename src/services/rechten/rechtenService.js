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

    hasPermission: function (sectie) {
        let patchObject = store.getters.profiel.links.find(obj => {
            return obj.method === "PATCH"
        });
        if (patchObject) {
            return patchObject.secties.includes(sectie);
        }
        return false;
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
        console.log('check recht')
        let result = false;
        if (lid.links) {
            lid.links.forEach(link => {
                if (link.rel === type) {
                    result = true;
                }
            })
        }
        console.log(result)
        return result;
    },
};
