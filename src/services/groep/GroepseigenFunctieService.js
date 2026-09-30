import { reactive } from "@vue/reactivity";
import RestService from "@/services/api/RestService";
import { useConfirm } from "primevue/useconfirm";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import { computed } from "vue";
import rechtenService from "@/services/rechten/rechtenService";
import { onUpdated } from "@vue/runtime-core";
import useEmitter from "@/services/utils/useEmitter";

export default {
  groepseigenFunctiesSpace(props) {
    const confirm = useConfirm();
    const store = useStore();
    const toast = useToast();
    const emitter = useEmitter();

    emitter.on("groepOpslaan", () => {
      sorteerFuncties();
    });

    const state = reactive({
      groep: props.modelValue,
      gesorteerdeFuncties: [],
      // Laatst opgeslagen beschrijving per functie-id, om per rij te kunnen
      // tonen of er nog niet-opgeslagen wijzigingen zijn
      originelen: {},
      opslaandeFunctieIds: {},
    });

    const isNieuw = (functie) => functie.id.startsWith("tempFunctie");

    // Vult enkel ontbrekende originelen aan, overschrijft nooit een reeds
    // gekende waarde: anders zou elke re-render (bv. bij het typen) de net
    // ingegeven tekst als "origineel" beschouwen en het wijzigingen-icoon
    // meteen weer laten verdwijnen
    const zorgVoorOriginelen = () => {
      (state.groep?.groepseigenFuncties || []).forEach((functie) => {
        if (!isNieuw(functie) && !(functie.id in state.originelen)) {
          state.originelen[functie.id] = functie.beschrijving;
        }
      });
    };

    const isGewijzigd = (functie) =>
      isNieuw(functie) || state.originelen[functie.id] !== functie.beschrijving;

    const isBezigMetOpslaan = (functie) =>
      !!state.opslaandeFunctieIds[functie.id];

    const magOpslaan = (functie) =>
      isGewijzigd(functie) &&
      !isBezigMetOpslaan(functie) &&
      !!(functie.beschrijving && functie.beschrijving.trim());

    const remove = (index) => {
      let geif = state.groep.groepseigenFuncties[index];
      let id = geif.id.substring(0, 11);

      // Splitst op object-identiteit i.p.v. de index van bij de klik te
      // hergebruiken: die kan intussen niet meer overeenkomen, bv. omdat de
      // lijst opnieuw gesorteerd werd terwijl de bevestigingsdialoog open
      // stond, of tijdens het wachten op de API-respons hieronder.
      const verwijderUitLijst = () => {
        const huidigeIndex = state.groep.groepseigenFuncties.indexOf(geif);
        if (huidigeIndex !== -1) {
          state.groep.groepseigenFuncties.splice(huidigeIndex, 1);
        }
      };

      confirm.require({
        message:
          "Ben je zeker dat je de functie " +
          (geif.beschrijving ? geif.beschrijving : "") +
          " wil verwijderen?",
        header: "Functie verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          if (id !== "tempFunctie") {
            RestService.verwijderFunctie(geif.id)
              .then((res) => {
                if (res.status === 204) {
                  verwijderUitLijst();
                  store.dispatch("getGroepen");
                  toast.add({
                    severity: "success",
                    summary: "Functie",
                    detail: "Functie verwijderd.",
                    life: 3000,
                  });
                }
              })
              .catch((error) => {
                if (error.response.status === 404) {
                  toast.add({
                    severity: "warn",
                    summary: "Functie",
                    detail: "Functie bestaat niet meer",
                    life: 8000,
                  });
                } else {
                  toast.add({
                    severity: "warn",
                    summary: "Functie",
                    detail: error.response.data.beschrijving,
                    life: 8000,
                  });
                }
              });
          } else {
            verwijderUitLijst();
            toast.add({
              severity: "success",
              summary: "Functie",
              detail: "Functie verwijderd.",
              life: 3000,
            });
          }
          sorteerFuncties();
        },
        reject: () => {
          confirm.close();
        },
      });
    };

    const voegGeifToe = () => {
      if (!state.groep.groepseigenFuncties)
        state.groep.groepseigenFuncties = [];
      let nieuweFunctie = {
        id: "tempFunctie" + Math.random(),
        beschrijving: null,
        groepen: [state.groep.groepsnummer],
      };
      state.groep.groepseigenFuncties.unshift(nieuweFunctie);
      state.activeIndex = 0;
      sorteerFuncties();
    };

    // Slaat één functie individueel op, los van de algemene "Opslaan"-knop
    // van de groep: een nieuwe (tempFunctie) wordt aangemaakt, een bestaande
    // wordt aangepast. Nadien wordt originelen[id] bijgewerkt zodat het
    // opslaan-icoon voor deze rij weer verdwijnt tot de volgende wijziging.
    const opslaanFunctie = (functie) => {
      if (!magOpslaan(functie)) {
        return;
      }
      state.opslaandeFunctieIds[functie.id] = true;

      if (isNieuw(functie)) {
        RestService.postFuncties(functie)
          .then((res) => {
            if (res.status === 201) {
              const huidigeIndex = state.groep.groepseigenFuncties.indexOf(
                functie
              );
              if (huidigeIndex !== -1) {
                state.groep.groepseigenFuncties.splice(
                  huidigeIndex,
                  1,
                  res.data
                );
              }
              delete state.opslaandeFunctieIds[functie.id];
              state.originelen[res.data.id] = res.data.beschrijving;
              store.dispatch("getGroepen");
              store.dispatch("getFuncties");
              toast.add({
                severity: "success",
                summary: "Functie",
                detail: "Functie opgeslagen.",
                life: 3000,
              });
              sorteerFuncties();
            }
          })
          .catch((error) => {
            delete state.opslaandeFunctieIds[functie.id];
            toast.add({
              severity: "warn",
              summary:
                (error.response && error.response.data.titel) || "Functie",
              detail:
                error.response &&
                (error.response.data.beschrijving || error.response.data.titel),
              life: 8000,
            });
          });
      } else {
        RestService.pasFunctieAan(functie.id, functie)
          .then((res) => {
            if (res.status === 200) {
              delete state.opslaandeFunctieIds[functie.id];
              state.originelen[functie.id] = functie.beschrijving;
              toast.add({
                severity: "success",
                summary: "Functie",
                detail: "Functie opgeslagen.",
                life: 3000,
              });
            }
          })
          .catch((error) => {
            delete state.opslaandeFunctieIds[functie.id];
            toast.add({
              severity: "warn",
              summary:
                (error.response && error.response.data.titel) || "Functie",
              detail:
                error.response &&
                (error.response.data.beschrijving || error.response.data.titel),
              life: 8000,
            });
          });
      }
    };

    const kanGroepWijzigen = computed(() => {
      return rechtenService.kanWijzigen(state.groep);
    });

    const kanFunctieWijzigen = computed(() => {
      return rechtenService.kanGeFunctieWijzigen(state.groep);
    });

    onUpdated(() => {
      state.groep = props.modelValue;
      sorteerFuncties();
      zorgVoorOriginelen();
    });

    const sorteerFuncties = () => {
      state.gesorteerdeFuncties = state.groep?.groepseigenFuncties?.sort(
        (a, b) => {
          if (a.id.includes("tempFunctie") || b.id.includes("tempFunctie")) {
            return 0;
          }
          if (a.beschrijving < b.beschrijving) {
            return -1;
          }
          if (a.beschrijving > b.beschrijving) {
            return 1;
          }
          return 0;
        }
      );
    };

    return {
      state,
      voegGeifToe,
      remove,
      opslaanFunctie,
      magOpslaan,
      isBezigMetOpslaan,
      kanFunctieWijzigen,
      kanGroepWijzigen,
    };
  },
};
