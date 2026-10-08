import { reactive } from "@vue/reactivity";
import { computed, nextTick, onMounted, watch } from "vue";
import RestService from "@/services/api/RestService";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import specialeFuncties from "@/services/functies/SpecialeFuncties";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";
import DateUtil from "@/services/dates/DateUtil";
import KboNummer from "@/services/kbo/KboNummer";

export default {
  groepSpace() {
    const store = useStore();
    const toast = useToast();
    const emitter = useEmitter();

    const state = reactive({
      selectedGroep: {},
      origineleGroep: null,
      groepenArray: [],
      contactenLaden: false,
      magFunctiesToevoegen: false,
      changes: false,
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

    // Zelfde normalisatie als bij het opslaan (uur altijd op 2 gezet, zie
    // opslaan() hieronder) maar dan al bij het laden/wisselen van groep.
    // Zonder dit zou de eerste keer opslaan opgericht altijd als "gewijzigd"
    // zien: de snapshot staat dan nog op het ruwe, ongenormaliseerde uur.
    const normaliseerOpgerichtDatum = (datum) => {
      const opgerichtDatum = new Date(datum);
      opgerichtDatum.setHours(2);
      return opgerichtDatum;
    };

    // Momentopname van de groep zoals laatst geladen/opgeslagen, om bij het
    // opslaan enkel effectief gewijzigde velden mee te sturen in de PATCH
    const maakSnapshot = () => {
      state.origineleGroep = JSON.parse(JSON.stringify(state.selectedGroep));
    };

    const berekenWijzigingen = (nieuweGroep, origineleGroep) => {
      if (!origineleGroep) {
        // Geen snapshot gekend: stuur alles, maar als kopie, zodat
        // verderop veilig velden uit het resultaat verwijderd kunnen
        // worden zonder state.selectedGroep zelf te muteren
        return { ...nieuweGroep };
      }
      const wijzigingen = {};
      Object.keys(nieuweGroep).forEach((key) => {
        if (
          JSON.stringify(nieuweGroep[key]) !==
          JSON.stringify(origineleGroep[key])
        ) {
          wijzigingen[key] = nieuweGroep[key];
        }
      });
      return wijzigingen;
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
      let opgerichtDatum = normaliseerOpgerichtDatum(
        state.selectedGroep.opgericht
      );
      state.selectedGroep.opgericht = opgerichtDatum.toISOString();
      state.watchable = false;
      // Vergelijk tegen de ongewijzigde stand van state.selectedGroep zelf:
      // die wordt hieronder nergens gemuteerd, enkel de uitgaande payload
      // wordt opgeschoond. Zo blijft instantie correct "ongewijzigd" wanneer
      // de gebruiker er niets aan aanpaste.
      const teSturenWijzigingen = berekenWijzigingen(
        state.selectedGroep,
        state.origineleGroep
      );
      // Groepseigen functies en ondersteunende vzw's worden niet via deze
      // algemene PATCH beheerd: functies lopen hieronder via hun eigen
      // postFuncties/pasFunctieAan-aanroepen, vzw's via
      // OndersteunendeVzwService. Zonder deze uitsluiting zou de generieke
      // diff ze toch meesturen zodra er iets aan wijzigde.
      delete teSturenWijzigingen.groepseigenFuncties;
      delete teSturenWijzigingen.ondersteunendeVzws;
      if (teSturenWijzigingen.instantie) {
        const instantie = teSturenWijzigingen.instantie;
        if (instantie.naam == "") {
          delete teSturenWijzigingen.instantie;
        } else {
          teSturenWijzigingen.instantie = { ...instantie };
          if (instantie.adres && instantie.adres.gemeente == "") {
            delete teSturenWijzigingen.instantie.adres;
          }
          // Het KBO nummer van de erkenningsinstantie staat in het scherm
          // als xxxx.xxx.xxx, maar gaat enkel als 10 cijfers naar de API
          if (instantie.kbo) {
            teSturenWijzigingen.instantie.kbo = KboNummer.cleanNumber(
              instantie.kbo
            );
          }
        }
      }
      RestService.updateGroep(
        state.selectedGroep.groepsnummer,
        teSturenWijzigingen
      )
        .then((res) => {
          if (res.status === 200) {
            state.laden = false;
            updateFacturatieBeschrijvingen();
            store.dispatch("getGroepen");
            store.dispatch("getFuncties");
            toast.add({
              severity: "success",
              summary: "Wijzigingen",
              detail: "Wijzigingen opgeslagen.",
              life: 3000,
            });
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
            // Volgende keer opslaan moet enkel afwijken van deze zonet
            // opgeslagen stand, niet van de oorspronkelijk geladen stand
            maakSnapshot();
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
          state.laden = false;
          state.changes = false;
          store.commit("setGroepenLaden", false);
          nextTick(() => {
            state.watchable = true;
          });
        });
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

      state.selectedGroep.opgericht = normaliseerOpgerichtDatum(
        groep.opgericht
      );
      state.selectedGroep.instantie.kbo = KboNummer.formatNumber(
        state.selectedGroep.instantie.kbo
      );
      getContacten();
      updateFacturatieBeschrijvingen();
      getGroepseigenFuncties(groep);
      maakSnapshot();
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
      state.selectedGroep.opgericht = normaliseerOpgerichtDatum(
        state.selectedGroep.opgericht
      );
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
      state.selectedGroep.instantie.kbo = KboNummer.formatNumber(
        state.selectedGroep.instantie.kbo
      );
      getContacten();
      updateFacturatieBeschrijvingen();
      store.getters.groepen.forEach((groep) => {
        state.groepenArray.push({
          label: groep.naam + " - " + groep.groepsnummer,
          value: groep,
        });
      });
      state.selectedGroep.publiekInschrijven =
        state.selectedGroep["publiek-inschrijven"];
      maakSnapshot();
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
