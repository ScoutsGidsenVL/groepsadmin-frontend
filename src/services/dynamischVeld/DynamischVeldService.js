import {reactive} from "@vue/reactivity";
import useEmitter from "@/services/utils/useEmitter";
import {onUpdated} from "@vue/runtime-core";

export default {

    dynamischVeldSpace(props) {
        const emitter = useEmitter()

        const state = reactive({
            schema: props.veld,
            waarde: props.modelValue,
            keuzes: []
        });

        const isChecked = (id) => {
            return state.waarde[id] === "true";
        }

        const changeValue = (veld, waarde) => {
            emitter.emit("changeGeg", {'veld': veld, 'waarde': waarde, 'groep': props.groepIndex});
        }

        const vulOpties = (options) => {
            let keuzes = [];
            options.forEach(function (optie) {
                keuzes.push({label: optie, value: optie});
            });
            return keuzes;
        }

        onUpdated(() => {
            state.waarde = props.modelValue;
        })

        return {
            state,
            isChecked,
            changeValue,
            vulOpties
        }
    }
}
