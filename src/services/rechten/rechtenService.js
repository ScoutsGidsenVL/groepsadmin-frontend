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
  }
};
