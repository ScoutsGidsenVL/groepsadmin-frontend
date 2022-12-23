import {reactive} from "@vue/reactivity";
import {computed, onMounted, watch} from "vue";
import RestService from "@/services/api/RestService";
import {useStore} from "vuex";
import {useToast} from "primevue/usetoast";
import specialeFuncties from "@/services/functies/SpecialeFuncties";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";

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
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'groep'
                },
            ],
        })

        watch(
            () => state.selectedGroep,
            () => {
                if (state.watchable) {
                    state.changes = true;
                }
            }, {deep: true})

        watch(
            () => state.selectedGroep.groepseigenFuncties,
            () => {
                if (state.watchable) {
                    state.changesFuncties = true;
                }
            }, {deep: true})

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
        }

        const opslaan = () => {
            state.laden = true;
            for (let i = 0; i < state.selectedGroep.groepseigenGegevens.length; i++) {
                state.selectedGroep.groepseigenGegevens[i].sort = i;

                if (state.selectedGroep.groepseigenGegevens[i].type !== 'lijst') {
                    delete state.selectedGroep.groepseigenGegevens[i].keuzes;
                } else {
                    state.selectedGroep.groepseigenGegevens[i].keuzes.forEach((keuze, index) => {
                        if (!keuze) {
                            state.selectedGroep.groepseigenGegevens[i].keuzes.splice(index, 1);
                        }
                    })
                }
            }

            RestService.updateGroep(state.selectedGroep)
                .then(res => {
                    if (res.status === 200) {
                        state.laden = false
                        store.dispatch("getGroepen");
                        if (!state.changesFuncties) {
                            toast.add({
                                severity: "success",
                                summary: "Wijzigingen",
                                detail: "Wijzigingen opgeslagen.",
                                life: 3000,
                            });
                        }
                    }
                }).catch((error) => {
                toast.add({
                    severity: "warn",
                    summary: "Functie",
                    detail: error.response.data.beschrijving,
                    life: 8000,
                });
            }).finally(() => {
                if (!state.changesFuncties) {
                    state.laden = false;
                    state.changes = false;
                }
                store.commit("setGroepenLaden", false);

            })

            // indien er functieaanpassingen zijn gaan we deze allemaal overlopen en opslaan
            if (state.changesFuncties) {
                let showMessage = false;
                state.selectedGroep.groepseigenFuncties.forEach(functie => {
                    if (functie.id.indexOf('tempFunctie') !== -1) {
                        RestService.postFuncties(functie).then(res => {
                            if (res.status === 201) {
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
                        }).catch(error => {
                            if (!showMessage) {
                                showMessage = true;
                                toast.add({
                                    severity: "warn",
                                    summary: error.response.data.titel,
                                    detail: error.response.data.beschrijving,
                                    life: 8000,
                                })
                            }
                        }).finally(() => {
                            state.laden = false;
                            state.changes = false;
                        })
                    } else {
                        RestService.pasFunctieAan(functie.id, functie).then(res => {
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
                        }).catch(error => {
                            if (!showMessage) {
                                showMessage = true;
                                toast.add({
                                    severity: "warn",
                                    summary: error.response.data.titel,
                                    detail: error.response.data.beschrijving,
                                    life: 8000,
                                })
                            }
                        }).finally(() => {
                            state.laden = false;
                            state.changes = false;
                        })
                    }
                })
            }
        }

        const changeLadenStatus = () => {
            state.laden = !state.laden;
        }

        const veranderGroep = (groep) => {
            state.watchable = false;
            state.selectedGroep = groep;
            getContacten();
            setTimeout(() => {
                state.watchable = true
            }, 2000)
        }

        const kanGroepWijzigen = computed(() => {
            return rechtenService.kanWijzigen(state.selectedGroep);
        })

        const groepenLaden = computed(() => {
            return store.getters.groepenLaden;
        })

        onMounted(() => {
            state.selectedGroep = store.getters.groepen[0];
            getContacten();
            store.getters.groepen.forEach((groep) => {
                state.groepenArray.push({
                    label: groep.naam + " - " + groep.id,
                    value: groep,
                });
            });
            state.selectedGroep.publiekInschrijven = state.selectedGroep[
                "publiek-inschrijven"
                ];
            setTimeout(() => {
                state.watchable = true
            }, 2000);
        })

        emitter.on('laden', () => {
            changeLadenStatus()
        });

        emitter.on('updateGroep', () => {
            opslaan();
        } )


        return {
            state,
            opslaan,
            changeLadenStatus,
            veranderGroep,
            kanGroepWijzigen,
            groepenLaden
        }
    }

}
