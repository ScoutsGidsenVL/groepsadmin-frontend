import store from "@/store";

export default {
  hasAccess: function(type) {
    let result = false;
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
