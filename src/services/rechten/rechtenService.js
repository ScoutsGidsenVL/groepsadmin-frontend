import store from "@/store";
let _ = require('lodash');


export default {
  hasAccess: function(type) {
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

  hasPermission: function (lid, sectie) {
    let patchObject = lid.links.find(obj => {
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
  }
};
