import { reactive } from "@vue/reactivity";
import { onUpdated } from "@vue/runtime-core";
import { watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useVuelidate } from "@vuelidate/core";
import { email, helpers } from "@vuelidate/validators";
import RestService from "@/services/api/RestService";
import KboNummer from "@/services/kbo/KboNummer";

export default {
  groepSpace(props) {
    const confirm = useConfirm();
    const toast = useToast();

    const state = reactive({
      groep: props.modelValue,
      activeIndex: [],
      // Laatst opgeslagen velden per vzw-id, om per rij te kunnen tonen of
      // er nog niet-opgeslagen wijzigingen zijn
      originelen: {},
      opslaandeVzwIds: {},
      vzwsLaden: false,
    });

    const isNieuw = (vzw) => vzw.id.startsWith("tempVzw");

    // Optionele lege velden (kbo, email, doel) worden niet meegestuurd naar
    // de API, enkel effectief ingevulde waarden
    const vzwVelden = (vzw) => {
      const velden = { naam: vzw.naam };
      if (vzw.kbo) {
        velden.kbo = KboNummer.cleanNumber(vzw.kbo);
      }
      if (vzw.email) {
        velden.email = vzw.email;
      }
      if (vzw.doel) {
        velden.doel = vzw.doel;
      }
      return velden;
    };

    // De API kent het KBO nummer enkel als 10 cijfers; in het scherm tonen
    // we het altijd als xxxx.xxx.xxx
    const metGeformatteerdKbo = (vzw) =>
      vzw.kbo ? { ...vzw, kbo: KboNummer.formatNumber(vzw.kbo) } : vzw;

    const formatteerKbo = (vzw) => {
      vzw.kbo = KboNummer.formatNumber(vzw.kbo);
    };

    // Vult enkel ontbrekende originelen aan, overschrijft nooit een reeds
    // gekende waarde: anders zou elke re-render (bv. bij het typen) de net
    // ingegeven tekst als "origineel" beschouwen en het opslaan-icoon
    // meteen weer laten verdwijnen
    const zorgVoorOriginelen = () => {
      (state.groep?.ondersteunendeVzws || []).forEach((vzw) => {
        if (!isNieuw(vzw) && !(vzw.id in state.originelen)) {
          state.originelen[vzw.id] = JSON.stringify(vzwVelden(vzw));
        }
      });
    };

    const isGewijzigd = (vzw) =>
      isNieuw(vzw) ||
      state.originelen[vzw.id] !== JSON.stringify(vzwVelden(vzw));

    const isBezigMetOpslaan = (vzw) => !!state.opslaandeVzwIds[vzw.id];

    const magOpslaan = (vzw) =>
      !state.vzwsLaden &&
      isGewijzigd(vzw) &&
      !isBezigMetOpslaan(vzw) &&
      !!(vzw.naam && vzw.naam.trim());

    const voegVzwToe = () => {
      if (!state.groep.ondersteunendeVzws) {
        state.groep.ondersteunendeVzws = [];
      }
      state.groep.ondersteunendeVzws.push({
        id: "tempVzw" + Date.now(),
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

    // Slaat één vzw individueel op via de dedicated vzw-endpoints, los van
    // de algemene "Opslaan"-knop van de groep: een nieuwe (tempVzw) wordt
    // aangemaakt, een bestaande wordt aangepast.
    const opslaanVzw = (vzw) => {
      if (!magOpslaan(vzw)) {
        return;
      }
      state.opslaandeVzwIds[vzw.id] = true;

      const afhandelen = (promise, tempId) => {
        promise
          .then((res) => {
            const huidigeIndex = state.groep.ondersteunendeVzws.findIndex(
              (v) => v.id === tempId
            );
            if (huidigeIndex !== -1) {
              state.groep.ondersteunendeVzws.splice(
                huidigeIndex,
                1,
                metGeformatteerdKbo(res.data)
              );
            }
            delete state.opslaandeVzwIds[tempId];
            state.originelen[res.data.id] = JSON.stringify(vzwVelden(res.data));
            toast.add({
              severity: "success",
              summary: "Ondersteunende vzw",
              detail: "Vzw opgeslagen.",
              life: 3000,
            });
          })
          .catch((error) => {
            delete state.opslaandeVzwIds[tempId];
            toast.add({
              severity: "warn",
              summary:
                (error.response && error.response.data.titel) ||
                "Ondersteunende vzw",
              detail:
                error.response &&
                (error.response.data.beschrijving || error.response.data.titel),
              life: 8000,
            });
          });
      };

      if (isNieuw(vzw)) {
        afhandelen(
          RestService.maakOndersteunendeVzw(state.groep.id, vzwVelden(vzw)),
          vzw.id
        );
      } else {
        afhandelen(
          RestService.updateOndersteunendeVzw(
            state.groep.id,
            vzw.id,
            vzwVelden(vzw)
          ),
          vzw.id
        );
      }
    };

    const verwijderVzw = (index) => {
      const vzw = state.groep.ondersteunendeVzws[index];

      const verwijderUitLijst = () => {
        const huidigeIndex = state.groep.ondersteunendeVzws.indexOf(vzw);
        if (huidigeIndex !== -1) {
          state.groep.ondersteunendeVzws.splice(huidigeIndex, 1);
        }
      };

      confirm.require({
        message:
          "Ben je zeker dat je " +
          (vzw.naam ? vzw.naam : "deze vzw") +
          " wil verwijderen?",
        header: "Vzw verwijderen",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          if (isNieuw(vzw)) {
            verwijderUitLijst();
            toast.add({
              severity: "success",
              summary: "Ondersteunende vzw",
              detail: "Vzw verwijderd.",
              life: 3000,
            });
          } else {
            RestService.verwijderOndersteunendeVzw(state.groep.id, vzw.id)
              .then(() => {
                verwijderUitLijst();
                delete state.originelen[vzw.id];
                toast.add({
                  severity: "success",
                  summary: "Ondersteunende vzw",
                  detail: "Vzw verwijderd.",
                  life: 3000,
                });
              })
              .catch((error) => {
                toast.add({
                  severity: "warn",
                  summary:
                    (error.response && error.response.data.titel) ||
                    "Ondersteunende vzw",
                  detail:
                    error.response &&
                    (error.response.data.beschrijving ||
                      error.response.data.titel),
                  life: 8000,
                });
              });
          }
        },
        reject: () => {
          confirm.close();
        },
      });
    };

    // De groep zelf levert ondersteunendeVzws niet (meer) mee: die worden
    // via hun eigen dedicated endpoint opgehaald, zodra er een groep met
    // een id gekend is (bv. bij het laden of bij het wisselen van groep).
    const laadVzws = (groepsId) => {
      if (!groepsId) {
        return;
      }
      state.vzwsLaden = true;
      const isNogHuidigeGroep = () =>
        props.modelValue && props.modelValue.id === groepsId;
      RestService.getOndersteunendeVzws(groepsId)
        .then((res) => {
          if (!isNogHuidigeGroep()) {
            // Ondertussen naar een andere groep gewisseld: deze respons is
            // niet meer relevant
            return;
          }
          state.groep.ondersteunendeVzws = (
            res.data.ondersteunendeVzws ||
            res.data ||
            []
          ).map(metGeformatteerdKbo);
          state.originelen = {};
          zorgVoorOriginelen();
        })
        .finally(() => {
          if (isNogHuidigeGroep()) {
            state.vzwsLaden = false;
          }
        });
    };

    // Rechtstreeks op de prop: state.groep volgt pas in onUpdated (na de
    // render), waardoor een watcher daarop een groepswissel te laat of niet
    // zag. Bij een wissel ook de open tabs en originelen van de vorige groep
    // wissen.
    watch(
      () => props.modelValue && props.modelValue.id,
      (groepsId) => {
        state.groep = props.modelValue;
        state.activeIndex = [];
        state.originelen = {};
        laadVzws(groepsId);
      },
      { immediate: true }
    );

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
      zorgVoorOriginelen();
    });

    zorgVoorOriginelen();

    return {
      state,
      voegVzwToe,
      verwijderVzw,
      opslaanVzw,
      magOpslaan,
      isBezigMetOpslaan,
      formatteerKbo,
      vzwTitel,
      kboLink,
      v,
    };
  },
};
