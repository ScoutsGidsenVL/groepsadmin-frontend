import {reactive} from "@vue/reactivity";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import RestService from "@/services/api/RestService";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";

export default {

    inschrijvingVerstuurdSpace() {

        const route = useRoute();
        const store = useStore();
        const toast = useToast();

        const state = reactive({
            groep: null,
            groepsnummer: '',
            voornaam: '',
        })

        onMounted(() => {
            state.groepsnummer = route.params.groep;
            if (state.groepsnummer) {
                getGroepData();
            }
            state.voornaam = store.getters.kandidaatLid;
        })

        const getGroepData = () => {
            RestService.getGroepOpNummer(state.groepsnummer)
                .then(res => {
                    state.groep = res.data;
                }).catch(error => {
                toast.add({
                    severity: "error",
                    summary: "Groep ophalen",
                    detail: error.message,
                    life: 8000,
                });
            })
        }


        return {
            state
        }
    }

}
