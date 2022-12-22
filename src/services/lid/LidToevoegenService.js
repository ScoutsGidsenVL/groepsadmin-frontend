import {reactive} from "@vue/reactivity";
import {watch, onMounted} from "vue";
import {useVuelidate} from "@vuelidate/core";
import {onBeforeRouteLeave, useRouter} from "vue-router";
import useEmitter from "@/services/utils/useEmitter";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import rechtenService from "@/services/rechten/rechtenService";
import RestService from "@/services/api/RestService";
let _ = require('lodash');


export default {
    lidToevoegenSpace() {
        const rules = {}
        const emitter = useEmitter();
        const toast = useToast();
        const store = useStore();
        const router = useRouter();

        const state = reactive({
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'lid'
                },
                {
                    label: 'Nieuw lid'
                },
            ],
            watchable: false,
            changes: false,
            eigenProfiel: false,
            type: "",
            id: "",

            changed: true,
            loadingLid: false,
            lid: {
                email: null,
                links: [],
                adressen: [],
                functies: [],
                persoonsgegevens: {
                    geslacht: "vrouw"
                },
                vgagegevens: {
                    voornaam: null,
                    achternaam: null,
                },
                verbondsgegevens: {},
            },
            gesorteerdeFuncties: {},
            groepseigenVelden: {}
        })

        watch(
            () => state.lid,
            () => {
                if (state.watchable && state.lid) {
                    state.changes = true;
                }
            },
            {deep: true})

        onMounted(() =>  {
            emitter.on('veranderFunctie', () => {
                state.changes = true
            })

            if (store.getters.goedTeKeurenLid) {
                state.lid = store.getters.goedTeKeurenLid;
            } else if (store.getters.broerZusLid && Object.keys(store.getters.broerZusLid).length !== 0) {
                state.lid = store.getters.broerZusLid;
            }

            if (state.lid.adressen.length > 0) {
                state.lid.adressen[0].postadres = true;
            }


            setTimeout(() => {
                state.watchable = true
            }, 1500);
        })

        const magFunctiesToevoegen = () => {
            return rechtenService.canBeShowed(store.getters.profiel, 'functies.')
        }

        const v = useVuelidate(rules, state);

        onBeforeRouteLeave((to, from, next) => {
            store.commit('setGoedTeKeurenLid', null)
            store.commit('setBroerZusLid', null)
            next();
        })

        // const sorteerFuncties = () => {
        //     store.commit("setGroepenLaden", true);
        //     let ongesorteerdeFuncties = {};
        //     let functies = [];
        //     if (state.eigenProfiel) {
        //         functies = store.getters.profiel.functies;
        //     } else {
        //         functies = state.lid.functies;
        //     }
        //     functies.forEach((functie) => {
        //         if (!(functie.groep in ongesorteerdeFuncties)) {
        //             ongesorteerdeFuncties[functie.groep] = [];
        //         }
        //
        //         const functieById = store.getters.functieById(functie.functie);
        //         if (functieById) {
        //             let functieObject = {
        //                 id: functieById.id,
        //                 naam: functieById.beschrijving,
        //                 begin: functie.begin,
        //                 einde: functie.einde,
        //                 specialeFunctie:
        //                     functie.functie === specialeFuncties.FV ||
        //                     functie.functie === specialeFuncties.VGA,
        //                 actief: !functie.einde,
        //             };
        //             ongesorteerdeFuncties[functie.groep].push(functieObject);
        //             if (!ongesorteerdeFuncties[functie.groep].active) {
        //                 ongesorteerdeFuncties[functie.groep].active = functieObject.actief;
        //             }
        //         }
        //     });
        //
        //     let inactieveGroepen = Object.entries(ongesorteerdeFuncties).filter(([key]) => !ongesorteerdeFuncties[key].active);
        //     inactieveGroepen.forEach(groep => {
        //         store.dispatch('addGroep', groep[0]);
        //     })
        //
        //     state.gesorteerdeFuncties = Object.keys(ongesorteerdeFuncties).sort().reduce(
        //         (obj, key) => {
        //             obj[key] = ongesorteerdeFuncties[key];
        //             return obj;
        //         },
        //         {}
        //     )
        //     store.commit("setGroepenLaden", false);
        //     state.loadingLid = false;
        // }

        // const filterGroepsEigenVelden = () => {
        //     state.groepseigenVelden = Object.fromEntries(Object.entries(state.lid.groepseigenVelden).filter(([key]) => state.lid.groepseigenVelden[key].schema.length > 0));
        // }

        const opslaan = () => {
            state.loadingLid = true;

            let counter = 0;
            _.forEach(state.lid.adressen, function (adres) {
                counter++;
                _.forEach(state.lid.contacten, function (contact) {
                    if (adres.straat === contact.adres.straat &&
                        adres.nummer === contact.adres.nummer &&
                        adres.postcode === contact.adres.postcode &&
                        adres.gemeente === contact.adres.gemeente ) {
                        adres.id = 'tempadres_' + counter;
                        contact.adres = adres.id;
                        contact.id = 'tempcontact_' + counter
                    } else if (adres.id === contact.adres){
                        adres.id = 'tempadres_' + counter;
                        contact.adres = adres.id;
                    }
                })
            })

            _.forEach(state.lid.adressen, function (adres) {
                if (adres.id.length > 28) {
                    adres.id = 'tempadres';
                }
            })

            _.forEach(state.lid.contacten, function (contact) {
                if (contact.id.length > 28) {
                    contact.id = 'tempcontact';
                    contact.adressen = null;
                }
            })

            if (!state.lid.vgagegevens.beperking) {
                state.lid.vgagegevens.beperking = false;
            }

            state.lid.verbondsgegevens = null;

            v.value.$touch();
            if (v.value.$invalid) {
                state.changes = false;
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
                    life: 3000,
                });
                state.loadingLid = false;
                return;
            }

            if (!state.lid.functies || (state.lid.functies && state.lid.functies.length === 0)) {
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Je moet een functie toekennen.",
                    life: 3000,
                });
                state.loadingLid = false;
                return;
            }

            RestService.saveNieuwLid(state.lid).then(res => {
                if (res.status === 201) {
                    toast.add({
                        severity: "success",
                        summary: "Nieuw lid",
                        detail: "Nieuw lid opgeslagen",
                        life: 3000,
                    });
                    state.changes = false;
                    RestService.verwijderAanvraag(state.lid.id).then(res => {
                        if (res.status === 200){
                            router.push({name: "Lid", params: { id: res.data.id }});
                        }
                    }).finally(() => {
                        router.push({name: "Lid", params: {id: res.data.id}});
                    });
                }
            }).catch(error => {
                toast.add({
                    severity: "warn",
                    summary: error.response.data.titel,
                    detail: error.response.data.beschrijving,
                    life: 3000,
                });
            }).finally(() => {
                state.changes = false;
                state.loadingLid = false;
            })
            store.commit('setGoedTeKeurenLid', null)
            store.commit('setBroerZusLid', null)
        }

        // const updateFuncties = ({functie, groepsnummer}) =>  {
        //     let groep = store.getters.groepByNummer(groepsnummer);
        //     let lid = {
        //         functies: [
        //             {
        //                 functie: functie.id,
        //                 groep: groep.id,
        //                 einde: new Date().toISOString().slice(0, 10),
        //                 begin: functie.begin
        //             }
        //         ]
        //     };
        //     RestService.updateLid(state.lid.id, state.lid).then(res => {
        //         if (res.status === 200) {
        //             toast.add({
        //                 severity: "success",
        //                 summary: "Wijzigingen",
        //                 detail: "Functie is gestopt",
        //             });
        //             state.lid = res.data;
        //             sorteerFuncties();
        //         }
        //     });
        // }

        return {
            state,
            v,
            magFunctiesToevoegen,
            opslaan
        }
    }
}