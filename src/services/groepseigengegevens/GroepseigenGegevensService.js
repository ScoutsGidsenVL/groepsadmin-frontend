import {reactive} from "@vue/reactivity";
import {useStore} from "vuex";
import {computed} from "vue";
import {onUpdated} from "@vue/runtime-core";
import rechtenService from "@/services/rechten/rechtenService";
import RestService from "@/services/api/RestService";
import {useConfirm} from "primevue/useconfirm";
import useEmitter from "@/services/utils/useEmitter";
import {useToast} from "primevue/usetoast";

export default {

    lidSpace(props) {
        const store = useStore();
        const state = reactive({
            groepseigenVelden: props.modelValue
        })

        const groepNaam = (groepsnummer) => {
            let groep = store.getters.groepByNummer(groepsnummer);
            if (groep) {
                return groep.naam + " - " + groepsnummer;
            } else {
                groep = store.getters.inactieveGroepByNummer(groepsnummer);
                if (groep) {
                    return groep.naam + " - " + groepsnummer;
                } else {
                    return groepsnummer
                }
            }
        }

        const groepenLaden = computed(() => {
            return store.getters.groepenLaden;
        })

        const groepen = computed(() => {
            return store.getters.indexedGroepen;
        })

        onUpdated(() => {
            state.groepseigenVelden = props.modelValue;
        })

        return {
            state,
            groepNaam,
            groepenLaden,
            groepen
        }
    },

    groepSpace(props) {
        const confirm = useConfirm();
        const emitter = useEmitter();
        const store = useStore();
        const toast = useToast();

        const state = reactive({
            groep: props.modelValue,
            drag: false,
            activeIndex: null
        })

        const kanGroepWijzigen = () => {
            return rechtenService.kanWijzigen(state.groep);
        }

        const veranderKeuze = (index, element) => {
            let currentItem = element.keuzes[index];
            let lastItem = element.keuzes.slice(-1);

            if (lastItem.toString() !== '') {
                element.keuzes.push('');
                lastItem = element.keuzes.slice(-1)
            }

            if (currentItem === '' && (index === (element.keuzes.length - 2))
                && lastItem.toString() === '') {
                element.keuzes.splice(-1, 1)
            }
        }

        const wisKeuze = (index, element) => {
            confirm.require({
                message: "Ben je zeker dat je " + (element.keuzes[index]) + " wil verwijderen?",
                header: "Keuze verwijderen",
                icon: "pi pi-exclamation-triangle",
                accept: () => {
                    emitter.emit('laden');
                    element.keuzes.splice(index, 1);
                    RestService.updateGroep(state.groep)
                        .then(res => {
                            if (res.status === 200) {
                                emitter.emit('laden');
                                store.dispatch("getGroepen");
                                toast.add({
                                    severity: "success",
                                    summary: "Keuze",
                                    detail: "Keuze verwijderd.",
                                    life: 3000,
                                });
                            }
                        }).catch((error) => {
                        state.laden = false;
                        toast.add({
                            severity: "warn",
                            summary: "Functie",
                            detail: error.response.data.beschrijving,
                            life: 8000,
                        });
                    })
                },
                reject: () => {
                    confirm.close();
                },
            })
        }


        const setType = (element, type) => {
            element.type = type;
        }

        const voegGeigToe = () => {
            let newGegeven = {
                beschrijving: null,
                kanLeidingWijzigen: false,
                kanLidWijzigen: false,
                sort: state.groep.groepseigenGegevens.length,
                type: 'tekst',
                status: "nieuw",
                label: "",
                keuzes: ['']
            };
            state.groep.groepseigenGegevens.push(newGegeven);
            state.activeIndex = 0;
        }

        const verwijderGegeven = (index) => {
            let geig = state.groep.groepseigenGegevens[index];

            confirm.require({
                message: "Ben je zeker dat je " + (geig.label ? geig.label : '') + " wil verwijderen?",
                header: "Gegeven verwijderen",
                icon: "pi pi-exclamation-triangle",
                accept: () => {
                    state.groep.groepseigenGegevens.splice(index, 1);
                    if (geig.id) {
                        emitter.emit('updateGroep')
                    } else {
                        toast.add({
                            severity: "success",
                            summary: "Groepseigen gegeven",
                            detail: "Groepseigen gegeven verwijderd.",
                            life: 3000,
                        });
                    }
                },
                reject: () => {
                    confirm.close();
                },
            });
        }

        const geigTitel = (gegeven) => {
            if (gegeven.status === "nieuw" && (gegeven.label === "Nieuw groepseigen gegeven" || gegeven.label === "")) {
                return "Nieuw groepseigen gegeven";
            } else if (gegeven.type === 'tekst_meerdere_lijnen') {
                return gegeven.label + " - Meerdere lijnen";
            } else {
                return gegeven.label + " - " + gegeven.type;
            }
        }

        onUpdated(() => {
            state.groep = props.modelValue;
        });

        return {
            state,
            kanGroepWijzigen,
            geigTitel,
            verwijderGegeven,
            voegGeigToe,
            setType,
            veranderKeuze,
            wisKeuze
        }

    }
}
