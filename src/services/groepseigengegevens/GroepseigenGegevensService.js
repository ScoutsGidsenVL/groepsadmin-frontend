import {reactive} from "@vue/reactivity";
import {useStore} from "vuex";
import {computed, onMounted} from "vue";

export default {

    groepsEigenGegevensSpace(props) {

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

        return {
            state,
            groepNaam,
            groepenLaden,
            groepen
        }


    }


}
