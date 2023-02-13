import {reactive} from "@vue/reactivity";
import useEmitter from "@/services/utils/useEmitter";

export default {

    dynamischVeldSpace(props) {
        const emitter = useEmitter()

        const state = reactive({
            schema: props.veld,
            waarde: props.modelValue,
            keuzes: []
        });

        const isChecked = (id) => {
            console.log(state.waarde[id])
            return state.waarde[id] === "true";
        }

        const changeValue = (veld, waarde) => {
            emitter.emit("changeGeg", {'veld': veld, 'waarde': waarde, 'groep': props.groepIndex});
        }

        const vulOpties = (options) => {
            options.forEach(function (optie) {
                state.keuzes.push({label: optie, value: optie});
            });
            return state.keuzes;
        }

        return {
            state,
            isChecked,
            changeValue,
            vulOpties
        }
    }
}
