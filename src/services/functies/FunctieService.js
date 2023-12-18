import {computed, reactive} from "@vue/reactivity";
import rechtenService from "@/services/rechten/rechtenService";
import DateUtil from "@/services/dates/DateUtil";
import {useStore} from "vuex";
import {useConfirm} from "primevue/useconfirm";

export default {

    functieSpace(props, context) {

        const store = useStore();
        const confirm = useConfirm();

        const state = reactive({
            historiek: false,
            confirmDialog: false,
            teStoppenFunctie: {},
            lid: props.lid
        })

        const groepsNaam = (groepsnummer) => {
            let groep = store.getters.groepByNummer(groepsnummer);
            if (groep) {
                return groep.naam + " - " + groepsnummer;
            }
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

        const stopAlleFuncties = () => {
            context.emit('stopAlleFuncties');
        }

        const stopFunctie = (functie, nummer) => {
            let message = "Ben je zeker dat je de functie " + functie.naam + " wil stoppen?"

            functie.groep = nummer;

            confirm.require({
                message: message,
                header: "Functie stoppen",
                icon: "pi pi-exclamation-triangle",
                acceptIcon: "pi pi-check",
                rejectIcon: "pi pi-times",
                acceptClass: "approve-button",
                rejectClass: "reject-button",
                accept: () => {
                    functie.einde = DateUtil.formatteerDatumVolgensDatetime(new Date());
                    context.emit('updateFuncties', functie);
                },
                reject: () => {
                    confirm.close();
                }
            })
        }

        const actieveGroepen = computed(() => {
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
            laden,
            stopAlleFuncties
        }
    }
}
