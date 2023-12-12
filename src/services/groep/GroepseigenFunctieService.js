import {reactive} from "@vue/reactivity";
import RestService from "@/services/api/RestService";
import {useConfirm} from "primevue/useconfirm";
import {useStore} from "vuex";
import {useToast} from "primevue/usetoast";
import {computed} from "vue";
import rechtenService from "@/services/rechten/rechtenService";
import {onUpdated} from "@vue/runtime-core";
import useEmitter from "@/services/utils/useEmitter";

export default {

    groepseigenFunctiesSpace(props) {

        const confirm = useConfirm();
        const store = useStore();
        const toast = useToast();
        const emitter = useEmitter();

        emitter.on('groepOpslaan', () => {
            sorteerFuncties()
        } )

        const state = reactive({
            groep: props.modelValue,
            gesorteerdeFuncties: [],
        })

        const remove = (index) => {
            let geif = state.groep.groepseigenFuncties[index];
            let id = geif.id.substring(0, 11);

            confirm.require({
                message: "Ben je zeker dat je de functie " + (geif.beschrijving ? geif.beschrijving : '') + " wil verwijderen?",
                header: "Functie verwijderen",
                icon: "pi pi-exclamation-triangle",
                accept: () => {
                    if (id !== 'tempFunctie') {
                        RestService.verwijderFunctie(geif.id)
                            .then(res => {
                                if (res.status === 204) {
                                    state.groep.groepseigenFuncties.splice(index, 1);
                                    store.dispatch("getGroepen");
                                    toast.add({
                                        severity: "success",
                                        summary: "Functie",
                                        detail: "Functie verwijderd.",
                                        life: 3000,
                                    });
                                }
                            }).catch((error) => {
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
                        })
                    } else {
                        state.groep.groepseigenFuncties.splice(index, 1);
                        toast.add({
                            severity: "success",
                            summary: "Functie",
                            detail: "Functie verwijderd.",
                            life: 3000,
                        });
                    }
                },
                reject: () => {
                    confirm.close();
                },
            });
        }

        const voegGeifToe = () => {
            let nieuweFunctie = {
                id: 'tempFunctie' + Math.random(),
                beschrijving: null,
                groepen: [state.groep.groepsnummer]
            };
            state.groep?.groepseigenFuncties?.unshift(nieuweFunctie);
        }

        const kanGroepWijzigen = computed(() => {
            return rechtenService.kanWijzigen(state.groep);
        })

        const kanFunctieWijzigen = computed(() => {
            return rechtenService.kanGeFunctieWijzigen(state.groep);
        })

        onUpdated(() => {
          state.groep = props.modelValue;
          sorteerFuncties();
        });

        const sorteerFuncties = () => {
            state.gesorteerdeFuncties = state.groep?.groepseigenFuncties?.sort((a, b) => {
                if (a.id.includes("tempFunctie") || b.id.includes("tempFunctie")) {{
                    return 0;
                }}
                if (a.beschrijving < b.beschrijving) {
                    return -1;
                }
                if (a.beschrijving > b.beschrijving) {
                    return 1;
                }
                return 0;
            })
        }

        return {
            state,
            voegGeifToe,
            remove,
            kanFunctieWijzigen,
            kanGroepWijzigen
        }

    }
}
