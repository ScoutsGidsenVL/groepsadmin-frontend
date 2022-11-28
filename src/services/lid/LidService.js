import {reactive} from "@vue/reactivity";
import {useRoute, useRouter} from "vue-router";
import useEmitter from "@/services/utils/useEmitter";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import {helpers, required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";

let _ = require('lodash');

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
        const rules = {
            "lid.adressen": {
                $each: helpers.forEach({
                    land: {
                        required
                    },
                    postcode: {
                        required
                    },
                    gemeente: {
                        required
                    },
                    nummer: {
                        required
                    },
                    straat: {
                        required
                    }
                })
            }
        }

        const v = useVuelidate(rules, state  );

        const compare = (obj1, obj2) => {
            return _.isEqual(obj1, obj2)
        }

        return {
            state, route, router, emitter, confirm, toast, store, compare, v
        }
    }

}
