import {computed, reactive} from "@vue/reactivity";
import rechtenService from "@/services/rechten/rechtenService";
import DateUtil from "@/services/dates/DateUtil";
import useEmitter from "@/services/utils/useEmitter";
import {useStore} from "vuex";
import {useConfirm} from "primevue/useconfirm";

export default {

    functieSpace(props) {

        const emitter = useEmitter();
        const store = useStore();
        const confirm = useConfirm();

        const state = reactive({
            historiek: false,
            confirmDialog: false,
            teStoppenFunctie: {}
        })

        const groepsNaam = (groepsnummer) => {
            let groep = store.getters.groepByNummer(groepsnummer);
            if (groep) {
                return groep.naam + " - " + groepsnummer;
            }
        }

        const boodschapStoppenFunctie = () => {
            let message = "";
            if (state.teStoppenFunctie) {
                message = "Ben je zeker dat je de functie " + state.teStoppenFunctie.naam + " wil stoppen?"
            }
            return message;
        }

        const inactieveGroepsNaam = (groepsnummer) => {
            let groep = store.getters.inactieveGroepByNummer(groepsnummer);
            if (groep) {
                return groep.naam + " - " + groepsnummer;
            }
        }

        const lidMagFunctieStoppen = (sectie) => {
            return rechtenService.hasPermission(sectie);
        }

        const getFunctie = (functieId) => {
            return store.getters.functieById(functieId);
        }

        const formatteerDatum = (datum) => {
            return DateUtil.formatteerDatum(datum);
        }

        const stopFunctie = (functie, groepsnummer) => {
            state.teStoppenFunctie = Object.assign({}, functie)
            confirm.require({
                message: boodschapStoppenFunctie(),
                header: "Functie stoppen",
                icon: "pi pi-exclamation-triangle",
                acceptIcon: "pi pi-check",
                rejectIcon: "pi pi-times",
                acceptClass: "approve-button",
                rejectClass: "reject-button",
                accept: () => {
                    state.teStoppenFunctie.einde = new Date().toISOString().slice(0, 10);
                    emitter.emit('updateLid', {functie: state.teStoppenFunctie, groepsnummer: groepsnummer});
                },
                reject: () => {
                    confirm.close();
                }
            })
        }

        const actieveGroepen = computed(() => {
            console.log(props.modelValue);
            return Object.fromEntries(Object.entries(props.modelValue).filter(([key]) => props.modelValue[key].active));
        })

        const nietActieveGroepen = computed(() => {
            return Object.fromEntries(Object.entries(props.modelValue).filter(([key]) => !props.modelValue[key].active));
        })

        const laden = computed(() => {
            return store.getters.groepenLaden || store.getters.functiesLaden;
        })

        return {
            state,
            groepsNaam,
            inactieveGroepsNaam,
            lidMagFunctieStoppen,
            getFunctie,
            formatteerDatum,
            stopFunctie,
            actieveGroepen,
            nietActieveGroepen,
            laden
        }
    }
}
