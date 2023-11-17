export default {
  getKey() {
    let googleMapsKey = "";
    switch (window.location.origin) {
      case "http://localhost:8000":
        googleMapsKey = "AIzaSyBQRUONtrmAcJ96_NILKeRvj5F5nXRh2MM";
        break;
      case "http://localhost:3000":
        googleMapsKey = "AIzaSyBQRUONtrmAcJ96_NILKeRvj5F5nXRh2MM";
        break;
      case "https://ga-dev-tvl.scoutsengidsenvlaanderen.be":
        googleMapsKey = "AIzaSyBiKzCCqMUyu4mW0rKk777CU3pW86FZiJ8";
        break;
      case "https://ga-staging.scoutsengidsenvlaanderen.be":
        googleMapsKey = "AIzaSyBZU1SgLDbOfAlROSnR_cb_wWQGlQRqMqc";
        break;
      case "https://groepsadmin.scoutsengidsenvlaanderen.be":
        googleMapsKey = "AIzaSyAbMpNtZ1YdLg8qjlDqLjGXisPAFp88QA8";
        break;
      default:
        googleMapsKey = "AIzaSyAbMpNtZ1YdLg8qjlDqLjGXisPAFp88QA8";
        break;
    }
    return googleMapsKey;
  },

  berekenCenter(adressen) {
    if (adressen) {
      let minLat = 52; // bovengrens
      let maxLat = 50; // ondergrens
      let minLng = 7; // bovengrens
      let maxLng = 2; // ondergrens
      adressen.forEach((adres) => {
        if (adres.positie) {
          minLat = Math.min(minLat, adres?.positie?.latitude);
          maxLat = Math.max(maxLat, adres?.positie?.latitude);
          minLng = Math.min(minLng, adres?.positie?.longitude);
          maxLng = Math.max(maxLng, adres?.positie?.longitude);
        }
      });
      let centerLat = (maxLat - minLat) / 2 + minLat;
      let centerLng = (maxLng - minLng) / 2 + minLng;
      return { lat: centerLat, lng: centerLng };
    }
  },

  bepaalMarkers(adressen) {
    if (adressen) {
      let markers = [];
      const markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      adressen.forEach((adres, key) => {
        if (typeof adres.positie !== "undefined") {
          let marker = {
            position: {
              lat: adres?.positie?.latitude,
              lng: adres?.positie?.longitude,
            },
            draggable: false,
            clickable: true,
            infoWindow: false,
            label: markerLabels[key],
            infoProp:
              adres.straat +
              " " +
              adres.nummer +
              (adres.bus ? " bus " + adres.bus : "") +
              "<br>" +
              adres.postcode +
              " " +
              adres.gemeente,
            adresId: adres.id,
          };
          markers.push(marker);
        }
      });
      return markers;
    }
  },
};
