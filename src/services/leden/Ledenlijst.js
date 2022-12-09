import {computed, reactive} from "@vue/reactivity";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";
import RestService from "@/services/api/RestService";
import ledenlijstService from "@/services/leden/ledenlijstService";
import ledenlijstFilter from "@/services/leden/ledenlijstFilter";
import ErrorService from "@/services/api/ErrorService";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {ref} from "vue";

export default {

    ledenlijstSpace() {

        const emitter = useEmitter();
        const store = useStore();
        const router = useRouter();
        const toast = useToast();

        const heeftSteekkaartleesRecht = () => {
            setTimeout(() => {
                return rechtenService.heeftSteekkaartLeesrecht(store.getters.profiel, 'steekkaart')
            }, 2000);
        }

        const state = reactive({
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'ledenlijst'
                },
            ],
            lidIds: new Set(),
            isLoadingFilters: true,
            isLoadingMore: false,
            isExporting: false,
            ledenDialog: false,
            isFilterCollapsed: false,
            isLoading: false,
            isSavingFilters: false,
            tableheaderIsSticky: true,
            hasLoadedFilters: false,
            dataLoaded: false,
            ledenAanLijstToevoegen: false,
            busy: false,
            end: false,
            offset: 0,
            totaalAantalLeden: 0,
            aantalPerPagina: 10,
            huidigeFilter: {},
            leden: [],
            actieveKolommen: [],
            filters: [],
            geselecteerdeLeden: [],
            deelFilter: false,
            criteria: [],
            activeCriteria: [],
            canPost: false,
            canShare: false,
            toPdf: false,
            isVgaOfLeiding: false,
            alleGeselecteerd: false,
            menuItems: [
                {
                    label: "Exporteren naar PDF",
                    condition: true,
                    icon: "fal fa-file-pdf",
                    link: "pdf",
                },
                {
                    label: "Exporteren naar CSV",
                    condition: true,
                    icon: "fal fa-file-csv",
                    link: "csv",
                },
                {
                    label: "E-mail versturen",
                    condition: true,
                    icon: "far fa-envelope",
                    link: "email",
                },
                {
                    label: "Etiketten maken",
                    condition: true,
                    icon: "far fa-tags",
                    link: "etiket",
                },
                {
                    label: "Individuele steekkaarten naar pdf",
                    condition: heeftSteekkaartleesRecht,
                    icon: "fal fa-file-pdf",
                    link: "steekkaart",
                },
                {
                    label: "Nieuw Lid",
                    condition: rechtenService.hasAccess("nieuw lid"),
                    icon: "far fa-user-plus",
                    link: "lidToevoegen",
                },
            ],
        })


        emitter.on('changeGeslachtCriterium', (event) => {
            changeGeslachtCriterium(event.criteria, event.selectedOption);
        })
        emitter.on('changeOudLidCriterium', (event) => {
            changeOudLidCriterium(event.criteria, event.selectedOption);
        })
        emitter.on('setActieveKolom', (event) => {
            setActieveKolom(event.kolom);
        })
        emitter.on('changeGroepCriterium', (event) => {
            changeGroepCriterium(event.criteria, event.selectedOptions);
        })
        emitter.on('changeLeeftijd', (event) => {
            changeLeeftijd(event.criteria, event.leeftijdOpDatum, event.jongerDan, event.ouderDan);
        })
        emitter.on('changeSteekkaartCriterium', (event) => {
            changeIndividueleSteekkaart(event.criteria, event.aangepast, event.datum);
        })
        emitter.on('changeGegKeuzeCriterium', (event) => {
            changeGegKeuze(event.criteria, event.veld, event.waarde, event.operator);
        })
        emitter.on('deactiveerGroepseigenGegeven', (event) => {
            deactiveerGroepseigenGegeven(event.criteria, event.veld);
        })
        emitter.on('activeerAlleFuncties', (event) => {
            activeerAlleFuncties(event.criteria);
        })
        emitter.on('activeerFunctie', (event) => {
            activeerFunctie(event.criteria, event.functie);
        })
        emitter.on('activeerAlleGroepFuncties', (event) => {
            activeerAlleGroepFuncties(event.criteria, event.groepering);
        })

        const activateCriterium = (criterium) => {
            if (criterium.criteriaKey === 'adresgeblokkeerd' || criterium.criteriaKey === 'verminderdLidgeld' || criterium.criteriaKey === 'emailgeblokkeerd') {
                state.huidigeFilter.criteria[criterium.criteriaKey] = true;
            }

            if (criterium.criteriaKey === 'functies') {
                emitter.emit('activateFunctieCriterium')
            }

            criterium.activated = true;
            state.activeCriteria.unshift(criterium);
        }

        const changeGeslachtCriterium = (criteria, gekozenGeslacht) => {
            state.huidigeFilter.criteria[criteria.criteriaKey] = gekozenGeslacht;
        }

        const deactiveerGroepseigenGegeven = (criteria, veld) => {
            if (state.huidigeFilter.criteria[criteria.criteriaKey]) {
                state.huidigeFilter.criteria[criteria.criteriaKey].forEach((item, index) => {
                    if (item.veld === veld) {
                        state.huidigeFilter.criteria[criteria.criteriaKey].splice(index, 1);
                    }
                })
            }
        }

        const gaNaar = (link) => {
            if (link === 'pdf' || link === 'csv' || link === 'steekkaart') {
                if (state.geselecteerdeLeden.length < 1) {
                    state.ledenDialog = true;
                    return;
                }
                exporteer(link)
            } else if (link === 'email' || link === 'etiket') {
                if (state.geselecteerdeLeden.length < 1) {
                    state.ledenDialog = true;
                    return;
                }
                verstuur(link)
            } else {
                router.push({name: link})
            }
        }

        const changeLeeftijd = (criteria, leeftijdOpDatum, jongerDan, ouderDan) => {
            if (!state.huidigeFilter.criteria[criteria.criteriaKey]) {
                state.huidigeFilter.criteria[criteria.criteriaKey] = {};
            }
            state.huidigeFilter.criteria[criteria.criteriaKey].op31december = leeftijdOpDatum;
            state.huidigeFilter.criteria[criteria.criteriaKey].jongerdan = jongerDan;
            state.huidigeFilter.criteria[criteria.criteriaKey].ouderdan = ouderDan;
        }

        const changeIndividueleSteekkaart = (criteria, aangepast, datum) => {
            if (!state.huidigeFilter.criteria[criteria.criteriaKey]) {
                state.huidigeFilter.criteria[criteria.criteriaKey] = {};
            }
            state.huidigeFilter.criteria[criteria.criteriaKey].operator = aangepast;
            state.huidigeFilter.criteria[criteria.criteriaKey].referentie = datum.toISOString().slice(0, 10);
        }

        const changeGegKeuze = (criteria, veld, waarde, operator) => {
            let gegObject = {
                operator: operator,
                waarde: waarde,
                veld: veld
            }
            if (!state.huidigeFilter.criteria[criteria.criteriaKey]) {
                state.huidigeFilter.criteria[criteria.criteriaKey] = [];
            } else {
                state.huidigeFilter.criteria[criteria.criteriaKey].forEach((item, index) => {
                    if (item.veld === veld) {
                        state.huidigeFilter.criteria[criteria.criteriaKey].splice(index, 1);
                    }
                })
            }
            state.huidigeFilter.criteria[criteria.criteriaKey].push(gegObject);
        }

        const changeGroepCriterium = (criteria, selectedOptions) => {
            state.huidigeFilter.criteria[criteria.criteriaKey] = selectedOptions;
        }

        const changeOudLidCriterium = (criteria, keuze) => {
            if (keuze === "alles") {
                state.huidigeFilter.criteria[criteria.criteriaKey] = null;
            } else {
                state.huidigeFilter.criteria[criteria.criteriaKey] = keuze;
            }
        }

        const filterOpslaan = (naam, delen, filterId) => {
            state.isLoading = true;
            if (filterId) {
                RestService.patchFilterOpId(state.huidigeFilter, filterId)
                    .then(res => {
                        if (res.status === 200) {
                            getFilters();
                            toast.add({
                                severity: "success",
                                summary: "Filter",
                                detail: "Filter opgeslagen",
                                life: 3000,
                            });
                        }
                    }).catch(error => {
                    if (error.response.status === 403) {
                        toast.add({
                            severity: "warn",
                            summary: error.response.data.titel,
                            detail: error.response.data.beschrijving,
                            life: 8000,
                        });
                    }
                }).finally(() => {
                    state.isLoading = false;
                })
            } else {
                state.huidigeFilter.id = null;
                state.huidigeFilter.delen = delen;
                state.huidigeFilter.naam = naam;
                RestService.saveFilter(state.huidigeFilter)
                    .then(res => {
                        if (res.status === 201) {
                            getFilters();
                            toast.add({
                                severity: "success",
                                summary: "Filter",
                                detail: "Filter opgeslagen.",
                                life: 3000,
                            });
                        }
                    }).catch(error => {
                    if (error.response.status === 403) {
                        toast.add({
                            severity: "warn",
                            summary: error.response.data.titel,
                            detail: error.response.data.beschrijving,
                            life: 8000,
                        });
                    }
                }).finally(() => {
                    state.isLoading = false;
                })
            }
        }

        const deactivateCriterium = (criterium) => {
            if (criterium.criteriaKey === 'adresgeblokkeerd' || criterium.criteriaKey === 'emailgeblokkeerd' || criterium.criteriaKey === 'verminderdLidgeld') {
                state.huidigeFilter.criteria[criterium.criteriaKey] = false;
            } else if (criterium.criteriaKey === 'geslacht' || criterium.criteriaKey === 'leeftijd' || criterium.criteriaKey === 'individuelesteekkaart') {
                state.huidigeFilter.criteria[criterium.criteriaKey] = undefined;
            } else {
                state.huidigeFilter.criteria[criterium.criteriaKey] = [];
            }
            let index = state.activeCriteria.indexOf(criterium);
            state.activeCriteria.splice(index, 1);
            criterium.activated = false;
        }

        const setNonActieveKolom = () => {
            state.actieveKolommen = ledenlijstService.indexeerEnGroepeerKolommen(state.kolommen);
            state.nonActieveKolommen = ledenlijstService.indexeerEnGroepeerNonActieveKolommen(state.kolommen);
        }

        const setActieveKolom = (kolom) => {
            if (kolom) {
                let index = state.huidigeFilter.sortering.indexOf(kolom.id);
                if (index > -1) {
                    state.huidigeFilter.sortering.splice(index, 1);
                }
            }
            state.actieveKolommen = ledenlijstService.indexeerEnGroepeerKolommen(state.kolommen);
            state.nonActieveKolommen = ledenlijstService.indexeerEnGroepeerNonActieveKolommen(state.kolommen);
        }

        const close = () => {
            state.ledenDialog = false;
        }

        const checkSortering = (kolom) => {
            let mapping = {
                'be.vvksm.groepsadmin.model.column.VVKSMGroepsNamenColumn': 'be.vvksm.groepsadmin.model.column.VVKSMGroepenColumn',
                'be.vvksm.groepsadmin.model.column.VVKSMGroepsNummersColumn': 'be.vvksm.groepsadmin.model.column.VVKSMGroepenColumn',
                'be.vvksm.groepsadmin.model.column.LeeftijdColumn': 'be.vvksm.groepsadmin.model.column.GeboorteDatumColumn'
            };

            let kolomnaam = kolom.id;
            if (kolom.sorteringsIndex === -1 && mapping[kolom.id] !== undefined) {
                kolomnaam = mapping[kolom.id];
            }
            return state.huidigeFilter.sortering.indexOf(kolomnaam);
        }

        const filterToepassen = () => {
            state.isLoading = true;
            state.offset = 0;
            let actKolommen = [];
            state.actieveKolommen.forEach(kolom => {
                actKolommen.push(kolom.id);
            })
            state.huidigeFilter.kolommen = actKolommen;
            RestService.patchHuidigeFilter(state.huidigeFilter)
                .then(res => {
                    state.huidigeFilter = res.data;
                    state.leden = [];
                    getLeden();
                    getFilters();
                    ledenlijstFilter.getCriteria();
                    activeerKolommen();
                })

        }

        const aantalLedenGeladen = computed(() =>  {
            return state.leden.length;
        })

        const aantalIds = computed(() => {
            return state.lidIds.size;
        })

        const filteredMenuItems = computed(() => {
            return state.menuItems.filter(obj => {
                return obj.condition;
            });
        })

        const addSort = (kolom) => {
            if (checkSortering(kolom) === -1) {
                state.huidigeFilter.sortering.unshift(kolom.id)
                state.huidigeFilter.sortering.splice(3);
            }
            kolom.sorteringsIndex = checkSortering(kolom);
            filterToepassen();
        }

        const veranderFilter = (filter) => {
            state.leden = [];
            state.isLoading = true
            if (state.huidigeFilter.id !== filter.id) {
                RestService.getFilterOpId(filter.id)
                    .then(res => {
                        if (res.status === 200) {
                            let nieuweFilter = {
                                criteria: res.data.criteria,
                                groepen: res.data.groepen,
                                kolommen: res.data.kolommen,
                                links: res.data.links,
                                sortering: res.data.sortering,
                                type: res.data.type
                            }
                            RestService.patchHuidigeFilter(nieuweFilter)
                                .then(res => {
                                    state.huidigeFilter = res.data;
                                    state.offset = 0;
                                    getLeden();
                                    getKolommen();
                                })
                        }
                    })
            }
        }

        const activeerAlleFuncties = (criteria) => {
            criteria.itemgroups.forEach(group => {
                group.items.forEach(item => {
                    if (!state.huidigeFilter.criteria[criteria.criteriaKey].includes(item.value)) {
                        state.huidigeFilter.criteria[criteria.criteriaKey].push(item.value)
                    }
                })
            })
        }

        const activeerFunctie = (criteria, functie) => {
            if (!state.huidigeFilter.criteria[criteria.criteriaKey]) {
                state.huidigeFilter.criteria[criteria.criteriaKey] = [];
            }
            if (state.huidigeFilter.criteria[criteria.criteriaKey].includes(functie.value)) {
                let index = state.huidigeFilter.criteria[criteria.criteriaKey].indexOf(functie.value);
                state.huidigeFilter.criteria[criteria.criteriaKey].splice(index, 1);
            } else {
                state.huidigeFilter.criteria[criteria.criteriaKey].push(functie.value);
            }
        }

        const activeerAlleGroepFuncties = (criteria, groepering) => {
            if (!state.huidigeFilter.criteria[criteria.criteriaKey]) {
                state.huidigeFilter.criteria[criteria.criteriaKey] = [];
            }

            criteria.itemgroups.forEach(group => {
                if (group.label === groepering) {
                    group.items.forEach(item => {
                        if (!state.huidigeFilter.criteria[criteria.criteriaKey].includes(item.value)) {
                            state.huidigeFilter.criteria[criteria.criteriaKey].push(item.value)
                        }
                    })
                }
            })
        }

        const selectLid = (event) => {
            if (
                event.originalEvent.target.className !== "p-selection-column" &&
                event.originalEvent.target.className !== "p-checkbox-icon"
            ) {
                router.push({name: "Lid", params: {id: event.data.id}});
            }
        }

        const menu = ref(null);

        const toggle = (event) => {
            menu.value.toggle(event);
        }

        const getLeden = () => {
            state.offset === 0
                ? (state.isLoading = true)
                : (state.isLoadingMore = true);
            RestService.getLeden(state.offset)
                .then((res) => {
                    state.aantalLedenGeladen = res.data.aantal;
                    state.totaalAantalLeden = res.data.totaal;
                    res.data.leden.forEach((lid) => {
                        state.leden.push(lid);
                    });
                    state.offset = state.leden.length;
                    filterLeden();
                })
                .catch((error) => {
                    console.log(error);
                    state.error = true;
                    toast.add({
                        severity: "error",
                        summary: "Ophalen leden",
                        detail: error.message,
                        life: 8000,
                    });
                })
                .finally(() => {
                    state.isLoading = false;
                    state.isLoadingMore = false;
                });
        }

        const getKolommen = () => {
            state.kolommen = store.getters.kolommen;
            if (!state.kolommen) {
                RestService.getKolomType().then((res) => {
                    state.kolommen = res.data.kolommen;
                    store.commit("setKolommen", res.data.kolommen);
                    activeerKolommen();
                    state.isLoading = false;
                });
            } else {
                activeerKolommen();
            }
        }

        const getFilters = () => {
            state.isLoadingFilters = true;
            RestService.getFilters().then(res => {
                state.filters = ledenlijstFilter.groepeerFilters(res.data.filters)
            }).catch(error => {
                console.log(error)
            }).finally(() => {
                state.isLoadingFilters = false;
            })
        }


        const getHuidigeFilter = () => {
            state.isLoadingFilters = true;
            RestService.getHuidigeFilter()
                .then((res) => {
                    state.huidigeFilter = res.data;
                    getKolommen();
                    state.criteria = ledenlijstFilter.getCriteria();
                    state.activeCriteria = ledenlijstFilter.getActieveCriteria(state.huidigeFilter, state.criteria);
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    state.isLoadingFilters = false;
                });
        }

        const activeerKolommen = () => {
            state.actieveKolommen = ledenlijstService.activeerKolommen(state.huidigeFilter, state.kolommen);
            state.nonActieveKolommen = ledenlijstService.indexeerEnGroepeerNonActieveKolommen(state.kolommen);
        }

        const exporteer = (type) => {
            if (state.geselecteerdeLeden.length) {
                filterLeden();
            }
            let ledenIds = {
                lidIds: Array.from(state.lidIds),
            };

            if (state.lidIds.size > 0) {
                state.isLoading = true;
                if (type === "csv") {
                    RestService.getLedenCsv(0, ledenIds)
                        .then((res) => {
                            let obj = {};
                            let blob = new Blob([res.data], {type: "text/csv"});
                            obj.fileUrl = window.URL.createObjectURL(blob);
                            obj.title = "ledenlijst.csv";
                            downloadFile(obj);
                        }).catch((error) => {
                        console.log(error);
                    }).finally(() => {
                        state.isLoading = false;
                    });
                }
                if (type === "pdf") {
                    RestService.getLedenPdf(0, ledenIds)
                        .then((res) => {
                            if (res.data) {
                                let obj = {};
                                let blob = new Blob([res.data], {type: "application/pdf"});
                                obj.fileUrl = window.URL.createObjectURL(blob);
                                obj.title = "ledenlijst.pdf";
                                downloadFile(obj);
                            }
                        }).catch((error) => {
                        console.log(error);
                    }).finally(() => {
                        state.isLoading = false;
                    })
                }
                if (type === "steekkaart") {
                    RestService.getLedenSteekkaartPdf(ledenIds)
                        .then((res) => {
                            if (res.data) {
                                let obj = {};
                                let blob = new Blob([res.data], {type: "application/pdf"});
                                obj.fileUrl = window.URL.createObjectURL(blob);
                                obj.title = "steekkaarten.pdf";
                                downloadFile(obj);
                            }
                        }).catch((error) => {
                        let result = ErrorService.handleError(error);
                        toast.add({
                            severity: result.severity,
                            summary: result.summary,
                            detail: result.detail,
                            life: 8000,
                        });
                    }).finally(() => {
                        state.isLoading = false;
                    })
                }
            }
        }

        const downloadFile = (obj) => {
            var a = document.createElement("a");
            a.href = obj.fileUrl;
            a.download = obj.title;
            document.body.appendChild(a);
            a.click();
        }

        const filterLeden = () => {
            state.lidIds = new Set();
            state.geselecteerdeLeden.forEach((lid) => {
                state.lidIds.add(lid.id);
            });
        }

        const aantalLedenGeselecteerd = () => {
            return state.geselecteerdeLeden.length;
        }

        const selecteerAlleLeden = () => {
            getLeden();
        }

        const clearAlleLeden = () => {
            state.lidIds.clear();
        }

        const selecteerLid = () => {
            filterLeden();
        }

        const verstuur = (type) => {
            filterLeden();
            store.commit("setGeselecteerdeLeden", state.geselecteerdeLeden);
            store.commit("setLidIds", state.lidIds);
            if (type === "email") {
                router.push({name: "Mail"});
            }
            if (type === "etiket") {
                router.push({name: "Etiket"});
            }
        }

        const isWaardeTrue = (value) => {
            return value === '<input type="checkbox" disabled checked/>';
        }

        const isWaardeFalse = (value) => {
            return value === '<input type="checkbox" disabled/>';
        }

        getLeden();
        getHuidigeFilter();
        getFilters();

        return {
            state,
            activateCriterium,
            heeftSteekkaartleesRecht,
            gaNaar,
            deactivateCriterium,
            setNonActieveKolom,
            setActieveKolom,
            addSort,
            checkSortering,
            selectLid,
            veranderFilter,
            aantalLedenGeselecteerd,
            selecteerAlleLeden,
            clearAlleLeden,
            selecteerLid,
            close,
            isWaardeTrue,
            isWaardeFalse,
            aantalLedenGeladen,
            aantalIds,
            filteredMenuItems,
            filterToepassen,
            filterOpslaan,
            getLeden,
            menu,
            toggle
        }
    }
}
