import { reactive } from "@vue/reactivity";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import rechtenService from "@/services/rechten/rechtenService";
import { onUpdated } from "@vue/runtime-core";

export default {
  adresSpace(props) {
    const confirm = useConfirm();
    const toast = useToast();
    const state = reactive({
      adressen: props.modelValue.adressen,
      invalid: false,
      landen: [
        { label: "België", value: "BE" },
        { label: "Duitsland", value: "DE" },
        { label: "Frankrijk", value: "FR" },
        { label: "Groot-Brittannië", value: "GB" },
        { label: "Luxemburg", value: "LU" },
        { label: "Nederland", value: "NL" },
        { label: "Canada", value: "CA" },
        { label: "Polen", value: "PL" },
      ],
    });

    onUpdated(() => {
      state.adressen = props.modelValue.adressen;
    });

    const contactHoortBijAdres = (contact, adres) => {
      if (!contact || !adres) {
        return false;
      }
      if (typeof contact.adres === "object" && contact.adres !== null) {
        return (
          contact.adres.straat === adres.straat &&
          contact.adres.nummer === adres.nummer &&
          contact.adres.postcode === adres.postcode &&
          contact.adres.gemeente === adres.gemeente
        );
      }
      return contact.adres === adres.id || contact.adresId === adres.id;
    };

    const contactNaam = (contact) => {
      const naam = [contact.voornaam, contact.achternaam]
        .filter(Boolean)
        .join(" ")
        .trim();
      return naam || contact.rol || "een contact";
    };

    const remove = (index) => {
      const adres = state.adressen[index];
      const contacten = (props.modelValue && props.modelValue.contacten) || [];
      const gekoppeldeContacten = contacten.filter((contact) =>
        contactHoortBijAdres(contact, adres)
      );

      if (gekoppeldeContacten.length > 0) {
        const namen = gekoppeldeContacten.map(contactNaam).join(", ");
        const meervoud = gekoppeldeContacten.length > 1;
        toast.add({
          severity: "warn",
          summary: "Adres nog in gebruik",
          detail:
            "Dit adres is nog gekoppeld aan " +
            (meervoud ? "de contacten " : "het contact ") +
            namen +
            ". Als je dit adres toch wilt verwijderen, moet je eerst een ander adres aan  " +
            (meervoud ? "deze contacten" : "dit contact") +
            " toewijzen.",
          life: 8000,
        });
        return;
      }

      confirm.require({
        message: "Ben je zeker dat je dit adres wil verwijderen?",
        header: "Adres verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          state.adressen.splice(index, 1);
        },
        reject: () => {
          confirm.close();
        },
      });
    };

    const zetPostadres = (index) => {
      for (const adres of state.adressen) {
        adres.postadres = false;
      }
      state.adressen[index].postadres = true;
    };

    const veranderLand = (index) => {
      state.adressen[index].postcode = "";
      state.adressen[index].gemeente = "";
      state.adressen[index].straat = "";
      state.adressen[index].nummer = "";
      state.adressen[index].bus = "";
    };

    const setHeader = (adres) => {
      return adres.gemeente
        ? adres.straat +
            " " +
            adres.nummer +
            ", " +
            adres.postcode +
            " " +
            adres.gemeente
        : "Nieuw adres";
    };

    const heeftToegang = (sectie) => {
      if (props.lidaanvraag) {
        return true;
      }
      return rechtenService.canBeShowed(props.modelValue, sectie);
    };

    const voegAdresToe = () => {
      let nieuwAdres = {
        land: "BE",
        postadres: false,
        omschrijving: "",
        id: "tempadres" + Date.now(),
        bus: "",
        gemeente: "",
        postcode: "",
      };

      if (state.adressen) {
        let bestaandPostadres = false;
        for (const adres of state.adressen) {
          if (adres.postadres) {
            bestaandPostadres = true;
          }
        }

        if (!bestaandPostadres) {
          nieuwAdres.postadres = true;
        }
      } else {
        nieuwAdres.postadres = true;
        state.adressen = [];
      }
      state.adressen.push(nieuwAdres);
    };

    if (state.adressen && state.adressen.length === 0) {
      voegAdresToe();
    }

    return {
      state,
      remove,
      voegAdresToe,
      setHeader,
      veranderLand,
      zetPostadres,
      heeftToegang,
    };
  },
};
