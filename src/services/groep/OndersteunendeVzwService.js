import { reactive } from "@vue/reactivity";
import { onUpdated } from "@vue/runtime-core";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useVuelidate } from "@vuelidate/core";
import { email, helpers } from "@vuelidate/validators";
import useEmitter from "@/services/utils/useEmitter";
import KboNummer from "@/services/kbo/KboNummer";

export default {
  groepSpace(props) {
    const confirm = useConfirm();
    const toast = useToast();
    const emitter = useEmitter();

    const state = reactive({
      groep: props.modelValue,
      activeIndex: [],
    });

    const voegVzwToe = () => {
      if (!state.groep.ondersteunendeVzws) {
        state.groep.ondersteunendeVzws = [];
      }
      state.groep.ondersteunendeVzws.push({
        naam: "",
        kbo: "",
        email: "",
        doel: "",
      });
      state.activeIndex = [
        ...state.activeIndex,
        state.groep.ondersteunendeVzws.length - 1,
      ];
    };

    const verwijderVzw = (index) => {
      const vzw = state.groep.ondersteunendeVzws[index];

      confirm.require({
        message:
          "Ben je zeker dat je " +
          (vzw.naam ? vzw.naam : "deze vzw") +
          " wil verwijderen?",
        header: "Vzw verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          state.groep.ondersteunendeVzws.splice(index, 1);
          if (vzw.id) {
            // Reeds opgeslagen vzw: meteen bewaren, zelfde patroon als bij
            // het verwijderen van een groepseigen gegeven
            emitter.emit("updateGroep");
          } else {
            toast.add({
              severity: "success",
              summary: "Ondersteunende vzw",
              detail: "Vzw verwijderd.",
              life: 3000,
            });
          }
        },
        reject: () => {
          confirm.close();
        },
      });
    };

    const vzwTitel = (vzw) => {
      return vzw.naam ? vzw.naam : "Nieuwe vzw";
    };

    const isGeldigKboNummer = (value) => {
      return KboNummer.validateNumber(value);
    };

    // Toont enkel een link naar de detailpagina van de onderneming wanneer
    // er een geldig KBO nummer is ingevuld
    const kboLink = (vzw) => {
      const digits = KboNummer.cleanNumber(vzw.kbo);
      if (digits.length !== 10 || !KboNummer.validateNumber(vzw.kbo)) {
        return null;
      }
      return `https://kbopub.economie.fgov.be/kbopub/toonondernemingps.html?ondernemingsnummer=${digits}`;
    };

    const rules = {
      groep: {
        ondersteunendeVzws: {
          $each: helpers.forEach({
            email: {
              email: helpers.withMessage("Geen geldig emailadres", email),
            },
            kbo: {
              isGeldigKboNummer: helpers.withMessage(
                "Geen geldig KBO nummer",
                isGeldigKboNummer
              ),
            },
          }),
        },
      },
    };

    const v = useVuelidate(rules, state);

    onUpdated(() => {
      state.groep = props.modelValue;
    });

    return {
      state,
      voegVzwToe,
      verwijderVzw,
      vzwTitel,
      kboLink,
      v,
    };
  },
};
