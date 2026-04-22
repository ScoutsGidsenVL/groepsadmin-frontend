import { reactive } from "@vue/reactivity";
import { computed, nextTick, onMounted, watch } from "vue";
import RestService from "@/services/api/RestService";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import specialeFuncties from "@/services/functies/SpecialeFuncties";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";
import DateUtil from "@/services/dates/DateUtil";

export default {
  groepSpace() {
    const store = useStore();
    const toast = useToast();
    const emitter = useEmitter();

    const state = reactive({
      selectedGroep: {},
      groepenArray: [],
      contactenLaden: false,
      magFunctiesToevoegen: false,
      changes: false,
      changesFuncties: false,
      watchable: false,
      laden: false,
      home: { icon: "pi pi-home", to: "/dashboard" },
      breadcrumbItems: [
        {
          label: "groep",
        },
      ],
    });

    watch(
      () => state.selectedGroep,
      () => {
        if (state.watchable) {
          state.changes = true;
        }
      },
      { deep: true }
    );

    watch(
      () => state.selectedGroep.groepseigenFuncties,
      () => {
        if (state.watchable) {
          state.changesFuncties = true;
        }
      },
      { deep: true }
    );

    const getContacten = () => {
      state.contactenLaden = true;
      state.selectedGroep.groepsleiding = [];

      if (state.selectedGroep && state.selectedGroep.contacten) {
        state.selectedGroep.contacten.forEach((contact) => {
          if (contact.oidFunctie === specialeFuncties.FV) {
            state.selectedGroep.fv = contact;
          } else if (contact.oidFunctie === specialeFuncties.VGA) {
            state.selectedGroep.vga = contact;
          } else {
            state.selectedGroep.groepsleiding.push(contact);
          }
          state.contactenLaden = false;
        });
      } else {
        state.contactenLaden = false;
      }
    };

    const opslaan = () => {
      emitter.emit("groepOpslaan");
      state.laden = true;
      if (state.selectedGroep.groepseigenGegevens != null) {
        for (
          let i = 0;
          i < state.selectedGroep.groepseigenGegevens.length;
          i++
        ) {
          state.selectedGroep.groepseigenGegevens[i].sort = i;

          if (state.selectedGroep.groepseigenGegevens[i].type !== "lijst") {
            delete state.selectedGroep.groepseigenGegevens[i].keuzes;
          } else {
            state.selectedGroep.groepseigenGegevens[i].keuzes.forEach(
              (keuze, index) => {
                if (!keuze) {
                  state.selectedGroep.groepseigenGegevens[i].keuzes.splice(
                    index,
                    1
                  );
                }
              }
            );
          }
        }
      }

      // Conversie om datum correct door te sturen
      let opgerichtDatum = new Date(state.selectedGroep.opgericht);
      opgerichtDatum.setHours(2);
      state.selectedGroep.opgericht = opgerichtDatum.toISOString();
      if (state.selectedGroep.instantie.naam == "") {
        delete state.selectedGroep.instantie;
      } else if (state.selectedGroep.instantie.adres.gemeente == "") {
        delete state.selectedGroep.instantie.adres;
      }
      state.watchable = false;
      RestService.updateGroep(state.selectedGroep)
        .then((res) => {
          if (res.status === 200) {
            state.selectedGroep.groepseigenFuncties =
              res.data.groepseigenFuncties;
            state.laden = false;
            updateFacturatieBeschrijvingen();
            store.dispatch("getGroepen");
            store.dispatch("getFuncties");
            if (!state.changesFuncties) {
              toast.add({
                severity: "success",
                summary: "Wijzigingen",
                detail: "Wijzigingen opgeslagen.",
                life: 3000,
              });
            }
            state.selectedGroep.opgericht = opgerichtDatum;
            if (!state.selectedGroep.instantie) {
              state.selectedGroep.instantie = {
                naam: "",
                kbo: "",
              };
            }
            if (!state.selectedGroep.instantie.adres) {
              state.selectedGroep.instantie.adres = {
                bus: "",
                gemeente: "",
                land: "BE",
                nummer: "",
                postcode: "",
                straat: "",
              };
            }
          }
        })
        .catch((error) => {
          toast.add({
            severity: "warn",
            summary: "Functie",
            detail: error.response.data.beschrijving,
            life: 8000,
          });
        })
        .finally(() => {
          if (!state.changesFuncties) {
            state.laden = false;
            state.changes = false;
          }
          store.commit("setGroepenLaden", false);
          nextTick(() => {
            state.watchable = true;
          });
        });

      // indien er functieaanpassingen zijn gaan we deze allemaal overlopen en opslaan
      if (state.changesFuncties) {
        let showMessage = false;
        state.selectedGroep.groepseigenFuncties.forEach((functie) => {
          let index = functie.id.indexOf("tempFunctie");
          if (functie.id.indexOf("tempFunctie") !== -1) {
            RestService.postFuncties(functie)
              .then((res) => {
                if (res.status === 201) {
                  state.selectedGroep.groepseigenFuncties.splice(
                    index,
                    1,
                    res.data
                  );

                  if (!showMessage) {
                    showMessage = true;
                    toast.add({
                      severity: "success",
                      summary: "Wijzigingen",
                      detail: "Wijzigingen opgeslagen.",
                      life: 3000,
                    });
                  }
                }
              })
              .catch((error) => {
                if (!showMessage) {
                  showMessage = true;
                  toast.add({
                    severity: "warn",
                    summary: error.response.data.titel,
                    detail: error.response.data.beschrijving,
                    life: 8000,
                  });
                }
              })
              .finally(() => {
                state.laden = false;
                state.changes = false;
                state.changesFuncties = false;
              });
          } else {
            RestService.pasFunctieAan(functie.id, functie)
              .then((res) => {
                if (res.status === 200) {
                  if (!showMessage) {
                    showMessage = true;
                    toast.add({
                      severity: "success",
                      summary: "Wijzigingen",
                      detail: "Wijzigingen opgeslagen.",
                      life: 3000,
                    });
                  }
                }
              })
              .catch((error) => {
                if (!showMessage) {
                  showMessage = true;
                  toast.add({
                    severity: "warn",
                    summary: error.response.data.titel,
                    detail: error.response.data.beschrijving,
                    life: 8000,
                  });
                }
              })
              .finally(() => {
                state.laden = false;
                state.changes = false;
                state.changesFuncties = false;
              });
          }
        });
      }
    };

    const changeLadenStatus = () => {
      state.laden = !state.laden;
    };

    const veranderGroep = (groep) => {
      state.watchable = false;
      state.selectedGroep = groep;
      if (!state.selectedGroep.instantie) {
        state.selectedGroep.instantie = {
          naam: "",
          kbo: "",
        };
      }
      if (!state.selectedGroep.instantie.adres) {
        state.selectedGroep.instantie.adres = {
          bus: "",
          gemeente: "",
          land: "BE",
          nummer: "",
          postcode: "",
          straat: "",
        };
      }

      state.selectedGroep.opgericht = new Date(groep.opgericht);
      getContacten();
      updateFacturatieBeschrijvingen();
      getGroepseigenFuncties(groep);
      nextTick(() => {
        state.watchable = true;
      });
    };

    const getGroepseigenFuncties = (groep) => {
      RestService.getFunctiesVanGroep(groep.groepsnummer).then((res) => {
        if (res.status === 200) {
          state.watchable = false;
          state.selectedGroep.groepseigenFunctie = res.data;
          // state.selectedGroep.groepseigenFuncties = res.data.functies; Is this correct???
          nextTick(() => {
            state.watchable = true;
          });
        }
      });
    };

    const updateFacturatieBeschrijvingen = () => {
      if (state.selectedGroep.facturatieLeiding) {
        state.selectedGroep.leidingVerbeterdBeschrijving =
          "Aangevinkt op " +
          DateUtil.formatteerDatum(state.selectedGroep.facturatieLeiding);
        state.selectedGroep.leidingVerbeterdEnabled = false;
      } else {
        state.selectedGroep.leidingVerbeterdBeschrijving =
          "<b>Deadline: 1 september</b>";
        state.selectedGroep.leidingVerbeterdEnabled = true;
      }
      if (state.selectedGroep.facturatieLeden) {
        state.selectedGroep.ledenVerbeterdBeschrijving =
          "Aangevinkt op " +
          DateUtil.formatteerDatum(state.selectedGroep.facturatieLeden);
        state.selectedGroep.ledenVerbeterdEnabled = false;
      } else {
        state.selectedGroep.ledenVerbeterdBeschrijving =
          "<b>Deadline: 15 oktober</b>";
        state.selectedGroep.ledenVerbeterdEnabled = true;
      }
    };

    const kanGroepWijzigen = computed(() => {
      return rechtenService.kanWijzigen(state.selectedGroep);
    });

    const groepenLaden = computed(() => {
      return store.getters.groepenLaden;
    });

    onMounted(() => {
      state.selectedGroep = store.getters.groepen[0];
      if (!state.selectedGroep.instantie) {
        state.selectedGroep.instantie = {
          naam: "",
          kbo: "",
        };
      }
      if (!state.selectedGroep.instantie.adres) {
        state.selectedGroep.instantie.adres = {
          bus: "",
          gemeente: "",
          land: "BE",
          nummer: "",
          postcode: "",
          straat: "",
        };
      }
      getContacten();
      updateFacturatieBeschrijvingen();
      store.getters.groepen.forEach((groep) => {
        state.groepenArray.push({
          label: groep.naam + " - " + groep.id,
          value: groep,
        });
      });
      state.selectedGroep.publiekInschrijven =
        state.selectedGroep["publiek-inschrijven"];
      nextTick(() => {
        state.watchable = true;
      });
    });

    emitter.on("laden", () => {
      changeLadenStatus();
    });

    emitter.on("updateGroep", () => {
      opslaan();
    });

    return {
      state,
      opslaan,
      changeLadenStatus,
      veranderGroep,
      kanGroepWijzigen,
      groepenLaden,
    };
  },
};
