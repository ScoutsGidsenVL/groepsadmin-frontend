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

    if (splitpath.length === 3) {
      return splitpath[2];
    }

    splitpath.forEach((val, key) => {
      if (val === "groepsadmin" || val === "frontend"){
        return;
      }

      if (key > 2) {
        res += "_" + val;
      } else {
        res += val;
      }
    });
    return res;
  },
};
