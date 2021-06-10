export default {
  getWikiUrl() {
    const baseUrl =
      "https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:";

    return baseUrl + this.getPagina();
  },

  getPagina() {
    let path = window.location.pathname.substr(1);
    let splitpath = path.split("/");

    //when a number occurs in the last element, it's an id, so we remove it
    if (/\d/.test(splitpath.slice(-1))) {
      splitpath.pop();
    }

    let res = "";
    splitpath.forEach((val, key) => {
      if (key > 0) {
        res += "_" + val;
      } else {
        res += val;
      }
    });
    return res;
  },
};
