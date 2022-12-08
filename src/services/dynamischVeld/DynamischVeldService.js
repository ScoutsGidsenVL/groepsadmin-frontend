import mitt from "mitt";
import {reactive} from "@vue/reactivity";

export default {

    dynamischVeldSpace(props) {
        const emitter = mitt();

        const state = reactive({
            schema: props.veld,
            waarde: props.modelValue,
            keuzes: []
        });

        const isChecked = (id) => {
            return state.waarde[id] === "true" || state.waarde[id];
        }

        const changeValue = (veld, waarde) => {
            emitter.emit("changeGeg", {'veld': veld, 'waarde': waarde, 'groep': props.groepIndex});
        }

        const vulOpties = (options) => {
            options.forEach(function (optie) {
                state.keuzes.push({label: optie, value: optie});
            });
        }

        return {
            state,
            isChecked,
            changeValue,
            vulOpties
        }
    }
}
