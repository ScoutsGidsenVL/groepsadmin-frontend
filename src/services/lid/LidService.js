import {reactive} from "@vue/reactivity";
import {useRoute} from "vue-router";
import useEmitter from "@/services/utils/useEmitter";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";

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
            watchable: false,
            changes: false,
            id: "",

            changed: true,
            loadingLid: true,
            gewijzigdLid: {},
            lid: null,
            gesorteerdeFuncties: {},
            groepseigenVelden: {}
        })

        const route = useRoute();
        const emitter = useEmitter();
        const confirm = useConfirm();
        const toast = useToast();
        const store = useStore();

        return {
            state, route, emitter, confirm, toast, store
        }
    }


}
