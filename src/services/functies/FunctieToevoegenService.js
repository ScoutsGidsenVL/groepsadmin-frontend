import {reactive} from "@vue/reactivity";
import {onMounted} from "vue";
import moment from "moment";
import rechtenService from "@/services/rechten/rechtenService";
import {useStore} from "vuex";
import {onUpdated} from "@vue/runtime-core";

export default {

    functieToevoegenSpace(props, context) {
        const store = useStore();
        const state = reactive({
            huidigLid: props.modelValue,
            laden: false,
            functiesEnGroepenGeladen: false,
            showFunctieToevoegen: false,
            changes: false,
            groepEnfuncties: [],
            geselecteerdeFuncties: {}
        })

        onUpdated(() => {
            state.huidigLid = props.modelValue;
            functiesEnGroepen();
        })

        const gesorteerdeFuncties = (functies, type) => {

            let relevanteFuncties = [];
            if (state.huidigLid && state.huidigLid.vgagegevens && state.huidigLid.vgagegevens.geboortedatum) {
                relevanteFuncties = functies.filter(obj => {
                    return !obj.uiterstegeboortedatum || moment(state.huidigLid.vgagegevens.geboortedatum).isBefore(moment(obj.uiterstegeboortedatum)) ;
                });
            } else {
                relevanteFuncties = functies;
            }

            relevanteFuncties.sort(function (a, b) {
                if (a.beschrijving < b.beschrijving) {
                    return -1;
                }
                if (a.beschrijving > b.beschrijving) {
                    return 1;
                }
                return 0;
            })

            return relevanteFuncties.filter(obj => {
                return obj.type === type;
            });
        }

        const functiesEnGroepen = () => {
            state.groepEnfuncties = [];
            store.getters.groepen.forEach(groep => {
                if (rechtenService.hasPermission('functies.' + groep.groepsnummer)) {
                    state.geselecteerdeFuncties[groep.groepsnummer] = [];
                    let tempGroep = groep;
                    tempGroep.functies = [];
                    store.getters.functies.forEach(functie => {
                        let bestaandeFunctie = false;
                        if (state.huidigLid && state.huidigLid.functies) {
                            state.huidigLid.functies.forEach(lidFunctie => {
                                if (lidFunctie.groep === groep.groepsnummer && lidFunctie.functie === functie.id && !lidFunctie.einde) {
                                    bestaandeFunctie = true;
                                }
                            })
                        }
                        if (functie.groepen.indexOf(tempGroep.groepsnummer) !== -1 && !bestaandeFunctie) {
                            tempGroep.functies.push(functie);
                        }
                    });
                    state.groepEnfuncties.push(tempGroep);
                }
            });
            state.functiesEnGroepenGeladen = true;
            state.showFunctieToevoegen = false;

            state.groepEnfuncties.forEach(groep => {
                state.showFunctieToevoegen |= rechtenService.hasPermission('functies.' + groep.groepsnummer);
            });
        }

        const groepsNaam = (index) => {
            let groep = store.getters.groepen[index];
            if (groep) {
                return groep.naam + " - " + groep.groepsnummer;
            }
        }

        const voegToeOfVerwijderFunctie = (functie, groepsnummer) => {
            state.changes = true;

            let functieInstantie = {};
            functieInstantie.functie = functie.id;
            functieInstantie.groep = groepsnummer;
            functieInstantie.begin = new Date(); // set static date
            functieInstantie.temp = "tijdelijk";

            let bestaandeFunctie = false;

            if (!bestaandeFunctie) {
                context.emit('voegFunctieToe', {'functie': functieInstantie, 'groepsnummer': groepsnummer});
            }
        }

        onMounted(() => {
            functiesEnGroepen()
        })

        return {
            state,
            gesorteerdeFuncties,
            groepsNaam,
            voegToeOfVerwijderFunctie,
            functiesEnGroepen
        }

    }

}
