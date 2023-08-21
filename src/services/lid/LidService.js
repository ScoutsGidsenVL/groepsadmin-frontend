import {reactive} from "@vue/reactivity";
import {onBeforeRouteLeave, useRoute, useRouter} from "vue-router";
import useEmitter from "@/services/utils/useEmitter";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import {useVuelidate} from "@vuelidate/core";
import {computed, onMounted, watch} from "vue";
import RestService from "@/services/api/RestService";
import specialeFuncties from "@/services/functies/SpecialeFuncties";
import rechtenService from "@/services/rechten/rechtenService";
import Keycloak from "keycloak-js";

export default {

    lidSpace() {
        const state = reactive({
            breadcrumbItems: [
                {
                    label: 'lid'
                },
                {
                    label: this.eigenProfiel ? 'profiel' : 'details'
                },
            ],
            home: {icon: 'pi pi-home', to: '/dashboard'},

            eigenProfiel: false,
            messageDialog: false,
            messageDialogMessage: "De lidkaart is nog niet beschikbaar. <br/>Meer info bij jouw leiding",
            messageDialogHeader: "",
            watchable: false,
            changes: false,
            id: "",

            changed: true,
            loadingLid: true,
            gewijzigdLid: {},
            lid: {
                adressen: [],
                contacten: [],
                persoonsgegevens: {},
                verbondsgegevens: {},
                vgagegevens: {
                    voornaam: null,
                    achternaam: null,
                }

            },
            gesorteerdeFuncties: {},
            groepseigenVelden: {}
        })

        const route = useRoute();
        const router = useRouter();
        const emitter = useEmitter();
        const confirm = useConfirm();
        const toast = useToast();
        const store = useStore();
        const rules = {}

        watch(
            () => state.lid.vgagegevens,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.vgagegevens = state.lid.vgagegevens
                }
            },
            {deep: true})

        watch(
            () => state.lid.persoonsgegevens,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.persoonsgegevens = state.lid.persoonsgegevens
                }
            }, {deep: true})

        watch(
            () => state.lid.functies,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.functies = state.lid.functies
                }
            }, {deep: true})

        watch(
            () => state.lid.adressen,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.adressen = state.lid.adressen
                }
            }, {deep: true})

        watch(
            () => state.lid.contacten,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.contacten = state.lid.contacten
                }
            }, {deep: true})

        watch(
            () => state.lid.groepseigenVelden,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.groepseigenVelden = state.lid.groepseigenVelden
                }
            }, {deep: true})

        watch(
            () => state.lid.email,
            () => {
                if (state.watchable && state.lid && !state.loadingLid) {
                    state.changes = true;
                    state.gewijzigdLid.email = state.lid.email
                }
            })

        watch(
            () => route.params.id,
            async newId => {
                state.gewijzigdLid = {};
                if (newId === "profiel") {
                    await getProfiel()
                } else {
                    await getLid(newId)
                    state.changes = false;
                }
            }
        )

        const setGeboorteDatum = () => {
            state.lid.vgagegevens.geboortedatum = new Date(state.lid.vgagegevens.geboortedatum);
        }

        const getProfiel = () => {
            state.lid = store.getters.profiel;
            sorteerFuncties();
            filterGroepsEigenVelden();
            state.loadingLid = false;
            setGeboorteDatum();
        }

        const getLid = (id) => {
            state.loadingLid = true
            RestService.getLid(id).then((res) => {
                state.lid = res.data;
                store.commit('setGeselecteerdeLeden', []);
                store.getters.geselecteerdeLeden.push(state.lid);
                if (id === "profiel") {
                    state.eigenProfiel = true;
                    store.commit("setProfiel", res.data);
                }
                sorteerFuncties();
                filterGroepsEigenVelden();
                setGeboorteDatum();
            }).catch(error => {
                if (error.response.status === 403) {
                    toast.add({
                        severity: "warn",
                        summary: error.response.data.titel,
                        detail: error.response.data.beschrijving,
                        life: 3000,
                    });
                    setTimeout(() => {
                        router.push({name: 'Ledenlijst'})
                    }, 2000)
                }
            }).finally(() => {
                state.loadingLid = false;
            })
        }

        const sorteerFuncties = () => {
            store.commit("setGroepenLaden", true);
            let ongesorteerdeFuncties = {};
            let functies = [];
            functies = state.lid.functies;

            functies.forEach((functie) => {
                if (!(functie.groep in ongesorteerdeFuncties)) {
                    ongesorteerdeFuncties[functie.groep] = [];
                }

                const functieById = store.getters.functieById(functie.functie);
                if (functieById) {
                    let functieObject = {
                        id: functieById.id,
                        naam: functieById.beschrijving,
                        begin: functie.begin,
                        einde: functie.einde,
                        specialeFunctie:
                            functie.functie === specialeFuncties.FV ||
                            functie.functie === specialeFuncties.VGA,
                        actief: !functie.einde,
                    };
                    ongesorteerdeFuncties[functie.groep].push(functieObject);
                    if (!ongesorteerdeFuncties[functie.groep].active) {
                        ongesorteerdeFuncties[functie.groep].active = functieObject.actief;
                    }
                }
            });

            let inactieveGroepen = Object.entries(ongesorteerdeFuncties).filter(([key]) => !ongesorteerdeFuncties[key].active);
            inactieveGroepen.forEach(groep => {
                store.dispatch('addGroep', groep[0]);
            })

            state.gesorteerdeFuncties = Object.keys(ongesorteerdeFuncties).sort().reduce(
                (obj, key) => {
                    obj[key] = ongesorteerdeFuncties[key];
                    return obj;
                },
                {}
            )

            Object.values(state.gesorteerdeFuncties).sort((functies) => {
                functies.sort((a, b) => (b.begin.localeCompare(a.begin)))
            })

            store.commit("setGroepenLaden", false);
            state.loadingLid = false;
            resetWatchable();
        }

        const filterGroepsEigenVelden = () => {
            state.groepseigenVelden = Object.fromEntries(Object.entries(state.lid.groepseigenVelden).filter(([key]) => state.lid.groepseigenVelden[key].schema.length > 0));
        }

        const stopAlleFuncties = () => {
            confirm.require({
                message:
                    state.lid.vgagegevens.voornaam + " " + state.lid.vgagegevens.achternaam + ", je staat op punt om al je functies bij Scouts en Gidsen Vlaanderen te schrappen. " +
                    " <br/>" +
                    "(De functie VGA en FV kan niet geschrapt worden. Neem hiervoor contact op met groepsadministratie@scoutsengidsenvlaanderen.be)" +
                    " <br/>" +
                    "Ben je zeker?",
                header: "Alle functies stoppen",
                icon: "pi pi-exclamation-triangle",
                accept: () => {
                    state.lid.functies.forEach(functie => {
                        if (functie.temp !== "tijdelijk" && !functie.einde && (functie.functie !== specialeFuncties.VGA && functie.functie !== specialeFuncties.FV)) {
                            let functieInstantie = {
                                functie: functie.functie,
                                groep: functie.groep,
                                einde: new Date().toISOString().slice(0, 10),
                                begin: functie.begin
                            };
                            if (!state.gewijzigdLid.functies) {
                                state.gewijzigdLid.functies = [];
                            }
                            state.gewijzigdLid.functies.push(functieInstantie);
                        }
                    })
                    opslaan();
                },
                reject: () => {
                    confirm.close();
                },
            });
        }

        const opslaan = () => {
            let vga = false;
            let confirmVGA = false;

            v.value.$reset();
            state.loadingLid = true;
            v.value.$touch();
            if (v.value.$invalid) {
                state.loadingLid = false;
                state.changes = false;
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier. </br> Kijk zeker ook adressen en contacten na.",
                    life: 3000,
                });
                return;
            }

            console.log(state.gewijzigdLid.functies);

            if (state.gewijzigdLid.functies && state.gewijzigdLid.functies.length > 0) {
                state.gewijzigdLid.functies.forEach(functie => {
                    if (functie.functie === specialeFuncties.VGA && functie.temp === 'tijdelijk') {
                        vga = true;
                        confirm.require({
                            message: "Je maakt iemand anders dan jezelf VGA binnen de huidige groep, je zal zelf deze functie verliezen! Je wordt uitgelogd indien je bevestigt. Ben je zeker?",
                            header: "Nieuwe VGA",
                            icon: "pi pi-exclamation-triangle",
                            accept: () => {
                                confirmVGA = true;
                                saveLid(confirmVGA, vga)
                            },
                            reject: () => {
                                confirm.close();
                            },
                        });
                    } else {
                        saveLid(confirmVGA, vga);
                    }
                })
            } else {
                saveLid(confirmVGA, vga);
            }
        }

        const saveLid = (confirmVGA, vga) => {
            if (state.gewijzigdLid.vgagegevens) {
                let geboortedatum = new Date(state.lid.vgagegevens.geboortedatum);
                geboortedatum.setHours(2);
                state.gewijzigdLid.vgagegevens.geboortedatum = geboortedatum.toISOString().slice(0, 10);
            }

            if (!vga || (vga && confirmVGA)) {
                state.loadingLid = true;
                RestService.updateLid(state.lid.id, state.gewijzigdLid)
                    .then(res => {
                        state.lid = res.data;
                        if (res.status === 200)
                            toast.add({
                                severity: "success",
                                summary: "Wijzigingen",
                                detail: "Wijzigingen lid opgeslagen",
                                life: 3000,
                            });
                        state.changes = false;
                    }).catch(error => {
                    if (error && error.response.status !== 303) {
                        toast.add({
                            severity: "warn",
                            summary: error.response.data.titel,
                            detail: error.response.data.beschrijving,
                            life: 3000,
                        })
                    } else {
                        if (vga && confirmVGA) {
                            Keycloak.logout();
                        }
                    }
                }).finally(() => {
                    state.changes = false;
                    getLid(state.lid.id);
                })
            }
        }

        const changeGeg = (veld, waarde, groep) => {
            if (state.gewijzigdLid) {
                state.gewijzigdLid.groepseigenVelden = state.lid.groepseigenVelden;
            }
            if (state.gewijzigdLid.groepseigenVelden[groep]) {
                state.gewijzigdLid.groepseigenVelden[groep].waarden[veld] = waarde;
            }
        }

        emitter.on("changeGeg", (event) => {
            state.changes = true;
            changeGeg(event.veld, event.waarde, event.groep);
        })

        emitter.on('veranderFunctie', (data) => {
            state.lid.functies = data.functies
            state.changes = true
        })

        emitter.on("updateFuncties", (event) => {
            updateFuncties(event.functie, event.groepsnummer);
        })

        emitter.on('opslaan', () => {
            opslaan();
        })

        const updateFuncties = (functie, groepsnummer) => {
            state.loadingLid = true;
            let groep = store.getters.groepByNummer(groepsnummer);
            let lid = {
                functies: [
                    {
                        functie: functie.id,
                        groep: groep.id,
                        einde: functie.einde,
                        begin: functie.begin
                    }
                ]
            };
            RestService.updateLid(state.lid.id, lid).then(res => {
                if (res.status === 200) {
                    toast.add({
                        severity: "success",
                        summary: "Wijzigingen",
                        detail: "Functie is gestopt",
                    });
                    state.lid = res.data;
                    sorteerFuncties();
                    filterGroepsEigenVelden();
                }
            }).catch((error) => {
                toast.add({
                    severity: "warn",
                    summary: error.response.data.titel,
                    detail: error.response.data.beschrijving,
                    life: 8000,
                })
            }).finally(() => {
                state.loadingLid = false;
            })
        }

        onMounted(() => {
            state.id = route.params.id ? route.params.id : "profiel";
            if (state.id === "profiel" && store.getters.profiel) {
                state.eigenProfiel = true;
                getProfiel();
            }

            if (state.id && (!state.lid || state.id !== "profiel" || state.changed)) {
                getLid(state.id);
            }
            resetWatchable();
        })

        const resetWatchable = () => {
            state.changes = false;
            state.watchable = false;
            setTimeout(() => {
                state.watchable = true
            }, 2000);
        }

        onBeforeRouteLeave((to, from, next) => {
            if (state.changes) {
                confirm.require({
                    message:
                        "Je hebt niet opgeslagen wijzigingen. Ben je zeker dat je wil doorgaan?",
                    header: "Wijzigingen",
                    icon: "pi pi-exclamation-triangle",
                    accept: () => {
                        next();
                    },
                    reject: () => {
                        next(false);
                    },
                });
            } else {
                next();
            }
        })

        const volledigeNaam = computed({
            get() {
                return (
                    state.lid.vgagegevens.voornaam + " " + state.lid.vgagegevens.achternaam
                );
            }
        })

        const magFunctiesToevoegen = computed({
            get() {
                if (state.lid.vgagegevens.voornaam) {
                    return rechtenService.canBeShowed(state.lid, 'functies.')
                } else {
                    return false;
                }
            }
        })

        const isEigenProfiel = computed({
            get() {
                return route.params.id === "profiel" || store.getters.profiel.id === route.params.id
            }
        })

        const wijzigingen = computed({
            get() {
                return state.changes
            }
        })

        const teBekijkenLid = computed({
            get() {
                return state.lid
            }
        })

        const lidkaartAfdrukken = () => {
            state.loadingLid = true;

            let ledenIds = {
                lidIds: [state.lid.id],
            };

            RestService.controleerBeschikbaarheidLidkaart(ledenIds)
                .then((res) => {
                    if (res.data.length > 0) {
                        if (state.lid.functies.length > 0) {
                            state.messageDialogMessage = "De lidkaart is pas beschikbaar wanneer de groep of ploeg </br>van jouw belangrijkste functie de leden heeft verbeterd.";
                        }
                        state.messageDialog = true;
                        state.loadingLid = false;
                    } else {
                        downloadLidkaart(ledenIds);
                    }
                }).catch((error) => {
                console.log(error);
            });
        }

        const downloadLidkaart = (ledenIds) => {
            RestService.getLidkaartPdf(ledenIds)
                .then((res) => {
                    if (res.data) {
                        let obj = {};
                        let blob = new Blob([res.data], {type: "application/pdf"});
                        obj.fileUrl = window.URL.createObjectURL(blob);
                        obj.title = "lidkaart.pdf";
                        downloadFile(obj);
                    }
                }).catch((error) => {
                console.log(error);
            }).finally(() => {
                state.loadingLid = false;
            })
        }

        const downloadFile = (obj) => {
            var a = document.createElement("a");
            a.href = obj.fileUrl;
            a.download = obj.title;
            document.body.appendChild(a);
            a.click();
        }


        const v = useVuelidate(rules, state);

        return {
            state,
            v,
            opslaan,
            stopAlleFuncties,
            updateFuncties,
            resetWatchable,
            volledigeNaam,
            magFunctiesToevoegen,
            isEigenProfiel,
            wijzigingen,
            teBekijkenLid,
            lidkaartAfdrukken
        }
    }

}
